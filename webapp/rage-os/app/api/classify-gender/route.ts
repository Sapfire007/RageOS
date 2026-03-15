import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json()

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      console.warn('[classify-gender] OPENROUTER_API_KEY not set')
      return NextResponse.json({ gender: 'unknown', debug: 'no-api-key' })
    }

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://rageos.app',
        'X-OpenRouter-Title': 'RageOS',
      },
      body: JSON.stringify({
        model: 'openrouter/healer-alpha',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'You are a gender classification system. Look ONLY at the person in this photo. Respond with a single JSON object like {"gender":"male"} or {"gender":"female"}. No explanation, no other text.',
              },
              {
                type: 'image_url',
                image_url: { url: image },
              },
            ],
          },
        ],
      }),
    })

    const result = await res.json()
    const rawText = (result.choices?.[0]?.message?.content ?? '').trim()
    console.log('[classify-gender] raw response:', rawText)

    let gender = 'male'
    try {
      const parsed = JSON.parse(rawText)
      gender = parsed.gender === 'female' ? 'female' : 'male'
    } catch {
      const lower = rawText.toLowerCase()
      gender = lower.includes('female') || lower.includes('woman') || lower.includes('girl') ? 'female' : 'male'
    }

    console.log('[classify-gender] classified as:', gender)
    return NextResponse.json({ gender, debug: rawText })
  } catch (err) {
    console.error('[classify-gender] OpenRouter error:', err)
    return NextResponse.json({ gender: 'unknown', debug: 'error' })
  }
}
