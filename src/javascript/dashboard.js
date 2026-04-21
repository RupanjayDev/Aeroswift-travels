// dashboard.js - FULL UPDATED (DESTINATIONS CMS ENABLED)

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
            <p><strong>Email:</strong> ${booking.email || "N/A"}</p>
            <p><strong>Passport:</strong> ${booking.passportNumber}</p>
            <p><strong>Contact:</strong> ${booking.contactNumber}</p>
            <p><strong>Route:</strong> ${booking.departureCity} → ${booking.destinationCity}</p>
            <p><strong>Date:</strong> ${booking.departureDate}</p>
          </div>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading bookings:", err);
  }
}

// ========== DESTINATIONS (CMS ENABLED) ==========
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
          <small>${dest.description || ""}</small><br>
          <small>Features: ${(dest.features || []).join(", ")}</small><br>
          ${
            dest.image
              ? `<img src="${dest.image}" width="100" class="rounded mt-2"/>`
              : ""
          }
        </div>
        <div>
          <button class="btn btn-sm btn-warning me-2" onclick="editDestination(${dest.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteDestination(${dest.id})">Delete</button>
        </div>
      `;

      list.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading destinations:", err);
  }
}

// ========== ADD DESTINATION ==========
const destForm = document.getElementById("destinationForm");

if (destForm) {
  destForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("destTitle").value;
    const price = document.getElementById("destPrice").value;
    const image = document.getElementById("destImage").value;
    const description = document.getElementById("destDescription").value;

    const features = document
      .getElementById("destFeatures")
      .value.split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    const gallery = document
      .getElementById("destGallery")
      .value.split(",")
      .map((g) => g.trim())
      .filter(Boolean);

    try {
      await authFetch(`${BASE_URL}/destinations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          price,
          image,
          description,
          features,
          gallery,
        }),
      });

      e.target.reset();
      await loadDestinationsList();
      alert("✅ Destination added!");
    } catch (err) {
      alert("❌ Failed to add destination");
    }
  });
}

// ========== EDIT DESTINATION ==========
window.editDestination = async function (id) {
  const newTitle = prompt("New title:");
  if (!newTitle) return;

  const newPrice = prompt("New price:");
  if (!newPrice) return;

  const newImage = prompt("New image/video URL:");
  const newDescription = prompt("New description:");
  const newFeatures = prompt("Features (comma separated):");
  const newGallery = prompt("Gallery URLs (comma separated):");

  const updateData = {
    title: newTitle,
    price: newPrice,
  };

  if (newImage) updateData.image = newImage;
  if (newDescription) updateData.description = newDescription;

  if (newFeatures) {
    updateData.features = newFeatures.split(",").map((f) => f.trim());
  }

  if (newGallery) {
    updateData.gallery = newGallery.split(",").map((g) => g.trim());
  }

  try {
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

// ========== DELETE ==========
window.deleteDestination = async function (id) {
  if (!confirm("Delete this destination?")) return;

  try {
    await authFetch(`${BASE_URL}/destinations/${id}`, {
      method: "DELETE",
    });

    await loadDestinationsList();
    alert("🗑️ Deleted!");
  } catch (err) {
    alert("❌ Failed to delete");
  }
};

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", async () => {
  const isAuth = await checkAuth();
  if (!isAuth) return;

  loadBookings();
  loadDestinationsList();
});
