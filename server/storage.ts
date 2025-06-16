import { users, type User, type InsertUser, cvs, type Cv, type InsertCv } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // CV methods
  getAllCvs(): Promise<Cv[]>;
  getCvsByNationality(nationality: string): Promise<Cv[]>;
  getCvById(id: number): Promise<Cv | undefined>;
  createCv(cv: InsertCv): Promise<Cv>;
  updateCv(id: number, cv: Partial<InsertCv>): Promise<Cv | undefined>;
  deleteCv(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllCvs(): Promise<Cv[]> {
    return await db.select().from(cvs).orderBy(desc(cvs.uploadDate));
  }

  async getCvsByNationality(nationality: string): Promise<Cv[]> {
    return await db.select().from(cvs)
      .where(eq(cvs.nationality, nationality))
      .orderBy(desc(cvs.uploadDate));
  }

  async getCvById(id: number): Promise<Cv | undefined> {
    const [cv] = await db.select().from(cvs).where(eq(cvs.id, id));
    return cv || undefined;
  }

  async createCv(insertCv: InsertCv): Promise<Cv> {
    const [cv] = await db
      .insert(cvs)
      .values(insertCv)
      .returning();
    return cv;
  }

  async updateCv(id: number, updateData: Partial<InsertCv>): Promise<Cv | undefined> {
    const [cv] = await db
      .update(cvs)
      .set(updateData)
      .where(eq(cvs.id, id))
      .returning();
    return cv || undefined;
  }

  async deleteCv(id: number): Promise<boolean> {
    const result = await db.delete(cvs).where(eq(cvs.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
