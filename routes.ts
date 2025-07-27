import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import Stripe from "stripe";
import { insertTransactionSchema } from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Get user points and recent transactions
  app.get("/api/dashboard", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const user = await storage.getUser(req.user.id);
      const recentTransactions = await storage.getUserTransactions(req.user.id, 10);
      
      res.json({
        user,
        recentTransactions
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching dashboard data: " + error.message });
    }
  });

  // Get available point packages
  app.get("/api/point-packages", async (req, res) => {
    try {
      const packages = await storage.getActivePointPackages();
      res.json(packages);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching point packages: " + error.message });
    }
  });

  // Create payment intent for point purchase
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { packageId } = req.body;
      
      if (!packageId) {
        return res.status(400).json({ message: "Package ID is required" });
      }

      const pointPackage = await storage.getPointPackage(packageId);
      if (!pointPackage) {
        return res.status(404).json({ message: "Point package not found" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(pointPackage.price) * 100), // Convert to cents
        currency: "usd",
        metadata: {
          userId: req.user.id,
          packageId: pointPackage.id,
          points: pointPackage.points.toString(),
        },
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        packageInfo: pointPackage
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Stripe webhook to handle successful payments
  app.post("/api/stripe-webhook", async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const { userId, packageId, points } = paymentIntent.metadata;

        try {
          // Add points to user account
          await storage.addPointsToUser(userId, parseInt(points));
          
          // Create transaction record
          await storage.createTransaction({
            userId,
            type: 'purchase',
            amount: parseInt(points),
            description: `Purchased ${points} points`,
            stripePaymentIntentId: paymentIntent.id,
          });

          // Update user's total spent
          const pointPackage = await storage.getPointPackage(packageId);
          if (pointPackage) {
            await storage.updateUserTotalSpent(userId, parseFloat(pointPackage.price));
          }
        } catch (error) {
          console.error('Error processing successful payment:', error);
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });

  // Get user transaction history
  app.get("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const transactions = await storage.getUserTransactions(req.user.id, limit);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching transactions: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
