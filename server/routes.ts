import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCvSchema } from "@shared/schema";
import multer from "multer";
import { connectToDatabase } from "./db";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

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
      console.error("Error fetching CVs:", error);
      res.status(500).json({ message: "Failed to fetch CVs", error: error instanceof Error ? error.message : String(error) });
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

      // Save file to filesystem
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Generate unique filename
      const fileExtension = path.extname(req.file.originalname);
      const uniqueFileName = `${nanoid()}_${Date.now()}${fileExtension}`;
      const filePath = path.join(uploadsDir, uniqueFileName);
      
      // Save file to disk
      fs.writeFileSync(filePath, req.file.buffer);
      
      const cvData = {
        name,
        age: parseInt(age),
        nationality,
        experience,
        fileName: req.file.originalname,
        fileType: req.file.mimetype.includes('pdf') ? 'pdf' : 'image',
        filePath: `uploads/${uniqueFileName}`,
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

  // Serve files from filesystem
  app.get("/api/files/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const cv = await storage.getCvById(id);
      
      if (!cv || !cv.filePath) {
        return res.status(404).json({ message: "File not found" });
      }


      
      const fullFilePath = path.join(process.cwd(), cv.filePath);
      
      // Check if file exists
      if (!fs.existsSync(fullFilePath)) {
        return res.status(404).json({ message: "File not found on disk" });
      }

      const mimeType = cv.fileType === 'pdf' ? 'application/pdf' : 'image/jpeg';
      
      res.set({
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${cv.fileName}"`
      });
      
      // Stream the file
      const fileStream = fs.createReadStream(fullFilePath);
      fileStream.pipe(res);
      
    } catch (error) {
      console.error("Error serving file:", error);
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
