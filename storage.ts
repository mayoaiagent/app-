import { users, transactions, pointPackages, type User, type InsertUser, type Transaction, type InsertTransaction, type PointPackage, type InsertPointPackage } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  addPointsToUser(userId: string, points: number): Promise<void>;
  updateUserTotalSpent(userId: string, amount: number): Promise<void>;
  
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  
  getActivePointPackages(): Promise<PointPackage[]>;
  getPointPackage(id: string): Promise<PointPackage | undefined>;
  createPointPackage(pointPackage: InsertPointPackage): Promise<PointPackage>;
  
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
    
    // Initialize default point packages
    this.initializePointPackages();
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async addPointsToUser(userId: string, points: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        points: sql`points + ${points}` 
      })
      .where(eq(users.id, userId));
  }

  async updateUserTotalSpent(userId: string, amount: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        totalSpent: sql`total_spent + ${amount}` 
      })
      .where(eq(users.id, userId));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getUserTransactions(userId: string, limit = 50): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async getActivePointPackages(): Promise<PointPackage[]> {
    return await db
      .select()
      .from(pointPackages)
      .where(eq(pointPackages.isActive, true))
      .orderBy(pointPackages.points);
  }

  async getPointPackage(id: string): Promise<PointPackage | undefined> {
    const [pointPackage] = await db
      .select()
      .from(pointPackages)
      .where(eq(pointPackages.id, id));
    return pointPackage || undefined;
  }

  async createPointPackage(pointPackage: InsertPointPackage): Promise<PointPackage> {
    const [newPackage] = await db
      .insert(pointPackages)
      .values(pointPackage)
      .returning();
    return newPackage;
  }

  private async initializePointPackages(): Promise<void> {
    try {
      const existingPackages = await this.getActivePointPackages();
      if (existingPackages.length === 0) {
        // Create default packages
        await this.createPointPackage({
          name: "Starter Pack",
          points: 500,
          price: "4.99",
          description: "Perfect for getting started",
          isActive: true,
        });

        await this.createPointPackage({
          name: "Premium Pack",
          points: 1200,
          price: "9.99",
          description: "20% bonus points included",
          isActive: true,
        });

        await this.createPointPackage({
          name: "Mega Pack",
          points: 2500,
          price: "19.99",
          description: "25% bonus - maximum value",
          isActive: true,
        });
      }
    } catch (error) {
      console.error("Error initializing point packages:", error);
    }
  }
}

export const storage = new DatabaseStorage();
