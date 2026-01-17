import { reports, feedback, admin, type InsertReport, type InsertFeedback, type InsertAdmin, type Report, type Feedback, type Admin } from "@shared/schema";
import { db } from "./db";
import { desc, eq } from "drizzle-orm";

export interface IStorage {
  createReport(report: InsertReport): Promise<void>;
  getReports(): Promise<Report[]>;
  createFeedback(fb: InsertFeedback): Promise<void>;
  getFeedback(): Promise<Feedback[]>;
  getAdmin(): Promise<Admin | undefined>;
  setAdmin(admin: InsertAdmin): Promise<void>;
  updateMaintenance(mode: string, message: string): Promise<void>;
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

  async getAdmin(): Promise<Admin | undefined> {
    const [a] = await db.select().from(admin).limit(1);
    return a;
  }

  async setAdmin(insertAdmin: InsertAdmin): Promise<void> {
    const existing = await this.getAdmin();
    if (existing) {
      await db.update(admin).set(insertAdmin).where(eq(admin.id, existing.id));
    } else {
      await db.insert(admin).values(insertAdmin);
    }
  }

  async updateMaintenance(mode: string, message: string): Promise<void> {
    const existing = await this.getAdmin();
    if (existing) {
      await db.update(admin).set({ maintenanceMode: mode, maintenanceMessage: message }).where(eq(admin.id, existing.id));
    } else {
      await db.insert(admin).values({ password: "default_password", maintenanceMode: mode, maintenanceMessage: message });
    }
  }
}

export const storage = new DatabaseStorage();
