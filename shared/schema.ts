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

// WS Message Types
export type WSMessage = 
  | { type: 'join' }
  | { type: 'next' }
  | { type: 'leave' }
  | { type: 'signal', data: any }
  | { type: 'message', content: string };

export type WSServerMessage = 
  | { type: 'waiting' }
  | { type: 'matched', initiator: boolean }
  | { type: 'partner_disconnected' }
  | { type: 'signal', data: any }
  | { type: 'message', content: string };
