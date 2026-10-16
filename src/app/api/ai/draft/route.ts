import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { isGeminiConfigured } from '@/lib/supabase/env';
import { DraftType } from '@/types/database';

interface DraftRequestBody {
  draftType: DraftType;
  tone: 'Professional' | 'Enthusiastic' | 'Confident' | 'Direct';
  promptQuestion?: string;
  opportunity: {
    title: string;
    organisation: string;
    category: string;
    description?: string;
    eligibility?: string;
    required_documents?: string[];
  };
  profile: {
    full_name?: string;
    university?: string;
    degree?: string;
    graduation_year?: string;
    skills?: string[];
    projects?: string;
    work_experience?: string;
    achievements?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: DraftRequestBody = await req.json();
    const { draftType, tone, promptQuestion, opportunity, profile } = body;

    if (!draftType || !opportunity?.title || !opportunity?.organisation) {
      return NextResponse.json(
        { error: 'Missing required opportunity or draft parameters' },
        { status: 400 }
      );
    }

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        {
          error:
            'Gemini API key is not configured. Please add GEMINI_API_KEY to your .env.local file.',
          unconfigured: true,
        },
        { status: 503 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemPrompt = `You are ApplyPilot's expert career coach and application strategist for university students.
Your goal is to write high-impact, authentic, and tailored application drafts or emails that highlight the candidate's actual projects, technical skills, and achievements directly relevant to the target opportunity.

IMPORTANT RULES:
1. Ground your response STRICTLY in the candidate's actual background (skills, projects, work experience). Do NOT fabricate false degrees, previous employers, or unverified claims.
2. Tone requested: ${tone || 'Professional'}.
3. Keep emails concise, respectful of recruiter/organizer time (typically 120-220 words for cold/follow-up emails).
4. If writing an application answer, directly address the user's question with specific technical STAR-style examples from their projects or experience.
5. Return JSON ONLY with:
   - "subject": A punchy, professional subject line (or a short heading if it's an application essay)
   - "body": The full draft body ready to review, personalize, and copy
   - "keyPointsUsed": Array of 2-4 key candidate strengths highlighted in this draft.`;

    const userPrompt = `
TARGET OPPORTUNITY:
- Role/Opportunity: ${opportunity.title}
- Organisation: ${opportunity.organisation}
- Category: ${opportunity.category}
- Description: ${opportunity.description || 'N/A'}
- Eligibility: ${opportunity.eligibility || 'N/A'}
- Required Documents: ${opportunity.required_documents?.join(', ') || 'N/A'}

CANDIDATE PROFILE:
- Name: ${profile.full_name || 'Candidate'}
- University & Degree: ${profile.university || 'University'} - ${profile.degree || 'Degree'} (Class of ${profile.graduation_year || 'N/A'})
- Skills: ${profile.skills?.join(', ') || 'Not specified'}
- Key Projects: ${profile.projects || 'None listed'}
- Work Experience: ${profile.work_experience || 'None listed'}
- Notable Achievements: ${profile.achievements || 'None listed'}

DRAFT REQUEST:
- Draft Type: ${draftType}
${promptQuestion ? `- Specific Prompt/Question to Answer: "${promptQuestion}"` : ''}
- Desired Tone: ${tone}

Draft the response now as valid JSON.`;

    // Resilient generation with fallback across current models
    let response;
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
    let lastErr;

    for (const model of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: `${systemPrompt}\n\n${userPrompt}`,
          config: {
            responseMimeType: 'application/json',
          },
        });
        if (response) break;
      } catch (err: unknown) {
        lastErr = err;
        const msg = (err as Error).message || '';
        if (msg.includes('503') || msg.includes('404') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
          continue;
        }
        throw err;
      }
    }

    if (!response) {
      throw lastErr || new Error('Failed to generate response from Gemini API');
    }

    const outputText = response.text || '';
    let parsedResult;
    try {
      parsedResult = JSON.parse(outputText);
    } catch {
      const cleanJson = outputText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResult = JSON.parse(cleanJson);
    }

    return NextResponse.json({
      subject: parsedResult.subject || `${opportunity.title} Application - ${profile.full_name || 'Candidate'}`,
      body: parsedResult.body || outputText,
      keyPointsUsed: Array.isArray(parsedResult.keyPointsUsed) ? parsedResult.keyPointsUsed : [],
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('AI draft generation error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate draft' },
      { status: 500 }
    );
  }
}
