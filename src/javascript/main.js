import { closeBookingModal, loadBookingModal } from "./booking.js";

window.loadBookingModal = loadBookingModal;
window.closeBookingModal = closeBookingModal;

const BASE_URL = "/api";

// ✅ HERO VIDEO
async function loadHeroVideo() {
  try {
    const res = await fetch(`${BASE_URL}/settings`);
    const data = await res.json();

    if (data.heroVideo) {
      const video = document.getElementById("heroVideo");
      const source = document.getElementById("heroVideoSource");

      source.src = data.heroVideo;
      video.load();
    }
  } catch (err) {
    console.error("Hero video load error", err);
  }
}

// ============ DESTINATIONS ============
async function renderDestinations() {
  try {
    const res = await fetch(`${BASE_URL}/destinations`);
    const destinations = await res.json();

    const container = document.getElementById("destinationsContainer");
    container.innerHTML = "";

    destinations.forEach((dest) => {
      const card = document.createElement("div");
      card.className = "destination-card mb-4 text-center";

      const isVideo = dest.image && dest.image.includes("mp4");

      let media = isVideo
        ? `<video class="card-img-top" autoplay muted loop>
            <source src="${dest.image}">
          </video>`
        : `<img src="${dest.image}" class="card-img-top"/>`;

      card.innerHTML = `
        ${media}
        <div class="card-body">
          <h5>${dest.title}</h5>
          <p>${dest.price}</p>
        </div>
      `;

      card.onclick = () => openModal(dest);
      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

// ✅ MODAL
function openModal(dest) {
  const modal = document.getElementById("destinationModal");

  const isVideo = dest.image && dest.image.includes("mp4");

  document.getElementById("modalMedia").innerHTML = isVideo
    ? `<video controls autoplay muted style="width:100%">
         <source src="${dest.image}">
       </video>`
    : `<img src="${dest.image}" style="width:100%">`;

  document.getElementById("modalTitle").innerText = dest.title;
  document.getElementById("modalPrice").innerText = dest.price;
  document.getElementById("modalDescription").innerText =
    dest.description || "";

  const features = document.getElementById("modalFeatures");
  features.innerHTML = "";
  (dest.features || []).forEach((f) => {
    const li = document.createElement("li");
    li.innerText = f;
    features.appendChild(li);
  });

  const gallery = document.getElementById("modalGallery");
  gallery.innerHTML = "";

  (dest.gallery || []).forEach((item) => {
    const isVid = item.includes("mp4");
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

// CLOSE MODAL
document.addEventListener("click", (e) => {
  const modal = document.getElementById("destinationModal");
  if (e.target.classList.contains("close-btn") || e.target === modal) {
    modal.style.display = "none";
  }
});

// ============ REVIEWS ============
async function renderReviews() {
  const res = await fetch(`${BASE_URL}/reviews`);
  const reviews = await res.json();

  const carousel = document.getElementById("reviewsCarousel");
  const h2 = carousel.querySelector("h2");
  carousel.innerHTML = "";
  if (h2) carousel.appendChild(h2);

  reviews.forEach((r, i) => {
    const item = document.createElement("div");
    item.className = `carousel-item ${i === 0 ? "active" : ""}`;
    item.innerHTML = `
      <div class="text-center">
        ${r.image ? `<img src="${r.image}" width="120" class="rounded-circle mb-3"/>` : ""}
        <h5 style="color:white">${r.name}</h5>
        <p style="color:white">${r.text}</p>
      </div>
    `;
    carousel.appendChild(item);
  });
}

// INIT
document.addEventListener("DOMContentLoaded", () => {
  loadHeroVideo();
  renderDestinations();
  renderReviews();
});
