import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import dns from 'dns';
import { promisify } from 'util';
import { GoogleGenAI } from '@google/genai';
import { isGeminiConfigured } from '@/lib/supabase/env';

const lookupAsync = promisify(dns.lookup);

// IP blocklist for SSRF prevention
function isPrivateIp(ip: string): boolean {
  // IPv4 checks
  if (
    ip.startsWith('127.') || // Loopback
    ip.startsWith('10.') || // 10.0.0.0/8
    ip.startsWith('192.168.') || // 192.168.0.0/16
    ip.startsWith('169.254.') || // Link-local / AWS metadata
    ip === '0.0.0.0'
  ) {
    return true;
  }

  // 172.16.0.0 to 172.31.255.255
  if (ip.startsWith('172.')) {
    const parts = ip.split('.').map(Number);
    if (parts[1] >= 16 && parts[1] <= 31) {
      return true;
    }
  }

  // IPv6 checks
  if (
    ip === '::1' ||
    ip.toLowerCase().startsWith('fc') ||
    ip.toLowerCase().startsWith('fd') ||
    ip.toLowerCase().startsWith('fe80')
  ) {
    return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: 'Only HTTP and HTTPS protocols are allowed' },
        { status: 400 }
      );
    }

    // SSRF Check: DNS resolution
    try {
      const { address } = await lookupAsync(parsedUrl.hostname);
      if (isPrivateIp(address)) {
        return NextResponse.json(
          { error: 'Access to private or local network addresses is forbidden' },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: `Could not resolve hostname "${parsedUrl.hostname}"` },
        { status: 400 }
      );
    }

    // Fetch page content with strict timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let htmlContent = '';
    try {
      const response = await fetch(parsedUrl.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9',
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch webpage (HTTP status ${response.status})` },
          { status: 400 }
        );
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
        return NextResponse.json(
          { error: 'Target URL does not return HTML or plain text' },
          { status: 400 }
        );
      }

      htmlContent = await response.text();
    } catch (err: unknown) {
      const e = err as Error;
      if (e.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Connection timed out while fetching webpage' },
          { status: 408 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch page: ${e.message}` },
        { status: 500 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    // Parse HTML safely with Cheerio (No code execution)
    const $ = cheerio.load(htmlContent);
    $('script, style, noscript, svg, nav, footer, iframe').remove();

    const pageTitle = $('title').text().trim() || $('h1').first().text().trim();
    const metaDescription =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      '';

    let bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    if (bodyText.length > 12000) {
      bodyText = bodyText.substring(0, 12000);
    }

    // Check Gemini API Configuration
    if (!isGeminiConfigured()) {
      // Return structured fallback based on HTML metadata so user can still review and edit!
      return NextResponse.json({
        extracted: {
          title: pageTitle || 'Untitled Opportunity',
          organisation: parsedUrl.hostname.replace('www.', '').split('.')[0],
          category: 'Other',
          description: metaDescription || bodyText.substring(0, 400),
          eligibility: '',
          required_documents: ['Resume'],
          deadline: null,
          location: '',
          url: parsedUrl.toString(),
        },
        notice:
          'Gemini API key is not configured in .env.local. Extracted basic metadata from HTML. Add GEMINI_API_KEY for advanced AI extraction.',
      });
    }

    // Call Gemini with Google Gen AI SDK
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `You are an expert opportunity parser. Extract structured details about the student opportunity (internship, scholarship, hackathon, fellowship, job, or grant) from the webpage content below.

SOURCE URL: ${parsedUrl.toString()}
PAGE TITLE: ${pageTitle}
META DESCRIPTION: ${metaDescription}
PAGE TEXT:
${bodyText}

RULES:
1. Category must be strictly one of: 'Internship', 'Scholarship', 'Hackathon', 'Fellowship', 'Job', 'Other'.
2. NEVER invent or hallucinate a deadline, eligibility requirement, or document. If not explicitly found in the source text, set deadline to null, and eligibility to "".
3. If deadline is present, format it as an ISO 8601 string (e.g. "2026-11-15T23:59:59Z").
4. Return ONLY valid JSON matching this exact schema:
{
  "title": "string",
  "organisation": "string",
  "category": "Internship" | "Scholarship" | "Hackathon" | "Fellowship" | "Job" | "Other",
  "description": "string",
  "eligibility": "string",
  "required_documents": ["string"],
  "deadline": "string ISO 8601" | null,
  "location": "string"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '';
    let parsedData;
    try {
      parsedData = JSON.parse(outputText);
    } catch {
      // Attempt cleanup if wrapped in markdown block
      const cleanJson = outputText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    // Validate categories
    const validCategories = [
      'Internship',
      'Scholarship',
      'Hackathon',
      'Fellowship',
      'Job',
      'Other',
    ];
    if (!validCategories.includes(parsedData.category)) {
      parsedData.category = 'Other';
    }

    return NextResponse.json({
      extracted: {
        title: parsedData.title || pageTitle,
        organisation: parsedData.organisation || parsedUrl.hostname,
        category: parsedData.category,
        description: parsedData.description || metaDescription,
        eligibility: parsedData.eligibility || '',
        required_documents: Array.isArray(parsedData.required_documents)
          ? parsedData.required_documents
          : [],
        deadline: parsedData.deadline || null,
        location: parsedData.location || '',
        url: parsedUrl.toString(),
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('URL extraction error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to extract opportunity details' },
      { status: 500 }
    );
  }
}
