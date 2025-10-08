// dashboard.js - Complete with Authentication
const BASE_URL = "/api";

// ========== AUTHENTICATION ==========

async function checkAuth() {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    window.location.href = "/login";
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      localStorage.removeItem("adminToken");
      window.location.href = "/login";
      return false;
    }
    return true;
  } catch (error) {
    console.error("Auth failed:", error);
    localStorage.removeItem("adminToken");
    window.location.href = "/login";
    return false;
  }
}

function authFetch(url, options = {}) {
  const token = localStorage.getItem("adminToken");
  if (!options.headers) options.headers = {};
  options.headers["Authorization"] = `Bearer ${token}`;
  return fetch(url, options);
}

function logout() {
  const token = localStorage.getItem("adminToken");
  if (token) {
    fetch(`${BASE_URL}/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  localStorage.removeItem("adminToken");
  window.location.href = "/login";
}

window.logout = logout;

// ========== BOOKINGS ==========

async function loadBookings() {
  try {
    const res = await authFetch(`${BASE_URL}/bookings`);
    if (!res.ok) throw new Error("Failed to fetch");

    const bookings = await res.json();
    const container = document.getElementById("bookingsContainer");
    container.innerHTML = "";

    if (bookings.length === 0) {
      container.innerHTML = "<p class='text-muted'>No bookings yet.</p>";
      return;
    }

    bookings.forEach((booking, index) => {
      const div = document.createElement("div");
      div.classList.add("col");
      div.innerHTML = `
        <div class="card h-100">
          <div class="card-body">
            <h6 class="card-title">${index + 1}. ${booking.fullName}</h6>
            <p class="card-text mb-1"><small><strong>Email:</strong> ${
              booking.email || "N/A"
            }</small></p>
            <p class="card-text mb-1"><small><strong>Passport:</strong> ${
              booking.passportNumber
            }</small></p>
            <p class="card-text mb-1"><small><strong>Contact:</strong> ${
              booking.contactNumber
            }</small></p>
            <p class="card-text mb-1"><small><strong>Route:</strong> ${
              booking.departureCity
            } → ${booking.destinationCity}</small></p>
            <p class="card-text mb-1"><small><strong>Departure Date:</strong> ${
              booking.departureDate
            }</small></p>
            <p class="card-text mb-1"><small><strong>Return Date:</strong> ${
              booking.returnDate
            }</small></p>
            <p class="card-text mb-1"><small><strong>Passengers:</strong> ${
              booking.passengers
            }</small></p>
            <p class="card-text"><small class="text-muted">${new Date(
              booking.createdAt
            ).toLocaleString()}</small></p>
          </div>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading bookings:", err);
  }
}

// ========== DESTINATIONS ==========

async function loadDestinationsList() {
  try {
    const res = await fetch(`${BASE_URL}/destinations`);
    const destinations = await res.json();
    const list = document.getElementById("destList");
    list.innerHTML = "";

    if (destinations.length === 0) {
      list.innerHTML = "<li class='list-group-item'>No destinations yet.</li>";
      return;
    }

    destinations.forEach((dest) => {
      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
        <div class="flex-grow-1">
          <strong>${dest.title}</strong> - ${dest.price}<br>
          ${
            dest.image
              ? `<img src="${dest.image}" width="100" class="rounded mt-2"/>`
              : ""
          }
        </div>
        <div>
          <button class="btn btn-sm btn-warning me-2" onclick="editDestination(${
            dest.id
          })">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteDestination(${
            dest.id
          })">Delete</button>
        </div>
      `;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading destinations:", err);
  }
}

const destForm = document.getElementById("destinationForm");
if (destForm) {
  destForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("destTitle").value;
    const price = document.getElementById("destPrice").value;
    const image = document.getElementById("destImage").value;

    try {
      await authFetch(`${BASE_URL}/destinations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, price, image }),
      });
      e.target.reset();
      await loadDestinationsList();
      alert("✅ Destination added!");
    } catch (err) {
      alert("❌ Failed to add destination");
    }
  });
}

window.editDestination = async function (id) {
  const newTitle = prompt("New title:");
  if (!newTitle) return;
  const newPrice = prompt("New price:");
  if (!newPrice) return;
  const newImage = prompt("New image URL (optional):");

  try {
    const updateData = { title: newTitle, price: newPrice };
    if (newImage) updateData.image = newImage;

    await authFetch(`${BASE_URL}/destinations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    await loadDestinationsList();
    alert("✅ Updated!");
  } catch (err) {
    alert("❌ Failed to update");
  }
};

window.deleteDestination = async function (id) {
  if (!confirm("Delete this destination?")) return;
  try {
    await authFetch(`${BASE_URL}/destinations/${id}`, { method: "DELETE" });
    await loadDestinationsList();
    alert("🗑️ Deleted!");
  } catch (err) {
    alert("❌ Failed to delete");
  }
};

// ========== REVIEWS ==========

async function loadReviewsList() {
  try {
    const res = await fetch(`${BASE_URL}/reviews`);
    const reviews = await res.json();
    const list = document.getElementById("revList");
    list.innerHTML = "";

    if (reviews.length === 0) {
      list.innerHTML = "<li class='list-group-item'>No reviews yet.</li>";
      return;
    }

    reviews.forEach((review) => {
      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
        <div class="flex-grow-1">
          <strong>${review.name}</strong><br>
          <p class="mb-1">${review.text}</p>
          ${
            review.image
              ? `<img src="${review.image}" width="80" class="rounded mt-2"/>`
              : ""
          }
        </div>
        <div>
          <button class="btn btn-sm btn-warning me-2" onclick="editReview(${
            review.id
          })">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteReview(${
            review.id
          })">Delete</button>
        </div>
      `;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading reviews:", err);
  }
}

const revForm = document.getElementById("reviewForm");
if (revForm) {
  revForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("revName").value;
    const image = document.getElementById("revImage").value;
    const text = document.getElementById("revText").value;

    try {
      await authFetch(`${BASE_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image, text }),
      });
      e.target.reset();
      await loadReviewsList();
      alert("✅ Review added!");
    } catch (err) {
      alert("❌ Failed to add review");
    }
  });
}

window.editReview = async function (id) {
  const name = prompt("New name:");
  if (!name) return;
  const text = prompt("New text:");
  if (!text) return;
  const image = prompt("New image URL (optional):");

  try {
    const updateData = { name, text };
    if (image) updateData.image = image;

    await authFetch(`${BASE_URL}/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    await loadReviewsList();
    alert("✅ Updated!");
  } catch (err) {
    alert("❌ Failed to update");
  }
};

window.deleteReview = async function (id) {
  if (!confirm("Delete this review?")) return;
  try {
    await authFetch(`${BASE_URL}/reviews/${id}`, { method: "DELETE" });
    await loadReviewsList();
    alert("🗑️ Deleted!");
  } catch (err) {
    alert("❌ Failed to delete");
  }
};

// ========== TABS ==========

document.addEventListener("DOMContentLoaded", async () => {
  const isAuth = await checkAuth();
  if (!isAuth) return;

  loadBookings();

  const tabs = document.querySelectorAll("#dashboardTabs .nav-link");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = tab.getAttribute("data-target");
      if (targetId === "tabDisabled") return;

      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((c) => (c.style.display = "none"));

      tab.classList.add("active");
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.style.display = "block";
        if (targetId === "tabQuickActions") {
          loadDestinationsList();
          loadReviewsList();
        }
      }
    });
  });
});
