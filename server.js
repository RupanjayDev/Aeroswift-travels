// server.js - Complete with Authentication
import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Admin credentials - CHANGE THESE!
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Store active login sessions
const activeSessions = new Map();

// MongoDB setup
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://rupanjay77_db_user:xZb2rInWU9aEgidB@cluster0.eoymkqx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "flightBookingDB";

let db, bookingsCollection, destinationsCollection, reviewsCollection;

// Connect to database
async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log("✅ MongoDB Connected");

    db = client.db(DB_NAME);
    bookingsCollection = db.collection("bookings");
    destinationsCollection = db.collection("destinations");
    reviewsCollection = db.collection("reviews");

    await bookingsCollection.createIndex({ createdAt: -1 });
    await destinationsCollection.createIndex({ id: 1 });
    await reviewsCollection.createIndex({ id: 1 });
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
    process.exit(1);
  }
}

// Generate secure random token
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Check if user is logged in
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");

  if (!token || !activeSessions.has(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const expiry = activeSessions.get(token);
  if (expiry < Date.now()) {
    activeSessions.delete(token);
    return res.status(401).json({ error: "Session expired" });
  }

  // Extend session
  activeSessions.set(token, Date.now() + 24 * 60 * 60 * 1000);
  next();
}

// Clean expired sessions every hour
setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of activeSessions.entries()) {
    if (expiry < now) activeSessions.delete(token);
  }
}, 3600000);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));
app.use("/css", express.static(path.join(__dirname, "src", "CSS")));
app.use(
  "/javascript",
  express.static(path.join(__dirname, "src", "javascript"))
);
app.use("/dashboard", express.static(path.join(__dirname, "src", "dashboard")));
app.use("/pages", express.static(path.join(__dirname, "src", "pages")));
app.use("/public", express.static(path.join(__dirname, "public")));

// HTML Routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "login.html"))
);
app.get("/dashboard", (req, res) =>
  res.sendFile(path.join(__dirname, "src", "dashboard", "dashboard.html"))
);
app.get("/booking", (req, res) =>
  res.sendFile(path.join(__dirname, "src", "pages", "booking", "booking.html"))
);
app.get("/flight-details", (req, res) =>
  res.sendFile(
    path.join(__dirname, "src", "pages", "flightDetails", "flight-details.html")
  )
);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", db: db ? "connected" : "disconnected" });
});

// ========== AUTHENTICATION ==========

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = generateToken();
    activeSessions.set(token, Date.now() + 24 * 60 * 60 * 1000);

    console.log(`✅ Login: ${username}`);
    res.json({ success: true, token, message: "Login successful" });
  } else {
    console.log(`❌ Failed login attempt: ${username}`);
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

app.post("/api/logout", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) activeSessions.delete(token);
  res.json({ success: true });
});

app.get("/api/verify", requireAuth, (req, res) => {
  res.json({ success: true, authenticated: true });
});

// ========== BOOKINGS ==========

app.get("/api/bookings", requireAuth, async (req, res) => {
  try {
    const bookings = await bookingsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

app.post("/api/bookings", async (req, res) => {
  try {
    const newBooking = { ...req.body, createdAt: new Date().toISOString() };
    const result = await bookingsCollection.insertOne(newBooking);
    res.json({
      message: "Booking saved",
      booking: { ...newBooking, _id: result.insertedId },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create booking" });
  }
});

app.delete("/api/bookings/:id", requireAuth, async (req, res) => {
  try {
    await bookingsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

// ========== DESTINATIONS ==========

app.get("/api/destinations", async (req, res) => {
  try {
    const destinations = await destinationsCollection.find({}).toArray();
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch destinations" });
  }
});

app.post("/api/destinations", requireAuth, async (req, res) => {
  try {
    const newDest = { id: Date.now(), ...req.body };
    await destinationsCollection.insertOne(newDest);
    res.json({ message: "Destination added", destination: newDest });
  } catch (err) {
    res.status(500).json({ error: "Failed to create" });
  }
});

app.put("/api/destinations/:id", requireAuth, async (req, res) => {
  try {
    const result = await destinationsCollection.updateOne(
      { id: Number(req.params.id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0)
      return res.status(404).json({ message: "Not found" });
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update" });
  }
});

app.delete("/api/destinations/:id", requireAuth, async (req, res) => {
  try {
    await destinationsCollection.deleteOne({ id: Number(req.params.id) });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

// ========== REVIEWS ==========

app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await reviewsCollection.find({}).toArray();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

app.post("/api/reviews", requireAuth, async (req, res) => {
  try {
    const newReview = { id: Date.now(), ...req.body };
    await reviewsCollection.insertOne(newReview);
    res.json({ message: "Review added", review: newReview });
  } catch (err) {
    res.status(500).json({ error: "Failed to create" });
  }
});

app.put("/api/reviews/:id", requireAuth, async (req, res) => {
  try {
    const result = await reviewsCollection.updateOne(
      { id: Number(req.params.id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0)
      return res.status(404).json({ message: "Not found" });
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update" });
  }
});

app.delete("/api/reviews/:id", requireAuth, async (req, res) => {
  try {
    await reviewsCollection.deleteOne({ id: Number(req.params.id) });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

// Start server
connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Server: http://localhost:${PORT}`);
  });
});
