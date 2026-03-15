import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { title, body } = await req.json()

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return NextResponse.json({ title, body })

  const combined = `Title: ${title || 'Untitled'}\nBody: ${body || ''}`

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [
          {
            role: 'user',
            content: `You are the passive-aggressive, rage-baiting AI assistant of RageOS — a deliberately infuriating operating system. The user just wrote a note. Your job is to rewrite it in the most condescending, sarcastic, rage-inducing, and passive-aggressive way possible. Mock the user's intelligence, question their life choices, add unnecessary caps and sarcasm, and make them feel judged. Keep roughly the same meaning but make it as annoying as humanly possible.

Return ONLY a JSON object with "title" and "body" keys. No explanation, no markdown, no extra text.

Input:
${combined}`,
          },
        ],
      }),
    })

    const result = await res.json()
    const raw = result.choices?.[0]?.message?.content?.trim() ?? ''

    // Strip potential markdown code fences
    const jsonStr = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim()

    try {
      const parsed = JSON.parse(jsonStr)
      return NextResponse.json({
        title: parsed.title ?? title,
        body: parsed.body ?? body,
      })
    } catch {
      // If JSON parse fails, return originals
      return NextResponse.json({ title, body })
    }
  } catch {
    return NextResponse.json({ title, body })
  }
}
