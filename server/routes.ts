import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCvSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${sanitizedOriginalName}`);
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
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
      const id = parseInt(req.params.id);
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
  app.post("/api/cvs", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { name, age, nationality } = req.body;
      
      if (!name || !age || !nationality) {
        // Clean up uploaded file if validation fails
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Name, age, and nationality are required" });
      }

      const cvData = {
        name,
        age: parseInt(age),
        nationality,
        fileName: req.file.originalname,
        fileType: req.file.mimetype.includes('pdf') ? 'pdf' : 'image',
        filePath: req.file.path,
      };

      const validatedData = insertCvSchema.parse(cvData);
      const cv = await storage.createCv(validatedData);
      
      res.status(201).json(cv);
    } catch (error) {
      // Clean up uploaded file if error occurs
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
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
      const id = parseInt(req.params.id);
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
      const id = parseInt(req.params.id);
      const cv = await storage.getCvById(id);
      
      if (!cv) {
        return res.status(404).json({ message: "CV not found" });
      }
      
      // Delete file from filesystem
      if (fs.existsSync(cv.filePath)) {
        fs.unlinkSync(cv.filePath);
      }
      
      const deleted = await storage.deleteCv(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "CV not found" });
      }
      
      res.json({ message: "CV deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete CV" });
    }
  });

  // Serve uploaded files
  app.get("/api/files/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
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
