import { z } from "zod";

// CV Schema for MongoDB
export const cvSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  age: z.number().min(1, "Age must be at least 1").max(100, "Age must be at most 100"),
  nationality: z.enum(["philippines", "ethiopia", "kenya"], {
    required_error: "Nationality is required"
  }),
  experience: z.string().min(1, "Experience is required"),
  fileName: z.string().min(1, "File name is required"),
  fileType: z.enum(["pdf", "image"], {
    required_error: "File type is required"
  }),
  fileData: z.string().min(1, "File data is required"), // Base64 encoded file data
  uploadDate: z.date().default(() => new Date()),
});

export const insertCvSchema = cvSchema.omit({
  _id: true,
  uploadDate: true,
});

export type InsertCv = z.infer<typeof insertCvSchema>;
export type Cv = z.infer<typeof cvSchema> & { id: string };
export type CvBasic = Omit<Cv, 'fileData'>; // CV without file data for better performance

// User Schema for MongoDB
export const userSchema = z.object({
  _id: z.string().optional(),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertUserSchema = userSchema.omit({
  _id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof userSchema> & { id: string };
