// dashboard.js - Fixed for your HTML structure
const BASE_URL = "/api";

// ============ BOOKINGS ============
async function loadBookings() {
  try {
    console.log("Fetching bookings...");
    const res = await fetch(`${BASE_URL}/bookings`);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const bookings = await res.json();
    console.log("Bookings loaded:", bookings);

    const container = document.getElementById("bookingsContainer");
    if (!container) {
      console.error("bookingsContainer not found");
      return;
    }

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
            <p class="card-text mb-1"><small><strong>Passport:</strong> ${
              booking.passportNumber
            }</small></p>
            <p class="card-text mb-1"><small><strong>Nationality:</strong> ${
              booking.nationality
            }</small></p>
            <p class="card-text mb-1"><small><strong>Contact:</strong> ${
              booking.contactNumber
            }</small></p>
            <p class="card-text mb-1"><small><strong>Route:</strong> ${
              booking.departureCity
            } → ${booking.destinationCity}</small></p>
            <p class="card-text mb-1"><small><strong>Departure:</strong> ${
              booking.departureDate
            }</small></p>
            <p class="card-text mb-1"><small><strong>Return:</strong> ${
              booking.returnDate || "One-way"
            }</small></p>
            <p class="card-text mb-1"><small><strong>Passengers:</strong> ${
              booking.passengers
            }</small></p>
            ${
              booking.specialRequests
                ? `<p class="card-text mb-1"><small><strong>Requests:</strong> ${booking.specialRequests}</small></p>`
                : ""
            }
            <p class="card-text"><small class="text-muted">Booked: ${new Date(
              booking.createdAt
            ).toLocaleString()}</small></p>
          </div>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Failed to load bookings", err);
    const container = document.getElementById("bookingsContainer");
    if (container) {
      container.innerHTML = `<p class='text-danger'>Failed to load bookings: ${err.message}</p>`;
    }
  }
}

// ============ DESTINATIONS ============
async function loadDestinationsList() {
  try {
    console.log("Fetching destinations...");
    const res = await fetch(`${BASE_URL}/destinations`);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const destinations = await res.json();
    console.log("Destinations loaded:", destinations);

    const list = document.getElementById("destList");
    if (!list) {
      console.error("destList not found");
      return;
    }

    list.innerHTML = "";

    if (destinations.length === 0) {
      list.innerHTML =
        "<li class='list-group-item'>No destinations added yet.</li>";
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
              ? `<img src="${dest.image}" width="100" class="rounded mt-2" alt="${dest.title}"/>`
              : ""
          }
        </div>
        <div class="ms-3">
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
    console.error("Failed to load destinations", err);
    const list = document.getElementById("destList");
    if (list) {
      list.innerHTML = `<li class='list-group-item text-danger'>Failed to load: ${err.message}</li>`;
    }
  }
}

// Add new destination
const destForm = document.getElementById("destinationForm");
if (destForm) {
  destForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("destTitle").value;
    const price = document.getElementById("destPrice").value;
    const image = document.getElementById("destImage").value;

    try {
      const res = await fetch(`${BASE_URL}/destinations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ title, price, image }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      e.target.reset();
      await loadDestinationsList();
      alert("✅ Destination added successfully!");
    } catch (err) {
      console.error("Failed to add destination", err);
      alert("❌ Failed to add destination: " + err.message);
    }
  });
}

// Edit destination
window.editDestination = async function (id) {
  const newTitle = prompt("Enter new destination title:");
  if (!newTitle) return;

  const newPrice = prompt("Enter new price:");
  if (!newPrice) return;

  const newImage = prompt("Enter new image URL (optional):");

  try {
    const updateData = { title: newTitle, price: newPrice };
    if (newImage) updateData.image = newImage;

    const res = await fetch(`${BASE_URL}/destinations/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    await loadDestinationsList();
    alert("✅ Destination updated!");
  } catch (err) {
    console.error("Failed to update destination", err);
    alert("❌ Failed to update: " + err.message);
  }
};

// Delete destination
window.deleteDestination = async function (id) {
  if (!confirm("Are you sure you want to delete this destination?")) return;

  try {
    const res = await fetch(`${BASE_URL}/destinations/${id}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    await loadDestinationsList();
    alert("🗑️ Destination deleted!");
  } catch (err) {
    console.error("Failed to delete destination", err);
    alert("❌ Failed to delete: " + err.message);
  }
};

// ============ REVIEWS ============
async function loadReviewsList() {
  try {
    console.log("Fetching reviews...");
    const res = await fetch(`${BASE_URL}/reviews`);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const reviews = await res.json();
    console.log("Reviews loaded:", reviews);

    const list = document.getElementById("revList");
    if (!list) {
      console.error("revList not found");
      return;
    }

    list.innerHTML = "";

    if (reviews.length === 0) {
      list.innerHTML = "<li class='list-group-item'>No reviews added yet.</li>";
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
              ? `<img src="${review.image}" width="80" class="rounded mt-2" alt="${review.name}"/>`
              : ""
          }
        </div>
        <div class="ms-3">
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
    console.error("Failed to load reviews", err);
    const list = document.getElementById("revList");
    if (list) {
      list.innerHTML = `<li class='list-group-item text-danger'>Failed to load: ${err.message}</li>`;
    }
  }
}

// Add review
const revForm = document.getElementById("reviewForm");
if (revForm) {
  revForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("revName").value;
    const image = document.getElementById("revImage").value;
    const text = document.getElementById("revText").value;

    try {
      const res = await fetch(`${BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, image, text }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      e.target.reset();
      await loadReviewsList();
      alert("✅ Review added successfully!");
    } catch (err) {
      console.error("Failed to add review", err);
      alert("❌ Failed to add review: " + err.message);
    }
  });
}

// Edit review
window.editReview = async function (id) {
  const name = prompt("Enter new reviewer name:");
  if (!name) return;

  const text = prompt("Enter new review text:");
  if (!text) return;

  const image = prompt("Enter new image URL (optional):");

  try {
    const updateData = { name, text };
    if (image) updateData.image = image;

    const res = await fetch(`${BASE_URL}/reviews/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    await loadReviewsList();
    alert("✅ Review updated!");
  } catch (err) {
    console.error("Failed to update review", err);
    alert("❌ Failed to update: " + err.message);
  }
};

// Delete review
window.deleteReview = async function (id) {
  if (!confirm("Are you sure you want to delete this review?")) return;

  try {
    const res = await fetch(`${BASE_URL}/reviews/${id}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    await loadReviewsList();
    alert("🗑️ Review deleted!");
  } catch (err) {
    console.error("Failed to delete review", err);
    alert("❌ Failed to delete: " + err.message);
  }
};

// ============ TABS FUNCTIONALITY ============
document.addEventListener("DOMContentLoaded", () => {
  console.log("Dashboard initializing...");

  // Load data for Bookings tab (default active)
  loadBookings();

  // Tab switching
  const tabs = document.querySelectorAll("#dashboardTabs .nav-link");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();

      const targetId = tab.getAttribute("data-target");

      // Don't switch if clicking disabled tab
      if (targetId === "tabDisabled") {
        return;
      }

      // Remove active class from all tabs
      tabs.forEach((t) => t.classList.remove("active"));

      // Hide all tab contents
      tabContents.forEach((content) => {
        content.style.display = "none";
      });

      // Add active class to clicked tab
      tab.classList.add("active");

      // Show corresponding content
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.style.display = "block";

        // Load data when Quick Actions tab is opened
        if (targetId === "tabQuickActions") {
          loadDestinationsList();
          loadReviewsList();
        }
      }
    });
  });
});
