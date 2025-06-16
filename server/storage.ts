import { type User, type InsertUser, type Cv, type InsertCv } from "@shared/schema";
import { getDatabase } from "./db";
import { ObjectId } from "mongodb";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // CV methods
  getAllCvs(): Promise<Cv[]>;
  getCvsByNationality(nationality: string): Promise<Cv[]>;
  getCvById(id: string): Promise<Cv | undefined>;
  createCv(cv: InsertCv): Promise<Cv>;
  updateCv(id: string, cv: Partial<InsertCv>): Promise<Cv | undefined>;
  deleteCv(id: string): Promise<boolean>;
}

export class MongoStorage implements IStorage {
  private get db() {
    return getDatabase();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const user = await this.db.collection('users').findOne({ _id: new ObjectId(id) });
      if (!user) return undefined;
      return { 
        id: user._id.toString(),
        username: user.username,
        password: user.password,
        _id: user._id.toString()
      };
    } catch (error) {
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await this.db.collection('users').findOne({ username });
    if (!user) return undefined;
    return { 
      id: user._id.toString(),
      username: user.username,
      password: user.password,
      _id: user._id.toString()
    };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.collection('users').insertOne(insertUser);
    const user = await this.db.collection('users').findOne({ _id: result.insertedId });
    if (!user) throw new Error("Failed to create user");
    return { 
      id: user._id.toString(),
      username: user.username,
      password: user.password,
      _id: user._id.toString()
    };
  }

  // CV methods
  async getAllCvs(): Promise<Cv[]> {
    const cvs = await this.db.collection('cvs')
      .find({})
      .sort({ uploadDate: -1 })
      .toArray();
    
    return cvs.map(cv => ({
      id: cv._id.toString(),
      name: cv.name,
      age: cv.age,
      nationality: cv.nationality,
      experience: cv.experience || "غير محدد",
      fileName: cv.fileName,
      fileType: cv.fileType,
      fileData: cv.fileData,
      uploadDate: cv.uploadDate || new Date(),
      _id: cv._id.toString()
    }));
  }

  async getCvsByNationality(nationality: string): Promise<Cv[]> {
    const cvs = await this.db.collection('cvs')
      .find({ nationality })
      .sort({ uploadDate: -1 })
      .toArray();
    
    return cvs.map(cv => ({
      id: cv._id.toString(),
      name: cv.name,
      age: cv.age,
      nationality: cv.nationality,
      experience: cv.experience || "غير محدد",
      fileName: cv.fileName,
      fileType: cv.fileType,
      fileData: cv.fileData,
      uploadDate: cv.uploadDate || new Date(),
      _id: cv._id.toString()
    }));
  }

  async getCvById(id: string): Promise<Cv | undefined> {
    try {
      const cv = await this.db.collection('cvs').findOne({ _id: new ObjectId(id) });
      if (!cv) return undefined;
      return {
        id: cv._id.toString(),
        name: cv.name,
        age: cv.age,
        nationality: cv.nationality,
        experience: cv.experience || "غير محدد",
        fileName: cv.fileName,
        fileType: cv.fileType,
        fileData: cv.fileData,
        uploadDate: cv.uploadDate || new Date(),
        _id: cv._id.toString()
      };
    } catch (error) {
      return undefined;
    }
  }

  async createCv(insertCv: InsertCv): Promise<Cv> {
    const cvWithDate = {
      ...insertCv,
      uploadDate: new Date()
    };
    
    const result = await this.db.collection('cvs').insertOne(cvWithDate);
    const cv = await this.db.collection('cvs').findOne({ _id: result.insertedId });
    if (!cv) throw new Error("Failed to create CV");
    
    return {
      id: cv._id.toString(),
      name: cv.name,
      age: cv.age,
      nationality: cv.nationality,
      experience: cv.experience || "غير محدد",
      fileName: cv.fileName,
      fileType: cv.fileType,
      fileData: cv.fileData,
      uploadDate: cv.uploadDate || new Date(),
      _id: cv._id.toString()
    };
  }

  async updateCv(id: string, updateData: Partial<InsertCv>): Promise<Cv | undefined> {
    try {
      const result = await this.db.collection('cvs').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      if (!result || !result.value) return undefined;
      
      return {
        id: result.value._id.toString(),
        name: result.value.name,
        age: result.value.age,
        nationality: result.value.nationality,
        experience: result.value.experience || "غير محدد",
        fileName: result.value.fileName,
        fileType: result.value.fileType,
        fileData: result.value.fileData,
        uploadDate: result.value.uploadDate || new Date(),
        _id: result.value._id.toString()
      };
    } catch (error) {
      return undefined;
    }
  }

  async deleteCv(id: string): Promise<boolean> {
    try {
      const result = await this.db.collection('cvs').deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      return false;
    }
  }
}

export const storage = new MongoStorage();
