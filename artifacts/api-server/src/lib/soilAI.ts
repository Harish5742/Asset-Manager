import { openai } from "@workspace/integrations-openai-ai-server";

export const LANGUAGE_MAP: Record<string, { name: string; nativeName: string }> = {
  ta: { name: "Tamil", nativeName: "தமிழ்" },
  hi: { name: "Hindi", nativeName: "हिंदी" },
  te: { name: "Telugu", nativeName: "తెలుగు" },
  kn: { name: "Kannada", nativeName: "ಕನ್ನಡ" },
  ml: { name: "Malayalam", nativeName: "മലയാളം" },
  bn: { name: "Bengali", nativeName: "বাংলা" },
  mr: { name: "Marathi", nativeName: "मराठी" },
  gu: { name: "Gujarati", nativeName: "ગુજરાતી" },
  pa: { name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  or: { name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  en: { name: "English", nativeName: "English" },
};

interface SoilInput {
  farmerName?: string | null;
  location: string;
  season: string;
  waterAvailability: string;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  moisture: number;
  preferredCrop?: string | null;
  language?: string | null;
  temperature?: number | null;
  humidity?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface CropRecommendation {
  name: string;
  score: number;
  reason: string;
}

interface FertilizerRecommendation {
  name: string;
  dosage: string;
  timing: string;
}

interface SoilCorrection {
  amendment: string;
  reason: string;
  dosage: string;
}

interface SoilAnalysisAIResult {
  crops: CropRecommendation[];
  fertilizers: FertilizerRecommendation[];
  soilCorrections: SoilCorrection[];
  explanationEnglish: string;
  explanationTamil: string;
  language: string;
  languageName: string;
}

function buildRuleBasedContext(input: SoilInput): string {
  const rules: string[] = [];

  if (input.ph < 6) {
    rules.push("Soil is ACIDIC (pH < 6). Lime application is recommended to raise pH.");
  } else if (input.ph > 7.5) {
    rules.push("Soil is ALKALINE (pH > 7.5). Gypsum application is recommended to lower pH.");
  } else {
    rules.push("Soil pH is in the neutral range (6–7.5), which is good for most crops.");
  }

  if (input.nitrogen < 200) {
    rules.push("NITROGEN is LOW. Urea or Ammonium Sulphate fertilizer recommended.");
  } else if (input.nitrogen > 400) {
    rules.push("NITROGEN is HIGH. Reduce nitrogenous fertilizers to avoid toxicity.");
  } else {
    rules.push("Nitrogen level is moderate.");
  }

  if (input.phosphorus < 20) {
    rules.push("PHOSPHORUS is LOW. DAP (Di-Ammonium Phosphate) fertilizer recommended.");
  } else if (input.phosphorus > 60) {
    rules.push("PHOSPHORUS is HIGH. No additional phosphorus needed.");
  } else {
    rules.push("Phosphorus level is adequate.");
  }

  if (input.potassium < 120) {
    rules.push("POTASSIUM is LOW. MOP (Muriate of Potash) fertilizer recommended.");
  } else if (input.potassium > 280) {
    rules.push("POTASSIUM is HIGH. Reduce potassic fertilizers.");
  } else {
    rules.push("Potassium level is sufficient.");
  }

  if (input.moisture < 20) {
    rules.push("MOISTURE is LOW. Irrigation is critically needed before sowing.");
  } else if (input.moisture > 70) {
    rules.push("MOISTURE is HIGH. Ensure proper drainage to prevent waterlogging.");
  } else {
    rules.push("Moisture level is adequate.");
  }

  if (input.temperature != null) {
    if (input.temperature > 35) {
      rules.push(`Current ambient temperature is HIGH (${input.temperature}°C). Heat-tolerant crops are preferred.`);
    } else if (input.temperature < 15) {
      rules.push(`Current ambient temperature is LOW (${input.temperature}°C). Cold-tolerant crops are preferred.`);
    } else {
      rules.push(`Current ambient temperature is ${input.temperature}°C — moderate, suitable for a wide range of crops.`);
    }
  }

  if (input.humidity != null) {
    if (input.humidity > 80) {
      rules.push(`Current humidity is HIGH (${input.humidity}%). Watch for fungal disease risk.`);
    } else if (input.humidity < 30) {
      rules.push(`Current humidity is LOW (${input.humidity}%). Moisture retention is important.`);
    }
  }

  return rules.join("\n");
}

function resolveLanguage(code: string | null | undefined): { code: string; name: string; nativeName: string } {
  const raw = (code ?? "ta").split("-")[0].toLowerCase();
  const entry = LANGUAGE_MAP[raw];
  if (entry) return { code: raw, ...entry };
  return { code: "ta", ...LANGUAGE_MAP.ta };
}

export async function analyzeSoil(input: SoilInput): Promise<SoilAnalysisAIResult> {
  const ruleContext = buildRuleBasedContext(input);
  const lang = resolveLanguage(input.language);

  const localLangInstruction = lang.code === "en"
    ? `Write both explanationEnglish and explanationTamil in English (farmer does not need a local language version).`
    : `Write explanationTamil in ${lang.name} (${lang.nativeName}) — use simple, everyday ${lang.name} words that a rural farmer would understand. Write in proper ${lang.name} script.`;

  const envContext = (input.temperature != null || input.humidity != null)
    ? `\nReal-time environmental data from GPS:
- Temperature: ${input.temperature != null ? `${input.temperature}°C` : "not available"}
- Humidity: ${input.humidity != null ? `${input.humidity}%` : "not available"}
Use this data to improve crop recommendations (heat tolerance, moisture conditions, etc.).`
    : "";

  const prompt = `You are an expert agricultural advisor specializing in Indian smallholder farming. Analyze the following soil data and provide practical recommendations.

SOIL DATA:
- Location: ${input.location} (India)
- Season: ${input.season}
- Water Availability: ${input.waterAvailability}
- Soil pH: ${input.ph}
- Nitrogen (N): ${input.nitrogen} kg/ha
- Phosphorus (P): ${input.phosphorus} kg/ha
- Potassium (K): ${input.potassium} kg/ha
- Moisture: ${input.moisture}%
${input.preferredCrop ? `- Preferred Crop: ${input.preferredCrop}` : ""}${envContext}

RULE-BASED ANALYSIS:
${ruleContext}

Based on this data and common Indian agricultural practices, provide recommendations in this EXACT JSON format (no markdown, pure JSON):
{
  "crops": [
    {"name": "crop name", "score": 85, "reason": "brief reason why this crop suits the soil (1-2 sentences)"},
    {"name": "crop name", "score": 72, "reason": "brief reason"},
    {"name": "crop name", "score": 60, "reason": "brief reason"}
  ],
  "fertilizers": [
    {"name": "fertilizer name", "dosage": "e.g. 50 kg/ha", "timing": "e.g. At sowing time"},
    {"name": "fertilizer name", "dosage": "e.g. 25 kg/ha split dose", "timing": "e.g. 30 days after sowing"}
  ],
  "soilCorrections": [
    {"amendment": "e.g. Agricultural Lime", "reason": "why it's needed", "dosage": "e.g. 2 tonnes/ha"}
  ],
  "explanationEnglish": "A simple, friendly 3-4 sentence explanation in plain English suitable for a farmer with limited education. Mention the key findings and top recommendation clearly.",
  "explanationTamil": "A simple, friendly 3-4 sentence explanation suitable for a local farmer. ${localLangInstruction}"
}

Provide exactly 3 crops, at least 2 fertilizers, and soil corrections only if needed (empty array if soil is already healthy). Scores must be between 0-100. Focus on crops suitable for ${input.season} season in India.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      {
        role: "system",
        content: "You are an expert Indian agricultural advisor. Always respond with valid JSON only, no markdown formatting.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const result = JSON.parse(cleaned) as Omit<SoilAnalysisAIResult, "language" | "languageName">;

  return {
    ...result,
    language: lang.code,
    languageName: `${lang.name} (${lang.nativeName})`,
  };
}
