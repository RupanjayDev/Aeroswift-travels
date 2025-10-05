// server.js

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(process.cwd(), "data/bookings.json");

// Middleware
app.use(express.json()); // so we can parse JSON bodies

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use("/css", express.static(path.join(__dirname, "src", "CSS")));
app.use(
  "/javascript",
  express.static(path.join(__dirname, "src", "javascript"))
);
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
  res.sendFile(
    path.join(__dirname, "src", "pages", "flightDetails", "flight-details.html")
  )
);

// -----------------------------
// API ROUTE for saving bookings
// -----------------------------
app.post("/api/bookings", (req, res) => {
  const filePath = path.join(__dirname, "bookings.json");
  let bookings = [];

  if (fs.existsSync(filePath)) {
    bookings = JSON.parse(fs.readFileSync(filePath));
  }

  const newBooking = { ...req.body, createdAt: new Date().toISOString() };
  bookings.push(newBooking);

  fs.writeFileSync(filePath, JSON.stringify(bookings, null, 2));

  res.json({ message: "Booking saved successfully", booking: newBooking });
});

// API to get bookings
app.get("/api/bookings", (req, res) => {
  const filePath = path.join(__dirname, "bookings.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      // If file doesn't exist, return empty array
      return res.json([]);
    }

    try {
      const bookings = JSON.parse(data);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to parse JSON" });
    }
  });
});


// Helper to read/write JSON file
function readData() {
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// =============== BOOKINGS =================
app.get("/api/bookings", (req, res) => {
  const data = readData();
  res.json(data.bookings || []);
});

// =============== DESTINATIONS ==============
app.get("/api/destinations", (req, res) => {
  const data = readData();
  res.json(data.destinations || []);
});

app.post("/api/destinations", (req, res) => {
  const data = readData();
  const newDest = { id: Date.now(), ...req.body };
  data.destinations.push(newDest);
  writeData(data);
  res.json({ message: "Destination added", newDest });
});

app.put("/api/destinations/:id", (req, res) => {
  const data = readData();
  const id = Number(req.params.id);
  const index = data.destinations.findIndex((d) => d.id === id);
  if (index === -1) return res.status(404).json({ message: "Not found" });
  data.destinations[index] = { ...data.destinations[index], ...req.body };
  writeData(data);
  res.json({ message: "Destination updated" });
});

app.delete("/api/destinations/:id", (req, res) => {
  const data = readData();
  data.destinations = data.destinations.filter(
    (d) => d.id !== Number(req.params.id)
  );
  writeData(data);
  res.json({ message: "Destination deleted" });
});

// =============== REVIEWS ==================
app.get("/api/reviews", (req, res) => {
  const data = readData();
  res.json(data.reviews || []);
});

app.post("/api/reviews", (req, res) => {
  const data = readData();
  const newReview = { id: Date.now(), ...req.body };
  data.reviews.push(newReview);
  writeData(data);
  res.json({ message: "Review added", newReview });
});

app.put("/api/reviews/:id", (req, res) => {
  const data = readData();
  const id = Number(req.params.id);
  const index = data.reviews.findIndex((r) => r.id === id);
  if (index === -1) return res.status(404).json({ message: "Not found" });
  data.reviews[index] = { ...data.reviews[index], ...req.body };
  writeData(data);
  res.json({ message: "Review updated" });
});

app.delete("/api/reviews/:id", (req, res) => {
  const data = readData();
  data.reviews = data.reviews.filter((r) => r.id !== Number(req.params.id));
  writeData(data);
  res.json({ message: "Review deleted" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
