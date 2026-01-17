import { reports, type InsertReport } from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  createReport(report: InsertReport): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createReport(insertReport: InsertReport): Promise<void> {
    await db.insert(reports).values(insertReport);
  }
}

export const storage = new DatabaseStorage();
