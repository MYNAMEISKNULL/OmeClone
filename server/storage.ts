import { reports, feedback, type InsertReport, type InsertFeedback, type Report, type Feedback } from "@shared/schema";
import { db } from "./db";
import { desc } from "drizzle-orm";

export interface IStorage {
  createReport(report: InsertReport): Promise<void>;
  getReports(): Promise<Report[]>;
  createFeedback(fb: InsertFeedback): Promise<void>;
  getFeedback(): Promise<Feedback[]>;
}

export class DatabaseStorage implements IStorage {
  async createReport(insertReport: InsertReport): Promise<void> {
    await db.insert(reports).values(insertReport);
  }

  async getReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(desc(reports.createdAt));
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<void> {
    await db.insert(feedback).values(insertFeedback);
  }

  async getFeedback(): Promise<Feedback[]> {
    return await db.select().from(feedback).orderBy(desc(feedback.createdAt));
  }
}

export const storage = new DatabaseStorage();
