import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { name } = await req.json()
  if (!name) return NextResponse.json({ dyslexicName: name })

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return NextResponse.json({ dyslexicName: name })

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/hunter-alpha',
        messages: [
          {
            role: 'user',
            content: `You are a dyslexic name transformer for a joke OS called RageOS. Convert the name "${name}" into a dyslexic, glitched, slightly corrupted version. Rules: swap some letters (b↔d, p↔q, n↔u, m↔w), reverse short letter clusters, replace some letters with similar-looking numbers (3=e, 0=o, 1=i or l). Keep it roughly the same length and still vaguely recognisable. Return ONLY the corrupted name — no explanation, no punctuation, no quotes. Just the name.`,
          },
        ],
        reasoning: { enabled: true },
      }),
    })

    const result = await res.json()
    const dyslexicName = result.choices?.[0]?.message?.content?.trim() ?? name
    return NextResponse.json({ dyslexicName })
  } catch {
    return NextResponse.json({ dyslexicName: name })
  }
}
