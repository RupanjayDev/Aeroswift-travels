// main.js
import { closeBookingModal, loadBookingModal } from "./booking.js";

// Make functions globally available
window.loadBookingModal = loadBookingModal;
window.closeBookingModal = closeBookingModal;

// Use relative URL for API calls
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

      const isVideo = dest.image.match(/\.(mp4|webm|ogg)$/i);

      let mediaElement = "";

      if (isVideo) {
        mediaElement = `
          <video 
            class="card-img-top" 
            style="height:200px; object-fit:cover;" 
            autoplay 
            muted 
            loop 
            playsinline
          >
            <source src="${dest.image}" type="video/mp4">
          </video>
        `;
      } else {
        mediaElement = `
          <img 
            src="${dest.image}" 
            class="card-img-top" 
            alt="${dest.title}" 
            style="height:200px; object-fit:cover;"
          >
        `;
      }

      card.innerHTML = `
        ${mediaElement}
        <div class="card-body">
          <h5 class="card-title">${dest.title}</h5>
          <p class="card-text">Price: ${dest.price}</p>
        </div>
      `;

      // ✅ OPEN MODAL ON CLICK
      card.addEventListener("click", () => openModal(dest));

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load destinations:", err);
  }
}

// ✅ MODAL FUNCTION
function openModal(dest) {
  const modal = document.getElementById("destinationModal");

  const isVideo = dest.image.match(/\.(mp4|webm|ogg)$/i);
  const mediaContainer = document.getElementById("modalMedia");

  mediaContainer.innerHTML = isVideo
    ? `
      <video controls autoplay muted style="width:100%; border-radius:10px;">
        <source src="${dest.image}">
      </video>
    `
    : `
      <img src="${dest.image}" style="width:100%; border-radius:10px;" />
    `;

  document.getElementById("modalTitle").innerText = dest.title;
  document.getElementById("modalPrice").innerText = "Price: " + dest.price;
  document.getElementById("modalDescription").innerText =
    dest.description || "No description available.";

  // Features
  const featuresList = document.getElementById("modalFeatures");
  featuresList.innerHTML = "";

  (dest.features || []).forEach((f) => {
    const li = document.createElement("li");
    li.innerText = f;
    featuresList.appendChild(li);
  });

  // Gallery
  const gallery = document.getElementById("modalGallery");
  gallery.innerHTML = "";

  (dest.gallery || []).forEach((item) => {
    const isVid = item.match(/\.(mp4|webm|ogg)$/i);

    const el = isVid
      ? document.createElement("video")
      : document.createElement("img");

    el.src = item;

    if (isVid) {
      el.autoplay = true;
      el.muted = true;
      el.loop = true;
    }

    gallery.appendChild(el);
  });

  modal.style.display = "block";
}

// ✅ CLOSE MODAL
document.addEventListener("click", (e) => {
  const modal = document.getElementById("destinationModal");

  if (e.target.classList.contains("close-btn")) {
    modal.style.display = "none";
  }

  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// ============ REVIEWS ============
async function renderReviews() {
  try {
    const res = await fetch(`${BASE_URL}/reviews`);
    const reviews = await res.json();

    const carousel = document.getElementById("reviewsCarousel");

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
        <div class="d-flex flex-column align-items-center text-center" >
          ${
            review.image
              ? `<img src="${review.image}" class="object-fit-cover rounded-circle mb-3 " width="150" height="150" alt="${review.name}"/>`
              : ""
          }
          <h5 style="color: white">${review.name}</h5>
          <p style="color: white" class="mb-0">${review.text}</p>
        </div>
      `;
      carousel.appendChild(item);
    });
  } catch (err) {
    console.error("Failed to load reviews:", err);
  }
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  renderDestinations();
  renderReviews();

  setInterval(() => {
    renderDestinations();
    renderReviews();
  }, 30000);
});
