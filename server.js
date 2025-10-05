// server.js with MongoDB
import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection string (from environment variable or hardcoded for testing)
const MONGODB_URI = process.env.MONGODB_URI || "your-mongodb-connection-string-here";
const DB_NAME = "flightBookingDB";

let db;
let bookingsCollection;
let destinationsCollection;
let reviewsCollection;

// Connect to MongoDB
async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log("✅ Connected to MongoDB");
    
    db = client.db(DB_NAME);
    bookingsCollection = db.collection("bookings");
    destinationsCollection = db.collection("destinations");
    reviewsCollection = db.collection("reviews");
    
    // Create indexes for better performance
    await bookingsCollection.createIndex({ createdAt: -1 });
    await destinationsCollection.createIndex({ id: 1 });
    await reviewsCollection.createIndex({ id: 1 });
    
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use("/css", express.static(path.join(__dirname, "src", "CSS")));
app.use("/javascript", express.static(path.join(__dirname, "src", "javascript")));
app.use("/dashboard", express.static(path.join(__dirname, "src", "dashboard")));
app.use("/pages", express.static(path.join(__dirname, "src", "pages")));

// Routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/dashboard", (req, res) =>
  res.sendFile(path.join(__dirname, "src", "dashboard", "dashboard.html"))
);
app.get("/booking", (req, res) =>
  res.sendFile(path.join(__dirname, "src", "pages", "booking", "booking.html"))
);
app.get("/flight-details", (req, res) =>
  res.sendFile(path.join(__dirname, "src", "pages", "flightDetails", "flight-details.html"))
);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", db: db ? "connected" : "disconnected" });
});

// =============== BOOKINGS =================
app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await bookingsCollection.find({}).sort({ createdAt: -1 }).toArray();
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

app.post("/api/bookings", async (req, res) => {
  try {
    const newBooking = {
      ...req.body,
      createdAt: new Date().toISOString()
    };
    const result = await bookingsCollection.insertOne(newBooking);
    res.json({ 
      message: "Booking saved successfully", 
      booking: { ...newBooking, _id: result.insertedId }
    });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

app.delete("/api/bookings/:id", async (req, res) => {
  try {
    await bookingsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Booking deleted" });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

// =============== DESTINATIONS ==============
app.get("/api/destinations", async (req, res) => {
  try {
    const destinations = await destinationsCollection.find({}).toArray();
    res.json(destinations);
  } catch (err) {
    console.error("Error fetching destinations:", err);
    res.status(500).json({ error: "Failed to fetch destinations" });
  }
});

app.post("/api/destinations", async (req, res) => {
  try {
    const newDest = {
      id: Date.now(),
      ...req.body
    };
    await destinationsCollection.insertOne(newDest);
    res.json({ message: "Destination added", destination: newDest });
  } catch (err) {
    console.error("Error creating destination:", err);
    res.status(500).json({ error: "Failed to create destination" });
  }
});

app.put("/api/destinations/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await destinationsCollection.updateOne(
      { id: id },
      { $set: req.body }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Destination not found" });
    }
    
    res.json({ message: "Destination updated" });
  } catch (err) {
    console.error("Error updating destination:", err);
    res.status(500).json({ error: "Failed to update destination" });
  }
});

app.delete("/api/destinations/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await destinationsCollection.deleteOne({ id: id });
    res.json({ message: "Destination deleted" });
  } catch (err) {
    console.error("Error deleting destination:", err);
    res.status(500).json({ error: "Failed to delete destination" });
  }
});

// =============== REVIEWS ==================
app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await reviewsCollection.find({}).toArray();
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

app.post("/api/reviews", async (req, res) => {
  try {
    const newReview = {
      id: Date.now(),
      ...req.body
    };
    await reviewsCollection.insertOne(newReview);
    res.json({ message: "Review added", review: newReview });
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ error: "Failed to create review" });
  }
});

app.put("/api/reviews/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await reviewsCollection.updateOne(
      { id: id },
      { $set: req.body }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    res.json({ message: "Review updated" });
  } catch (err) {
    console.error("Error updating review:", err);
    res.status(500).json({ error: "Failed to update review" });
  }
});

app.delete("/api/reviews/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await reviewsCollection.deleteOne({ id: id });
    res.json({ message: "Review deleted" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

// Start server after DB connection
connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});