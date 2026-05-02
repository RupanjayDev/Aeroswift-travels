// dashboard.js - Complete with Authentication + Enhanced Destination Editing
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

      const travelTypeIcon =
        booking.travelType === "flight"
          ? "✈️"
          : booking.travelType === "bus"
            ? "🚌"
            : booking.travelType === "train"
              ? "🚆"
              : "🚗";

      div.innerHTML = `
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-header d-flex justify-content-between align-items-center" style="background: linear-gradient(135deg, #396960, #173648);">
            <span class="text-warning fw-bold">${travelTypeIcon} ${(booking.travelType || "flight").toUpperCase()}</span>
            <small class="text-light">#${index + 1}</small>
          </div>
          <div class="card-body">
            <h6 class="card-title">${booking.fullName}</h6>
            <p class="card-text mb-1"><small><strong>Email:</strong> ${booking.email || "N/A"}</small></p>
            <p class="card-text mb-1"><small><strong>Passport:</strong> ${booking.passportNumber || "N/A"}</small></p>
            <p class="card-text mb-1"><small><strong>Contact:</strong> ${booking.contactNumber}</small></p>
            <p class="card-text mb-1"><small><strong>From:</strong> ${booking.departureCity} → ${booking.destinationCity}</small></p>
            <p class="card-text mb-1"><small><strong>Departure:</strong> ${booking.departureDate}</small></p>
            ${booking.returnDate ? `<p class="card-text mb-1"><small><strong>Return:</strong> ${booking.returnDate}</small></p>` : ""}
            <p class="card-text mb-1"><small><strong>Passengers:</strong> ${booking.passengers}</small></p>
            ${booking.seatPreference ? `<p class="card-text mb-1"><small><strong>Seat:</strong> ${booking.seatPreference}</small></p>` : ""}
            ${booking.busOperator ? `<p class="card-text mb-1"><small><strong>Operator:</strong> ${booking.busOperator}</small></p>` : ""}
            ${booking.trainClass ? `<p class="card-text mb-1"><small><strong>Class:</strong> ${booking.trainClass}</small></p>` : ""}
            ${booking.specialRequests ? `<p class="card-text mb-1"><small><strong>Notes:</strong> ${booking.specialRequests}</small></p>` : ""}
            <p class="card-text"><small class="text-muted">${new Date(booking.createdAt).toLocaleString()}</small></p>
          </div>
          <div class="card-footer bg-transparent">
            <button class="btn btn-sm btn-danger w-100" onclick="deleteBooking('${booking._id}')">🗑️ Delete</button>
          </div>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading bookings:", err);
  }
}

window.deleteBooking = async function (id) {
  if (!confirm("Delete this booking?")) return;
  try {
    await authFetch(`${BASE_URL}/bookings/${id}`, { method: "DELETE" });
    await loadBookings();
  } catch (err) {
    alert("❌ Failed to delete booking");
  }
};

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
      li.className = "list-group-item";
      li.style.cssText =
        "border-left: 4px solid #396960; margin-bottom: 8px; border-radius: 6px;";

      const galleryPreviews = (dest.gallery || [])
        .slice(0, 3)
        .map((url) => {
          const isVid = url && url.includes("mp4");
          return isVid
            ? `<video src="${url}" width="60" height="45" style="border-radius:4px;object-fit:cover;" muted></video>`
            : `<img src="${url}" width="60" height="45" style="border-radius:4px;object-fit:cover;" />`;
        })
        .join("");

      li.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
          <div class="flex-grow-1">
            <div class="d-flex align-items-center gap-2 mb-2">
              ${
                dest.image
                  ? dest.image.includes("mp4")
                    ? `<video src="${dest.image}" width="80" height="55" style="border-radius:6px;object-fit:cover;" muted></video>`
                    : `<img src="${dest.image}" width="80" height="55" style="border-radius:6px;object-fit:cover;"/>`
                  : '<div style="width:80px;height:55px;background:#eee;border-radius:6px;"></div>'
              }
              <div>
                <strong style="color:#173648;">${dest.title}</strong><br>
                <span class="text-success fw-bold">${dest.price}</span><br>
                <small class="text-muted">${(dest.description || "").substring(0, 60)}${dest.description && dest.description.length > 60 ? "..." : ""}</small>
              </div>
            </div>
            ${galleryPreviews ? `<div class="d-flex gap-1 mt-1">${galleryPreviews}</div>` : ""}
          </div>
          <div class="d-flex flex-column gap-1 ms-2">
            <button class="btn btn-sm btn-warning" onclick="openEditModal(${dest.id})">✏️ Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteDestination(${dest.id})">🗑️ Delete</button>
          </div>
        </div>
      `;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading destinations:", err);
  }
}

// ===== FULL EDIT MODAL =====
let currentEditId = null;
let currentGallery = [];

window.openEditModal = async function (id) {
  try {
    const res = await fetch(`${BASE_URL}/destinations`);
    const destinations = await res.json();
    const dest = destinations.find((d) => d.id === id);
    if (!dest) return alert("Destination not found");

    currentEditId = id;
    currentGallery = [...(dest.gallery || [])];

    document.getElementById("editDestId").value = id;
    document.getElementById("editDestTitle").value = dest.title || "";
    document.getElementById("editDestPrice").value = dest.price || "";
    document.getElementById("editDestImage").value = dest.image || "";
    document.getElementById("editDestDescription").value =
      dest.description || "";
    document.getElementById("editDestFeatures").value = (
      dest.features || []
    ).join(", ");

    renderGalleryEditor(currentGallery);
    renderMainImagePreview(dest.image);

    document.getElementById("destEditModal").style.display = "flex";
  } catch (err) {
    alert("❌ Failed to load destination");
  }
};

function renderMainImagePreview(url) {
  const preview = document.getElementById("editMainImagePreview");
  if (!url) {
    preview.innerHTML = "";
    return;
  }
  const isVid = url.includes("mp4");
  preview.innerHTML = isVid
    ? `<video src="${url}" autoplay muted loop style="width:100%;max-height:180px;border-radius:8px;object-fit:cover;"></video>`
    : `<img src="${url}" style="width:100%;max-height:180px;border-radius:8px;object-fit:cover;" />`;
}

function renderGalleryEditor(gallery) {
  const container = document.getElementById("editGalleryContainer");
  container.innerHTML = "";

  gallery.forEach((url, index) => {
    const isVid = url && url.includes("mp4");
    const item = document.createElement("div");
    item.style.cssText = "position:relative;display:inline-block;margin:4px;";
    item.innerHTML = `
      ${
        isVid
          ? `<video src="${url}" width="90" height="65" style="border-radius:6px;object-fit:cover;" muted></video>`
          : `<img src="${url}" width="90" height="65" style="border-radius:6px;object-fit:cover;" />`
      }
      <button onclick="removeGalleryItem(${index})" style="
        position:absolute;top:-6px;right:-6px;
        background:red;color:white;border:none;
        border-radius:50%;width:20px;height:20px;
        font-size:11px;cursor:pointer;line-height:1;
      ">×</button>
    `;
    container.appendChild(item);
  });
}

window.removeGalleryItem = function (index) {
  currentGallery.splice(index, 1);
  renderGalleryEditor(currentGallery);
};

window.addGalleryItem = function () {
  const input = document.getElementById("newGalleryUrl");
  const url = input.value.trim();
  if (!url) return alert("Please enter a URL");
  currentGallery.push(url);
  renderGalleryEditor(currentGallery);
  input.value = "";
};

window.previewMainImage = function () {
  const url = document.getElementById("editDestImage").value.trim();
  renderMainImagePreview(url);
};

window.closeEditModal = function () {
  document.getElementById("destEditModal").style.display = "none";
  currentEditId = null;
  currentGallery = [];
};

window.saveDestinationEdit = async function () {
  const id = currentEditId;
  const title = document.getElementById("editDestTitle").value.trim();
  const price = document.getElementById("editDestPrice").value.trim();
  const image = document.getElementById("editDestImage").value.trim();
  const description = document
    .getElementById("editDestDescription")
    .value.trim();
  const featuresRaw = document.getElementById("editDestFeatures").value.trim();
  const features = featuresRaw
    ? featuresRaw
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean)
    : [];

  if (!title || !price) return alert("Title and price are required");

  try {
    await authFetch(`${BASE_URL}/destinations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        price,
        image,
        description,
        features,
        gallery: currentGallery,
      }),
    });

    closeEditModal();
    await loadDestinationsList();
    showToast("✅ Destination updated!");
  } catch (err) {
    alert("❌ Failed to update destination");
  }
};

function showToast(msg) {
  const toast = document.createElement("div");
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed;bottom:20px;right:20px;
    background:#173648;color:#d6b24c;
    padding:12px 20px;border-radius:8px;
    font-weight:bold;z-index:9999;
    animation:fadeIn 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

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
      showToast("✅ Destination added!");
    } catch (err) {
      alert("❌ Failed to add destination");
    }
  });
}

window.deleteDestination = async function (id) {
  if (!confirm("Delete this destination?")) return;
  try {
    await authFetch(`${BASE_URL}/destinations/${id}`, { method: "DELETE" });
    await loadDestinationsList();
    showToast("🗑️ Deleted!");
  } catch (err) {
    alert("❌ Failed to delete");
  }
};

// HERO VIDEO
window.updateHeroVideo = async function () {
  const heroVideo = document.getElementById("heroVideoInput").value;
  await authFetch(`${BASE_URL}/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ heroVideo }),
  });
  showToast("✅ Hero video updated");
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
      ${review.image ? `<img src="${review.image}" width="180" class="rounded-circle mt-2"/>` : ""}
    </div>
    <div>
      <button class="btn btn-sm btn-warning me-2" onclick="editReview(${review.id})">Edit</button>
      <button class="btn btn-sm btn-danger" onclick="deleteReview(${review.id})">Delete</button>
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
      showToast("✅ Review added!");
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
    showToast("✅ Updated!");
  } catch (err) {
    alert("❌ Failed to update");
  }
};

window.deleteReview = async function (id) {
  if (!confirm("Delete this review?")) return;
  try {
    await authFetch(`${BASE_URL}/reviews/${id}`, { method: "DELETE" });
    await loadReviewsList();
    showToast("🗑️ Deleted!");
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
