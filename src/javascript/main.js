// main.js
import { closeBookingModal, loadBookingModal } from "./booking.js";

// Make functions globally available
window.loadBookingModal = loadBookingModal;
window.closeBookingModal = closeBookingModal;

// Use relative URL for API calls (works both locally and on Render)
const BASE_URL = "/api";

// ============ DESTINATIONS ============
async function renderDestinations() {
  try {
    const res = await fetch(`${BASE_URL}/destinations`);
    const destinations = await res.json();

    const container = document.getElementById("destinationsContainer");
    container.innerHTML = "";

    if (destinations.length === 0) {
      container.innerHTML =
        "<p class='text-center text-muted'>No destinations available.</p>";
      return;
    }

    destinations.forEach((dest) => {
      const card = document.createElement("div");
      card.className = "destination-card mb-4 text-center";
      card.innerHTML = `
        <img src="${dest.image}" class="card-img-top" alt="${dest.title}" style="height:200px; object-fit:cover;">
        <div class="card-body">
          <h5 class="card-title">${dest.title}</h5>
          <p class="card-text">Price: ${dest.price}</p>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load destinations:", err);
  }
}

// ============ REVIEWS ============
async function renderReviews() {
  try {
    const res = await fetch(`${BASE_URL}/reviews`);
    const reviews = await res.json();

    const carousel = document.getElementById("reviewsCarousel");

    // Keep the <h2>, remove only previous carousel items
    const h2 = carousel.querySelector("h2");
    carousel.innerHTML = "";
    if (h2) carousel.appendChild(h2);

    if (reviews.length === 0) {
      const p = document.createElement("p");
      p.className = "text-center text-muted";
      p.textContent = "No reviews yet.";
      carousel.appendChild(p);
      return;
    }

    reviews.forEach((review, index) => {
      const item = document.createElement("div");
      item.className = `carousel-item${index === 0 ? " active" : ""}`;
      item.innerHTML = `
        <div class="d-flex flex-column align-items-center text-center">
          ${
            review.image
              ? `<img src="${review.image}" class="object-fit-cover rounded-circle mb-3 " width="150" height="150" alt="${review.name}"/>`
              : ""
          }
          <h5>${review.name}</h5>
          <p class="mb-0">${review.text}</p>
        </div>
      `;
      carousel.appendChild(item);
    });
  } catch (err) {
    console.error("Failed to load reviews:", err);
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  renderDestinations();
  renderReviews();

  // Optional: Refresh every 30s to reflect live updates
  setInterval(() => {
    renderDestinations();
    renderReviews();
  }, 30000);
});
