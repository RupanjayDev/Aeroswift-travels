// dashboard.js (with backend integration)
const BASE_URL = "http://localhost:3000/api";

// ============ BOOKINGS ============
async function loadBookings() {
  try {
    const res = await fetch(`${BASE_URL}/bookings`);
    const bookings = await res.json();

    const container = document.getElementById("bookingsContainer");
    container.innerHTML = "";

    if (bookings.length === 0) {
      container.innerHTML = "<p class='text-muted'>No bookings yet.</p>";
      return;
    }

    bookings.forEach((booking, index) => {
      const div = document.createElement("div");
      div.classList.add("col", "border", "p-2", "m-1", "rounded-4");
      div.innerHTML = `
        <strong>${index + 1}. ${booking.fullName}</strong><br>
        Passport: ${booking.passportNumber}<br>
        Nationality: ${booking.nationality}<br>
        Contact: ${booking.contactNumber}<br>
        From: ${booking.departureCity} → To: ${booking.destinationCity}<br>
        Departure: ${booking.departureDate} | Return: ${
        booking.returnDate || "-"
      }<br>
        Passengers: ${booking.passengers}<br>
        Requests: ${booking.specialRequests || "-"}<br>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Failed to load bookings", err);
    document.getElementById("bookingsContainer").innerHTML =
      "<p class='text-danger'>Failed to load bookings. Make sure the server is running.</p>";
  }
}

// ============ DESTINATIONS ============
async function loadDestinationsList() {
  const res = await fetch(`${BASE_URL}/destinations`);
  const destinations = await res.json();
  const list = document.getElementById("destList");
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
            ? `<img src="${dest.image}" width="100" class="rounded mt-1"/>`
            : ""
        }
        
      </div>
      <div class>
        <button class="btn btn-xl btn-warning me-2" onclick="editDestination(${
          dest.id
        })">Edit</button>
        <button class="btn btn-xl btn-danger" onclick="deleteDestination(${
          dest.id
        })">Delete</button>
      </div>
    `;
    list.appendChild(li);
  });
}

// Add new destination
document
  .getElementById("destinationForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("destTitle").value;
    const price = document.getElementById("destPrice").value;
    const image = document.getElementById("destImage").value;

    await fetch(`${BASE_URL}/destinations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, price, image }),
    });

    e.target.reset();
    await loadDestinationsList();
    alert("✅ Destination added successfully!");
  });

// Edit destination
window.editDestination = async function (id) {
  const newTitle = prompt("Enter new destination title:");
  const newPrice = prompt("Enter new price:");
  if (!newTitle || !newPrice) return;

  await fetch(`${BASE_URL}/destinations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: newTitle, price: newPrice }),
  });

  await loadDestinationsList();
  alert("✅ Destination updated!");
};

// Delete destination
window.deleteDestination = async function (id) {
  if (!confirm("Are you sure you want to delete this destination?")) return;
  await fetch(`${BASE_URL}/destinations/${id}`, { method: "DELETE" });
  await loadDestinationsList();
  alert("🗑️ Destination deleted!");
};

// ============ REVIEWS ============
async function loadReviewsList() {
  const res = await fetch(`${BASE_URL}/reviews`);
  const reviews = await res.json();
  const list = document.getElementById("revList");
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
        <p class="mb-0">${review.text}</p>
        ${
          review.image
            ? `<img src="${review.image}" width="100" class="rounded mt-1"/>`
            : ""
        }
      </div>
      <div class="ms-3">
        <button class="btn btn-xl btn-warning me-2" onclick="editReview(${
          review.id
        })">Edit</button>
        <button class="btn btn-xl btn-danger" onclick="deleteReview(${
          review.id
        })">Delete</button>
      </div>
    `;
    list.appendChild(li);
  });
}

// Add review
document.getElementById("reviewForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("revName").value;
  const image = document.getElementById("revImage").value;
  const text = document.getElementById("revText").value;

  await fetch(`${BASE_URL}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, image, text }),
  });

  e.target.reset();
  await loadReviewsList();
  alert("✅ Review added successfully!");
});

// Edit review
window.editReview = async function (id) {
  const name = prompt("Enter new reviewer name:");
  const text = prompt("Enter new review text:");
  if (!name || !text) return;

  await fetch(`${BASE_URL}/reviews/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, text }),
  });

  await loadReviewsList();
  alert("✅ Review updated!");
};

// Delete review
window.deleteReview = async function (id) {
  if (!confirm("Are you sure you want to delete this review?")) return;
  await fetch(`${BASE_URL}/reviews/${id}`, { method: "DELETE" });
  await loadReviewsList();
  alert("🗑️ Review deleted!");
};

// ============ INIT + TABS ============
document.addEventListener("DOMContentLoaded", () => {
  loadBookings();
  loadDestinationsList();
  loadReviewsList();

  const tabs = document.querySelectorAll("#dashboardTabs .nav-link");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      if (tab.textContent.trim() === "Disabled") return;

      tabs.forEach((t) => t.classList.remove("active"));
      contents.forEach((c) => (c.style.display = "none"));

      tab.classList.add("active");
      const targetId = tab.getAttribute("data-target");
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.style.display = "block";
    });
  });
});
