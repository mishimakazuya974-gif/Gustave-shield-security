// This function runs on Netlify's servers, never in the visitor's browser.
// Your OPENROUTER_API_KEY stays secret here — set it in Netlify's dashboard
// under Site settings > Environment variables. Never commit it to git,
// and never paste it in chat, code comments, or anywhere public.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server misconfigured: missing API key" }) };
  }

  let message, lang;
  try {
    ({ message, lang } = JSON.parse(event.body || "{}"));
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  // Basic input guardrails — protects your API budget from abuse
  if (!message || typeof message !== "string" || message.length > 4000) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid input" }) };
  }

  const langName = lang === "en" ? "English" : lang === "es" ? "Spanish" : "French";

  try {
    const apiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [
          {
            role: "user",
            content: `You are a cybersecurity analyst. Analyze the following message or URL for signs of phishing, social engineering, or scams. Reply ONLY with valid JSON, no text before or after, no markdown fences, in this exact format:
{"risk_level": "faible|moyen|élevé", "risk_score": 0-100, "red_flags": ["flag 1", "flag 2"], "explanation": "short explanation, 2-3 sentences, written in ${langName}", "recommendation": "concrete recommended action, written in ${langName}"}

Message to analyze:
"""
${message}
"""`,
          },
        ],
      }),
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return { statusCode: apiRes.status, body: JSON.stringify({ error: data?.error?.message || "OpenRouter API error" }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server error" }) };
  }
};
