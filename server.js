// server.js - Complete with Authentication + Email Notifications
import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// ========== EMAIL CONFIG ==========
// Set these environment variables:
//   EMAIL_USER     — your Gmail address (e.g. aeroswift@gmail.com)
//   EMAIL_PASS     — Gmail App Password (NOT your account password)
//   NOTIFY_EMAIL   — where booking alerts should land (admin email)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendBookingEmail(booking) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️  Email not configured — skipping email send");
    return;
  }

  const icon =
    booking.travelType === "flight"
      ? "✈️"
      : booking.travelType === "bus"
        ? "🚌"
        : "🚆";

  // Build transport-specific rows
  let transportRows = "";
  if (booking.travelType === "flight") {
    transportRows = `
      <tr><td><b>Passport</b></td><td>${booking.passportNumber || "N/A"}</td></tr>
      <tr><td><b>Class</b></td><td>${booking.flightClass || "Economy"}</td></tr>
      <tr><td><b>Seat Preference</b></td><td>${booking.seatPreference || "Any"}</td></tr>
      <tr><td><b>Return Date</b></td><td>${booking.returnDate || "One-way"}</td></tr>
    `;
  } else if (booking.travelType === "bus") {
    transportRows = `
      <tr><td><b>Bus Type</b></td><td>${booking.busType || "N/A"}</td></tr>
      <tr><td><b>Operator</b></td><td>${booking.busOperator || "Any"}</td></tr>
      <tr><td><b>Pick-up Point</b></td><td>${booking.pickupPoint || "N/A"}</td></tr>
    `;
  } else if (booking.travelType === "train") {
    transportRows = `
      <tr><td><b>Train Class</b></td><td>${booking.trainClass || "N/A"}</td></tr>
      <tr><td><b>Quota</b></td><td>${booking.trainQuota || "General"}</td></tr>
      <tr><td><b>Train Name</b></td><td>${booking.trainName || "Not specified"}</td></tr>
    `;
  }

  const htmlAdmin = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family:'Segoe UI',sans-serif;background:#f4f6f8;padding:0;margin:0;">
      <div style="max-width:580px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#396960,#173648);padding:24px 28px;">
          <h2 style="color:#d6b24c;margin:0;font-size:1.3rem;">${icon} New ${booking.travelType.charAt(0).toUpperCase() + booking.travelType.slice(1)} Booking</h2>
          <p style="color:rgba(214,178,76,0.7);margin:6px 0 0;font-size:0.85rem;">${new Date(booking.createdAt).toLocaleString("en-IN")}</p>
        </div>
        <div style="padding:24px 28px;">
          <table style="width:100%;border-collapse:collapse;font-size:0.92rem;">
            <tr style="background:#f8f9fa;"><td style="padding:8px 12px;font-weight:700;width:40%;color:#396960;">Field</td><td style="padding:8px 12px;font-weight:700;color:#396960;">Details</td></tr>
            <tr><td style="padding:8px 12px;border-top:1px solid #eee;"><b>Full Name</b></td><td style="padding:8px 12px;border-top:1px solid #eee;">${booking.fullName}</td></tr>
            <tr><td style="padding:8px 12px;border-top:1px solid #eee;"><b>Email</b></td><td style="padding:8px 12px;border-top:1px solid #eee;">${booking.email}</td></tr>
            <tr><td style="padding:8px 12px;border-top:1px solid #eee;"><b>Contact</b></td><td style="padding:8px 12px;border-top:1px solid #eee;">${booking.contactNumber}</td></tr>
            <tr><td style="padding:8px 12px;border-top:1px solid #eee;"><b>Travel Type</b></td><td style="padding:8px 12px;border-top:1px solid #eee;">${icon} ${booking.travelType}</td></tr>
            <tr><td style="padding:8px 12px;border-top:1px solid #eee;"><b>From</b></td><td style="padding:8px 12px;border-top:1px solid #eee;">${booking.departureCity}</td></tr>
            <tr><td style="padding:8px 12px;border-top:1px solid #eee;"><b>To</b></td><td style="padding:8px 12px;border-top:1px solid #eee;">${booking.destinationCity}</td></tr>
            <tr><td style="padding:8px 12px;border-top:1px solid #eee;"><b>Date</b></td><td style="padding:8px 12px;border-top:1px solid #eee;">${booking.departureDate}</td></tr>
            <tr><td style="padding:8px 12px;border-top:1px solid #eee;"><b>Passengers</b></td><td style="padding:8px 12px;border-top:1px solid #eee;">${booking.passengers}</td></tr>
            ${transportRows}
            ${booking.specialRequests ? `<tr><td style="padding:8px 12px;border-top:1px solid #eee;"><b>Notes</b></td><td style="padding:8px 12px;border-top:1px solid #eee;">${booking.specialRequests}</td></tr>` : ""}
          </table>
        </div>
        <div style="background:#f4f6f8;padding:16px 28px;text-align:center;">
          <p style="margin:0;font-size:0.82rem;color:#888;">Aeroswift Tours & Travels — Admin Alert</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const htmlCustomer = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family:'Segoe UI',sans-serif;background:#f4f6f8;padding:0;margin:0;">
      <div style="max-width:560px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#396960,#173648);padding:24px 28px;">
          <h2 style="color:#d6b24c;margin:0;">✅ Booking Confirmed</h2>
          <p style="color:rgba(214,178,76,0.75);margin:6px 0 0;font-size:0.85rem;">We've received your request</p>
        </div>
        <div style="padding:28px;">
          <p style="font-size:1rem;color:#333;">Dear <strong>${booking.fullName}</strong>,</p>
          <p style="color:#555;line-height:1.6;">Thank you for choosing <strong>Aeroswift Tours & Travels</strong>. We have received your ${icon} <strong>${booking.travelType}</strong> booking request from <strong>${booking.departureCity}</strong> to <strong>${booking.destinationCity}</strong> on <strong>${booking.departureDate}</strong>.</p>
          <p style="color:#555;line-height:1.6;">Our team will review your request and contact you at this email or on <strong>${booking.contactNumber}</strong> within 24 hours to confirm availability and pricing.</p>
          <div style="background:#f0f7f4;border-left:4px solid #396960;padding:14px 16px;border-radius:4px;margin:16px 0;">
            <p style="margin:0;color:#173648;font-size:0.9rem;">📞 For urgent queries, please WhatsApp or call us directly.</p>
          </div>
          <p style="color:#555;">Warm regards,<br><strong style="color:#396960;">Aeroswift Tours & Travels</strong></p>
        </div>
        <div style="background:#f4f6f8;padding:14px 28px;text-align:center;">
          <p style="margin:0;font-size:0.8rem;color:#aaa;">© 2025 Aeroswift. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    // Email to admin
    await transporter.sendMail({
      from: `"Aeroswift Bookings" <${process.env.EMAIL_USER}>`,
      to: process.env.NOTIFY_EMAIL || process.env.EMAIL_USER,
      subject: `${icon} New ${booking.travelType} booking — ${booking.fullName}`,
      html: htmlAdmin,
    });

    // Confirmation email to customer
    if (booking.email) {
      await transporter.sendMail({
        from: `"Aeroswift Tours & Travels" <${process.env.EMAIL_USER}>`,
        to: booking.email,
        subject: `✅ Booking Request Received — Aeroswift`,
        html: htmlCustomer,
      });
    }

    console.log(`📧 Booking emails sent for ${booking.fullName}`);
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
  }
}

const activeSessions = new Map();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://rupanjay77_db_user:xZb2rInWU9aEgidB@cluster0.eoymkqx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "flightBookingDB";

let db,
  bookingsCollection,
  destinationsCollection,
  reviewsCollection,
  settingsCollection;

async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log("✅ MongoDB Connected");

    db = client.db(DB_NAME);
    bookingsCollection = db.collection("bookings");
    destinationsCollection = db.collection("destinations");
    reviewsCollection = db.collection("reviews");
    settingsCollection = db.collection("settings");

    await bookingsCollection.createIndex({ createdAt: -1 });
    await destinationsCollection.createIndex({ id: 1 });
    await reviewsCollection.createIndex({ id: 1 });
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
    process.exit(1);
  }
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

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

  activeSessions.set(token, Date.now() + 24 * 60 * 60 * 1000);
  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of activeSessions.entries()) {
    if (expiry < now) activeSessions.delete(token);
  }
}, 3600000);

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));
app.use("/css", express.static(path.join(__dirname, "src", "CSS")));
app.use(
  "/javascript",
  express.static(path.join(__dirname, "src", "javascript")),
);
app.use("/dashboard", express.static(path.join(__dirname, "src", "dashboard")));
app.use("/pages", express.static(path.join(__dirname, "src", "pages")));
app.use("/public", express.static(path.join(__dirname, "public")));

// HTML Routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "login.html")),
);
app.get("/dashboard", (req, res) =>
  res.sendFile(path.join(__dirname, "src", "dashboard", "dashboard.html")),
);
app.get("/booking", (req, res) =>
  res.sendFile(path.join(__dirname, "src", "pages", "booking", "booking.html")),
);
app.get("/flight-details", (req, res) =>
  res.sendFile(
    path.join(
      __dirname,
      "src",
      "pages",
      "flightDetails",
      "flight-details.html",
    ),
  ),
);

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
    const savedBooking = { ...newBooking, _id: result.insertedId };

    // Send email notification (async, don't block response)
    sendBookingEmail(savedBooking).catch(console.error);

    res.json({ message: "Booking saved", booking: savedBooking });
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
      { $set: req.body },
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
      { $set: req.body },
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

// ========== SETTINGS ==========

app.get("/api/settings", async (req, res) => {
  try {
    const settings = await settingsCollection.findOne({ type: "global" });
    res.json(settings || {});
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

app.post("/api/settings", requireAuth, async (req, res) => {
  try {
    await settingsCollection.updateOne(
      { type: "global" },
      { $set: { ...req.body, type: "global" } },
      { upsert: true },
    );
    res.json({ message: "Settings updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// Start server
connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Server: http://localhost:${PORT}`);
    if (!process.env.EMAIL_USER) {
      console.log("⚠️  EMAIL_USER not set — booking emails disabled");
      console.log("   Set EMAIL_USER, EMAIL_PASS, NOTIFY_EMAIL to enable");
    }
  });
});
