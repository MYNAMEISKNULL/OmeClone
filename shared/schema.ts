import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReportSchema = createInsertSchema(reports).pick({
  reason: true,
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  rating: text("rating").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).pick({
  rating: true,
  content: true,
});

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export const admin = pgTable("admin", {
  id: serial("id").primaryKey(),
  password: text("password").notNull(),
  maintenanceMode: text("maintenance_mode").default("off"),
  maintenanceMessage: text("maintenance_message").default("Site is under maintenance. Please check back later."),
  wordBlacklist: text("word_blacklist").default(""),
});

export const maintenanceHistory = pgTable("maintenance_history", {
  id: serial("id").primaryKey(),
  mode: text("mode").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdminSchema = createInsertSchema(admin).pick({
  password: true,
  maintenanceMode: true,
  maintenanceMessage: true,
  wordBlacklist: true,
});

export type Admin = typeof admin.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

// WS Message Types
export type WSMessage = 
  | { type: 'join' }
  | { type: 'next' }
  | { type: 'leave' }
  | { type: 'signal', data: any }
  | { type: 'message', content: string }
  | { type: 'typing', isTyping: boolean };

export type WSServerMessage = 
  | { type: 'waiting' }
  | { type: 'matched', initiator: boolean }
  | { type: 'partner_disconnected' }
  | { type: 'signal', data: any }
  | { type: 'message', content: string }
  | { type: 'typing', isTyping: boolean }
  | { type: 'online_count', count: number };
