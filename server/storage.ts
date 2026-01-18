import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@shared/schema";
import { desc, eq } from "drizzle-orm";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema });

export interface IStorage {
  getUser(id: number): Promise<schema.User | undefined>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  createUser(user: schema.InsertUser): Promise<schema.User>;
  createReport(report: schema.InsertReport): Promise<void>;
  getReports(): Promise<schema.Report[]>;
  createFeedback(fb: schema.InsertFeedback): Promise<void>;
  getFeedback(): Promise<schema.Feedback[]>;
  getAdmin(): Promise<schema.Admin | undefined>;
  setAdmin(admin: schema.InsertAdmin): Promise<void>;
  updateMaintenance(mode: string, message: string): Promise<void>;
  getMaintenanceHistory(): Promise<any[]>;
  updateWordBlacklist(list: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user;
  }

  async createUser(insertUser: schema.InsertUser): Promise<schema.User> {
    const [user] = await db.insert(schema.users).values(insertUser).returning();
    return user;
  }

  async createReport(insertReport: schema.InsertReport): Promise<void> {
    await db.insert(schema.reports).values(insertReport);
  }

  async getReports(): Promise<schema.Report[]> {
    return await db.select().from(schema.reports).orderBy(desc(schema.reports.createdAt));
  }

  async createFeedback(insertFeedback: schema.InsertFeedback): Promise<void> {
    await db.insert(schema.feedback).values(insertFeedback);
  }

  async getFeedback(): Promise<schema.Feedback[]> {
    return await db.select().from(schema.feedback).orderBy(desc(schema.feedback.createdAt));
  }

  async getAdmin(): Promise<schema.Admin | undefined> {
    const [a] = await db.select().from(schema.admin).limit(1);
    return a;
  }

  async setAdmin(insertAdmin: schema.InsertAdmin): Promise<void> {
    const existing = await this.getAdmin();
    if (existing) {
      await db.update(schema.admin).set(insertAdmin).where(eq(schema.admin.id, existing.id));
    } else {
      await db.insert(schema.admin).values(insertAdmin);
    }
  }

  async updateMaintenance(mode: string, message: string): Promise<void> {
    const existing = await this.getAdmin();
    if (existing) {
      await db.update(schema.admin).set({ maintenanceMode: mode, maintenanceMessage: message }).where(eq(schema.admin.id, existing.id));
    } else {
      await db.insert(schema.admin).values({ password: "default_password", maintenanceMode: mode, maintenanceMessage: message });
    }
    await db.insert(schema.maintenanceHistory).values({ mode, message });
  }

  async getMaintenanceHistory(): Promise<any[]> {
    return await db.select().from(schema.maintenanceHistory).orderBy(desc(schema.maintenanceHistory.createdAt));
  }

  async updateWordBlacklist(list: string): Promise<void> {
    const existing = await this.getAdmin();
    if (existing) {
      await db.update(schema.admin).set({ wordBlacklist: list }).where(eq(schema.admin.id, existing.id));
    }
  }
}

export const storage = new DatabaseStorage();
