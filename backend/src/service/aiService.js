const { GoogleGenAI } = require("@google/genai")

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest"

function ensureKey() {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error("GEMINI_API_KEY not configured")
    err.statusCode = 501
    throw err
  }
}

function getClient() {
  ensureKey()
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
}

function extractText(result) {
  if (!result) return ""
  // Try direct text property (standard in some versions)
  if (typeof result.text === 'function') return result.text()
  if (result.text) return result.text

  // Try nested candidate structure (common in @google/genai 0.x)
  return result.response?.candidates?.[0]?.content?.parts?.[0]?.text || ""
}

function extractJSON(text) {
  try {
    // 1. Try parsing directly
    return JSON.parse(text);
  } catch (e) {
    // 2. Try extracting from markdown code block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch (e2) {
        // Fall through
      }
    }
  }

  // 3. Find first '{' and last '}' as fallback
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    const jsonStr = text.substring(start, end + 1);
    try {
      return JSON.parse(jsonStr);
    } catch (e3) {
      // Fall through to error
    }
  }
  throw new Error("Failed to extract valid JSON from response");
}

async function generateCaseSummary({ caseData, persons, forms }) {
  const client = getClient()
  const model = client.models

  const prompt =
    "You are an assistant that summarizes legal case data for officers. " +
    "Return JSON only with fields: summary (string), key_points (array of strings), " +
    "risks (array), recommended_next_actions (array). " +
    "Data: " +
    JSON.stringify({ case: caseData, persons, forms })

  try {
    const result = await model.generateContent({
      model: DEFAULT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    })

    const text = extractText(result)
    return extractJSON(text)
  } catch (err) {
    console.error("AI Summary Generation Error:", err)
    return {
      summary: "Summary generation failed: " + err.message,
      key_points: [],
      risks: [],
      recommended_next_actions: []
    }
  }
}

async function generateDigest(overview) {
  const client = getClient()
  const model = client.models

  const prompt =
    "You are an assistant that writes daily operational digests. " +
    "Return JSON only with fields: headline (string), highlights (array), " +
    "risks (array), suggested_actions (array). " +
    "Data: " +
    JSON.stringify(overview)

  try {
    const result = await model.generateContent({
      model: DEFAULT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    })

    const text = extractText(result)
    return extractJSON(text)
  } catch (err) {
    console.error("AI Digest Generation Error:", err)
    return {
      headline: "Digest generation failed: " + err.message,
      highlights: [],
      risks: [],
      suggested_actions: []
    }
  }
}

module.exports = {
  generateCaseSummary,
  generateDigest
}
