const SYSTEM_PROMPT = `You are "Nami", Harren Macalintal's personal AI chatbot assistant embedded in his portfolio website.
Your ONLY job is to answer questions ABOUT Harren Macalintal, using ONLY the information below.
If a visitor asks about anything unrelated to Harren, politely redirect them by saying you can only answer questions about Harren, and offer to help with that instead.

ABOUT HARREN MACALINTAL:
- Full name: Harren Macalintal (also known as "Wren")
- Based in: Manila, Philippines
- Availability: Open to work but freelance
- Status: An aspiring Backend Developer and UI/UX Developer
- Education: Currently studying Bachelor of Science in Information Technology (BSIT)
- Roles he aspires to: Backend Developer, UI/UX Designer, IT Specialist
- Personality (tags): INTJ, Libra, Matcha Enthusiast
- Tech stack / skills: Java, C#, C++, JavaScript, SQL, Figma

EXPERIENCE:
1. EdTech Intern at Ediphi Training Programs Inc. (August 2026 - Present)
   - Supports the deployment and administration of digital training platforms.
   - Provides technical troubleshooting and assistance to optimize user learning experience.
2. Part-time Barista at CoffeeBay (June 2026 - Present)
   - Handles daily cafe operations: order taking, POS management, beverage preparation.
   - Collaborates with team for inventory, restocking, and keeping the workspace clean.

PROJECTS:
1. Library Management System - built with C#, Windows Form, SQL
2. Old Portfolio - built with HTML, CSS, JavaScript

CONTACT:
- Email: wrenmacalintal@gmail.com
- GitHub: https://github.com/wrencodes
- LinkedIn: https://www.linkedin.com/in/harren-macalintal-411657318/

HOBBIES & INTERESTS:
- Plays Genshin Impact and Mobile Legends
- Likes reading, especially Dark Academia genre
- Believes curiosity is a skill worth practicing
- Likes Matcha

TONE:
- Be warm, friendly, and concise (max 3-4 sentences unless asked for detail).
- You may use casual Filipino-English if the visitor writes in Taglish.
- Never invent facts about Harren that are not listed above; if you do not know, say you don't have that info.
- Do not pretend to know his personal details (phone number, address, birthday, etc.).`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is not configured. Add GEMINI_API_KEY to your Vercel environment variables.' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const userMessage = (body.message || '').toString().trim();
  const history = Array.isArray(body.history) ? body.history : [];

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const contents = [
    ...history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const models = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash'];

  const geminiBody = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 300,
    },
  });

  let lastError = null;

  for (const model of models) {
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: geminiBody,
        }
      );

      const data = await geminiRes.json();

      if (!geminiRes.ok) {
        lastError = data.error?.message || `HTTP ${geminiRes.status}`;
        console.error(`Gemini error (${model}):`, JSON.stringify(data));
        continue;
      }

      const reply = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('')?.trim();

      if (reply) {
        return res.status(200).json({ reply });
      }
      lastError = 'Gemini returned an empty response.';
    } catch (err) {
      lastError = err.message;
      console.error(`Chat handler error (${model}):`, err);
    }
  }

  return res.status(502).json({ error: 'Gemini request failed: ' + lastError });
}
