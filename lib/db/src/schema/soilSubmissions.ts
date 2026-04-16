import { pgTable, text, serial, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const soilSubmissionsTable = pgTable("soil_submissions", {
  id: serial("id").primaryKey(),
  farmerName: text("farmer_name"),
  location: text("location").notNull(),
  season: text("season").notNull(),
  waterAvailability: text("water_availability").notNull(),
  ph: real("ph").notNull(),
  nitrogen: real("nitrogen").notNull(),
  phosphorus: real("phosphorus").notNull(),
  potassium: real("potassium").notNull(),
  moisture: real("moisture").notNull(),
  preferredCrop: text("preferred_crop"),
  language: text("language"),
  languageName: text("language_name"),
  temperature: real("temperature"),
  humidity: real("humidity"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  crops: jsonb("crops").notNull().$type<Array<{ name: string; score: number; reason: string }>>(),
  fertilizers: jsonb("fertilizers").notNull().$type<Array<{ name: string; dosage: string; timing: string }>>(),
  soilCorrections: jsonb("soil_corrections").notNull().$type<Array<{ amendment: string; reason: string; dosage: string }>>(),
  explanationEnglish: text("explanation_english").notNull(),
  explanationTamil: text("explanation_tamil").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSoilSubmissionSchema = createInsertSchema(soilSubmissionsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertSoilSubmission = z.infer<typeof insertSoilSubmissionSchema>;
export type SoilSubmission = typeof soilSubmissionsTable.$inferSelect;
