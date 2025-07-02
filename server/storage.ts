import { MongoClient, Db, ObjectId } from 'mongodb';
import { getDatabase } from './db.js';
import type { User, Cv, InsertUser, InsertCv } from '../shared/schema.js';

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
  clearAllCvs(): Promise<boolean>;
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
    try {
      const user = await this.db.collection('users').findOne({ username });
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

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await this.db.collection('users').insertOne(insertUser);
      const user = await this.db.collection('users').findOne({ _id: result.insertedId });
      
      return {
        id: user!._id.toString(),
        username: user!.username,
        password: user!.password,
        _id: user!._id.toString()
      };
    } catch (error) {
      throw new Error('Failed to create user');
    }
  }

  // CV methods
  async getAllCvs(): Promise<Cv[]> {
    try {
      // Use a new collection name to avoid the problematic old data
      const cvs = await this.db.collection('cvs_new')
        .find({})
        .sort({ uploadDate: -1 })
        .limit(50)
        .toArray();
      
      return cvs.map(cv => ({
        id: cv._id.toString(),
        name: cv.name,
        age: cv.age,
        nationality: cv.nationality,
        experience: cv.experience || "غير محدد",
        fileName: cv.fileName,
        fileType: cv.fileType,
        filePath: cv.filePath || "",
        uploadDate: cv.uploadDate || new Date(),
        _id: cv._id.toString()
      }));
    } catch (error) {
      console.error("Error in getAllCvs:", error);
      return [];
    }
  }

  async getCvsByNationality(nationality: string): Promise<Cv[]> {
    try {
      const cvs = await this.db.collection('cvs_new')
        .find({ nationality })
        .sort({ uploadDate: -1 })
        .limit(50)
        .toArray();
      
      return cvs.map(cv => ({
        id: cv._id.toString(),
        name: cv.name,
        age: cv.age,
        nationality: cv.nationality,
        experience: cv.experience || "غير محدد",
        fileName: cv.fileName,
        fileType: cv.fileType,
        filePath: cv.filePath || "",
        uploadDate: cv.uploadDate || new Date(),
        _id: cv._id.toString()
      }));
    } catch (error) {
      console.error("Error in getCvsByNationality:", error);
      return [];
    }
  }

  async getCvById(id: string): Promise<Cv | undefined> {
    try {
      const cv = await this.db.collection('cvs_new').findOne({ _id: new ObjectId(id) });
      if (!cv) return undefined;
      
      return {
        id: cv._id.toString(),
        name: cv.name,
        age: cv.age,
        nationality: cv.nationality,
        experience: cv.experience || "غير محدد",
        fileName: cv.fileName,
        fileType: cv.fileType,
        filePath: cv.filePath || "",
        uploadDate: cv.uploadDate || new Date(),
        _id: cv._id.toString()
      };
    } catch (error) {
      return undefined;
    }
  }

  async createCv(insertCv: InsertCv): Promise<Cv> {
    try {
      const cvWithDate = {
        ...insertCv,
        uploadDate: new Date()
      };
      
      const result = await this.db.collection('cvs_new').insertOne(cvWithDate);
      const cv = await this.db.collection('cvs_new').findOne({ _id: result.insertedId });
      
      if (!cv) throw new Error('Failed to retrieve created CV');
      
      return {
        id: cv._id.toString(),
        name: cv.name,
        age: cv.age,
        nationality: cv.nationality,
        experience: cv.experience || "غير محدد",
        fileName: cv.fileName,
        fileType: cv.fileType,
        filePath: cv.filePath || "",
        uploadDate: cv.uploadDate || new Date(),
        _id: cv._id.toString()
      };
    } catch (error) {
      throw new Error('Failed to create CV');
    }
  }

  async updateCv(id: string, updateData: Partial<InsertCv>): Promise<Cv | undefined> {
    try {
      const result = await this.db.collection('cvs_new').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      if (!result) return undefined;
      
      return {
        id: result._id.toString(),
        name: result.name,
        age: result.age,
        nationality: result.nationality,
        experience: result.experience || "غير محدد",
        fileName: result.fileName,
        fileType: result.fileType,
        filePath: result.filePath || "",
        uploadDate: result.uploadDate || new Date(),
        _id: result._id.toString()
      };
    } catch (error) {
      console.error("Error updating CV:", error);
      return undefined;
    }
  }

  async deleteCv(id: string): Promise<boolean> {
    try {
      const result = await this.db.collection('cvs_new').deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (error) {
      console.error("Error deleting CV:", error);
      return false;
    }
  }

  async clearAllCvs(): Promise<boolean> {
    try {
      await this.db.collection('cvs_new').drop();
      return true;
    } catch (error) {
      console.error("Error clearing CVs collection:", error);
      return false;
    }
  }
}

export const storage = new MongoStorage();