import { MongoClient, ServerApiVersion, Db } from 'mongodb';

const uri = "mongodb+srv://Qassem77:01118723@cluster0.zbm9qua.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db: Db;

export async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db("cv_management");
    console.log("Connected to MongoDB successfully!");
    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error("Database not connected. Call connectToDatabase() first.");
  }
  return db;
}

export { client };