import { cvs, type Cv, type InsertCv, users, type User, type InsertUser } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cvs: Map<number, Cv>;
  private currentUserId: number;
  private currentCvId: number;

  constructor() {
    this.users = new Map();
    this.cvs = new Map();
    this.currentUserId = 1;
    this.currentCvId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // CV methods
  async getAllCvs(): Promise<Cv[]> {
    return Array.from(this.cvs.values()).sort((a, b) => 
      new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );
  }

  async getCvsByNationality(nationality: string): Promise<Cv[]> {
    return Array.from(this.cvs.values())
      .filter(cv => cv.nationality === nationality)
      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }

  async getCvById(id: number): Promise<Cv | undefined> {
    return this.cvs.get(id);
  }

  async createCv(insertCv: InsertCv): Promise<Cv> {
    const id = this.currentCvId++;
    const cv: Cv = {
      ...insertCv,
      id,
      uploadDate: new Date(),
    };
    this.cvs.set(id, cv);
    return cv;
  }

  async updateCv(id: number, updateData: Partial<InsertCv>): Promise<Cv | undefined> {
    const existingCv = this.cvs.get(id);
    if (!existingCv) {
      return undefined;
    }

    const updatedCv: Cv = {
      ...existingCv,
      ...updateData,
    };
    this.cvs.set(id, updatedCv);
    return updatedCv;
  }

  async deleteCv(id: number): Promise<boolean> {
    return this.cvs.delete(id);
  }
}

export const storage = new MemStorage();
