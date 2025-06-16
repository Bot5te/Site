import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCvSchema } from "@shared/schema";
import multer from "multer";
import { connectToDatabase } from "./db";

// Configure multer for memory storage (files will be stored as Base64 in MongoDB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize MongoDB connection
  await connectToDatabase();

  // Get all CVs
  app.get("/api/cvs", async (req, res) => {
    try {
      const nationality = req.query.nationality as string;
      let cvs;
      
      if (nationality && nationality !== 'all') {
        cvs = await storage.getCvsByNationality(nationality);
      } else {
        cvs = await storage.getAllCvs();
      }
      
      res.json(cvs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch CVs" });
    }
  });

  // Get CV by ID
  app.get("/api/cvs/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const cv = await storage.getCvById(id);
      
      if (!cv) {
        return res.status(404).json({ message: "CV not found" });
      }
      
      res.json(cv);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch CV" });
    }
  });

  // Upload CV
  app.post("/api/cvs", upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { name, age, nationality, experience } = req.body;
      
      if (!name || !age || !nationality || !experience) {
        return res.status(400).json({ message: "Name, age, nationality, and experience are required" });
      }

      // Convert file to Base64
      const fileData = req.file.buffer.toString('base64');
      
      const cvData = {
        name,
        age: parseInt(age),
        nationality,
        experience,
        fileName: req.file.originalname,
        fileType: req.file.mimetype.includes('pdf') ? 'pdf' : 'image',
        fileData,
      };

      const validatedData = insertCvSchema.parse(cvData);
      const cv = await storage.createCv(validatedData);
      
      res.status(201).json(cv);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to upload CV" });
      }
    }
  });

  // Update CV
  app.put("/api/cvs/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const { name, age, nationality } = req.body;
      
      const updateData: any = {};
      if (name) updateData.name = name;
      if (age) updateData.age = parseInt(age);
      if (nationality) updateData.nationality = nationality;
      
      const cv = await storage.updateCv(id, updateData);
      
      if (!cv) {
        return res.status(404).json({ message: "CV not found" });
      }
      
      res.json(cv);
    } catch (error) {
      res.status(500).json({ message: "Failed to update CV" });
    }
  });

  // Delete CV
  app.delete("/api/cvs/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const deleted = await storage.deleteCv(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "CV not found" });
      }
      
      res.json({ message: "CV deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete CV" });
    }
  });

  // Serve files as Base64 data URLs
  app.get("/api/files/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const cv = await storage.getCvById(id);
      
      if (!cv || !cv.fileData) {
        return res.status(404).json({ message: "File not found" });
      }

      // Create data URL from Base64
      const mimeType = cv.fileType === 'pdf' ? 'application/pdf' : 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${cv.fileData}`;
      
      // For direct file serving, decode Base64 and send as buffer
      const buffer = Buffer.from(cv.fileData, 'base64');
      res.set({
        'Content-Type': mimeType,
        'Content-Length': buffer.length,
        'Content-Disposition': `inline; filename="${cv.fileName}"`
      });
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ message: "Failed to serve file" });
    }
  });

  // Admin authentication endpoint
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = req.body;
      
      if (password === "33356") {
        res.json({ success: true, message: "Authentication successful" });
      } else {
        res.status(401).json({ success: false, message: "Invalid password" });
      }
    } catch (error) {
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
