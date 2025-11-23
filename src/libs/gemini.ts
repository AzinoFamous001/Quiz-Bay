// src/lib/gemini.ts
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("Gemini API key is missing – answer generation disabled");
}

export const generateAnswerWithGemini = async (
  question: string,
  options: string[]
): Promise<string | null> => {
  if (!GEMINI_API_KEY) return null;

  const prompt = `
You are a perfect quiz solver. Answer ONLY with the exact correct option text (nothing else, no explanation).

Question: ${question}

Options:
${options.map((opt, i) => `${i + 1}. ${opt}`).join("\n")}

Answer with the exact text of the correct option.
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0,
            topK: 1,
            topP: 1,
            maxOutputTokens: 100,
          },
        }),
      }
    );

    if (!response.ok) throw new Error("Gemini API error");

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    // Return the exact option text if Gemini gave a match
    if (
      answer &&
      options.some((opt) => opt.includes(answer) || answer.includes(opt))
    ) {
      const matched = options.find(
        (opt) =>
          opt.toLowerCase().includes(answer.toLowerCase()) ||
          answer.toLowerCase().includes(opt.toLowerCase())
      );
      return matched || null;
    }

    return null;
  } catch (err) {
    console.error("Gemini failed:", err);
    return null;
  }
};
