import { Router, type IRouter } from "express";
import { desc, count, avg, sql } from "drizzle-orm";
import { db, soilSubmissionsTable } from "@workspace/db";
import {
  AnalyzeSoilBody,
  ListSubmissionsQueryParams,
  GetSubmissionParams,
} from "@workspace/api-zod";
import { analyzeSoil } from "../lib/soilAI";

const router: IRouter = Router();

router.post("/soil/analyze", async (req, res): Promise<void> => {
  const parsed = AnalyzeSoilBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const input = parsed.data;

  try {
    const aiResult = await analyzeSoil({
      farmerName: input.farmerName,
      location: input.location,
      season: input.season,
      waterAvailability: input.waterAvailability,
      ph: input.ph,
      nitrogen: input.nitrogen,
      phosphorus: input.phosphorus,
      potassium: input.potassium,
      moisture: input.moisture,
      preferredCrop: input.preferredCrop,
      language: input.language,
      temperature: input.temperature,
      humidity: input.humidity,
      latitude: input.latitude,
      longitude: input.longitude,
    });

    const [submission] = await db
      .insert(soilSubmissionsTable)
      .values({
        farmerName: input.farmerName ?? null,
        location: input.location,
        season: input.season,
        waterAvailability: input.waterAvailability,
        ph: input.ph,
        nitrogen: input.nitrogen,
        phosphorus: input.phosphorus,
        potassium: input.potassium,
        moisture: input.moisture,
        preferredCrop: input.preferredCrop ?? null,
        language: aiResult.language,
        languageName: aiResult.languageName,
        temperature: input.temperature ?? null,
        humidity: input.humidity ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        crops: aiResult.crops,
        fertilizers: aiResult.fertilizers,
        soilCorrections: aiResult.soilCorrections,
        explanationEnglish: aiResult.explanationEnglish,
        explanationTamil: aiResult.explanationTamil,
      })
      .returning();

    res.json({
      id: submission.id,
      crops: aiResult.crops,
      fertilizers: aiResult.fertilizers,
      soilCorrections: aiResult.soilCorrections,
      explanationEnglish: aiResult.explanationEnglish,
      explanationTamil: aiResult.explanationTamil,
      language: aiResult.language,
      languageName: aiResult.languageName,
      temperature: input.temperature ?? null,
      humidity: input.humidity ?? null,
      createdAt: submission.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to analyze soil");
    res.status(500).json({ error: "Failed to analyze soil data. Please try again." });
  }
});

router.get("/soil/submissions", async (req, res): Promise<void> => {
  const parsed = ListSubmissionsQueryParams.safeParse(req.query);
  const page = parsed.success ? (parsed.data.page ?? 1) : 1;
  const limit = parsed.success ? (parsed.data.limit ?? 20) : 20;
  const offset = (page - 1) * limit;

  const [submissions, totalResult] = await Promise.all([
    db
      .select({
        id: soilSubmissionsTable.id,
        farmerName: soilSubmissionsTable.farmerName,
        location: soilSubmissionsTable.location,
        season: soilSubmissionsTable.season,
        ph: soilSubmissionsTable.ph,
        nitrogen: soilSubmissionsTable.nitrogen,
        phosphorus: soilSubmissionsTable.phosphorus,
        potassium: soilSubmissionsTable.potassium,
        moisture: soilSubmissionsTable.moisture,
        crops: soilSubmissionsTable.crops,
        createdAt: soilSubmissionsTable.createdAt,
      })
      .from(soilSubmissionsTable)
      .orderBy(desc(soilSubmissionsTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(soilSubmissionsTable),
  ]);

  const total = totalResult[0]?.count ?? 0;

  res.json({
    submissions: submissions.map((s) => ({
      id: s.id,
      farmerName: s.farmerName,
      location: s.location,
      season: s.season,
      ph: s.ph,
      nitrogen: s.nitrogen,
      phosphorus: s.phosphorus,
      potassium: s.potassium,
      moisture: s.moisture,
      topCrop: Array.isArray(s.crops) && s.crops.length > 0 ? (s.crops[0] as { name: string }).name : null,
      createdAt: s.createdAt.toISOString(),
    })),
    total,
    page,
    limit,
  });
});

router.get("/soil/submissions/:id", async (req, res): Promise<void> => {
  const params = GetSubmissionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [submission] = await db
    .select()
    .from(soilSubmissionsTable)
    .where(sql`${soilSubmissionsTable.id} = ${params.data.id}`);

  if (!submission) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }

  res.json({
    id: submission.id,
    farmerName: submission.farmerName,
    location: submission.location,
    season: submission.season,
    waterAvailability: submission.waterAvailability,
    ph: submission.ph,
    nitrogen: submission.nitrogen,
    phosphorus: submission.phosphorus,
    potassium: submission.potassium,
    moisture: submission.moisture,
    preferredCrop: submission.preferredCrop,
    crops: submission.crops,
    fertilizers: submission.fertilizers,
    soilCorrections: submission.soilCorrections,
    explanationEnglish: submission.explanationEnglish,
    explanationTamil: submission.explanationTamil,
    createdAt: submission.createdAt.toISOString(),
  });
});

router.get("/soil/stats", async (_req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalResult, todayResult, avgPhResult, allSubmissions] = await Promise.all([
    db.select({ count: count() }).from(soilSubmissionsTable),
    db
      .select({ count: count() })
      .from(soilSubmissionsTable)
      .where(sql`${soilSubmissionsTable.createdAt} >= ${today}`),
    db.select({ avg: avg(soilSubmissionsTable.ph) }).from(soilSubmissionsTable),
    db
      .select({
        season: soilSubmissionsTable.season,
        crops: soilSubmissionsTable.crops,
      })
      .from(soilSubmissionsTable),
  ]);

  const seasonCounts: Record<string, number> = {};
  const cropCounts: Record<string, number> = {};

  for (const row of allSubmissions) {
    seasonCounts[row.season] = (seasonCounts[row.season] ?? 0) + 1;
    if (Array.isArray(row.crops) && row.crops.length > 0) {
      const topCrop = (row.crops[0] as { name: string }).name;
      cropCounts[topCrop] = (cropCounts[topCrop] ?? 0) + 1;
    }
  }

  const topCrops = Object.entries(cropCounts)
    .map(([crop, count]) => ({ crop, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const seasonBreakdown = Object.entries(seasonCounts).map(([season, count]) => ({
    season,
    count,
  }));

  res.json({
    totalSubmissions: totalResult[0]?.count ?? 0,
    todaySubmissions: todayResult[0]?.count ?? 0,
    topCrops,
    avgPh: avgPhResult[0]?.avg != null ? Number(Number(avgPhResult[0].avg).toFixed(2)) : 0,
    seasonBreakdown,
  });
});

export default router;
