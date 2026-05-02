// booking.js - Multi-transport booking modal with email notification
const BASE_URL = "/api";

export function loadBookingModal() {
  let modal = document.getElementById("bookingModalOverlay");
  if (modal) {
    modal.style.display = "flex";
    return;
  }

  modal = document.createElement("div");
  modal.id = "bookingModalOverlay";
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.75);
    z-index:10000;display:flex;align-items:center;
    justify-content:center;padding:16px;
    animation:fadeInOverlay 0.3s ease;
  `;

  modal.innerHTML = `
    <style>
      @keyframes fadeInOverlay { from{opacity:0} to{opacity:1} }
      @keyframes slideUpModal { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }

      #bookingBox {
        background: #fff;
        border-radius: 16px;
        width: 100%;
        max-width: 560px;
        max-height: 90vh;
        overflow-y: auto;
        animation: slideUpModal 0.35s ease;
        font-family: 'El Messiri', sans-serif;
      }

      #bookingBox::-webkit-scrollbar { width: 4px; }
      #bookingBox::-webkit-scrollbar-track { background: #f1f1f1; }
      #bookingBox::-webkit-scrollbar-thumb { background: #396960; border-radius: 4px; }

      .bk-header {
        background: linear-gradient(135deg, #396960, #173648);
        padding: 20px 24px 16px;
        border-radius: 16px 16px 0 0;
        color: #d6b24c;
      }

      .bk-header h3 { margin:0; font-size:1.4rem; font-weight:700; }
      .bk-header p { margin:4px 0 0; font-size:0.85rem; color:rgba(214,178,76,0.75); }

      .bk-tabs {
        display: flex;
        background: #f8f9fa;
        border-bottom: 2px solid #e9ecef;
      }

      .bk-tab {
        flex:1; padding:12px 8px;
        border:none; background:transparent;
        cursor:pointer; font-size:0.9rem; font-weight:600;
        color:#666; transition:all 0.2s;
        font-family:'El Messiri',sans-serif;
        display:flex;align-items:center;justify-content:center;gap:6px;
      }

      .bk-tab.active {
        color:#173648; border-bottom:3px solid #396960;
        background:#fff; margin-bottom:-2px;
      }

      .bk-tab:hover:not(.active) { background:#e9ecef; }

      .bk-body { padding: 20px 24px 24px; }

      .bk-group { margin-bottom: 14px; }

      .bk-label {
        display:block; font-size:0.82rem; font-weight:600;
        color:#173648; margin-bottom:5px;
      }

      .bk-input, .bk-select, .bk-textarea {
        width:100%; padding:10px 12px;
        border:1.5px solid #dde;
        border-radius:8px; font-size:0.9rem;
        font-family:'El Messiri',sans-serif;
        color:#333; outline:none; transition:border 0.2s;
        background:#fafafa;
      }

      .bk-input:focus, .bk-select:focus, .bk-textarea:focus {
        border-color:#396960; background:#fff;
        box-shadow:0 0 0 3px rgba(57,105,96,0.1);
      }

      .bk-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

      .bk-submit {
        width:100%; padding:13px;
        background: linear-gradient(135deg, #396960, #173648);
        color:#d6b24c; border:none; border-radius:10px;
        font-size:1rem; font-weight:700; cursor:pointer;
        font-family:'El Messiri',sans-serif;
        transition:transform 0.2s,box-shadow 0.2s;
        margin-top:8px;
      }

      .bk-submit:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(23,54,72,0.3); }
      .bk-submit:active { transform:translateY(0); }
      .bk-submit:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

      .bk-close {
        background:none;border:none;color:#d6b24c;
        font-size:1.5rem;cursor:pointer;float:right;
        line-height:1;padding:0;margin-top:-4px;
      }

      .bk-section-title {
        font-size:0.78rem;font-weight:700;
        color:#396960;text-transform:uppercase;
        letter-spacing:0.08em;margin:16px 0 10px;
        padding-bottom:4px;border-bottom:1px solid #e9ecef;
      }

      .bk-success {
        text-align:center;padding:30px 20px;
      }
      .bk-success .bk-icon { font-size:3rem; margin-bottom:10px; }
      .bk-success h4 { color:#173648; margin-bottom:6px; }
      .bk-success p { color:#666; font-size:0.9rem; }

      .transport-section { display:none; }
      .transport-section.active { display:block; }

      @media(max-width:480px) {
        .bk-row { grid-template-columns:1fr; }
        #bookingBox { border-radius:12px; }
        .bk-body { padding:16px; }
      }
    </style>

    <div id="bookingBox">
      <div class="bk-header">
        <button class="bk-close" onclick="closeBookingModal()">×</button>
        <h3>✈️ Book Your Journey</h3>
        <p>Fill in your details — we'll get back to you shortly</p>
      </div>

      <!-- Transport Type Tabs -->
      <div class="bk-tabs">
        <button class="bk-tab active" data-type="flight" onclick="switchTransport('flight',this)">
          ✈️ Flight
        </button>
        <button class="bk-tab" data-type="bus" onclick="switchTransport('bus',this)">
          🚌 Bus
        </button>
        <button class="bk-tab" data-type="train" onclick="switchTransport('train',this)">
          🚆 Train
        </button>
      </div>

      <div class="bk-body">
        <div id="bookingFormWrap">

          <!-- PERSONAL DETAILS -->
          <div class="bk-section-title">Personal Details</div>

          <div class="bk-row">
            <div class="bk-group">
              <label class="bk-label">Full Name *</label>
              <input id="bkFullName" class="bk-input" type="text" placeholder="Mohammed Al-Rashid" required />
            </div>
            <div class="bk-group">
              <label class="bk-label">Contact Number *</label>
              <input id="bkContact" class="bk-input" type="tel" placeholder="+91 98765 43210" required />
            </div>
          </div>

          <div class="bk-group">
            <label class="bk-label">Email Address *</label>
            <input id="bkEmail" class="bk-input" type="email" placeholder="your@email.com" required />
          </div>

          <!-- FLIGHT SECTION -->
          <div class="transport-section active" id="section-flight">
            <div class="bk-section-title">✈️ Flight Details</div>
            <div class="bk-group">
              <label class="bk-label">Passport Number</label>
              <input id="bkPassport" class="bk-input" type="text" placeholder="A1234567" />
            </div>
            <div class="bk-row">
              <div class="bk-group">
                <label class="bk-label">From City *</label>
                <input id="bkFlightFrom" class="bk-input" type="text" placeholder="Mumbai" required />
              </div>
              <div class="bk-group">
                <label class="bk-label">To City *</label>
                <input id="bkFlightTo" class="bk-input" type="text" placeholder="Jeddah" required />
              </div>
            </div>
            <div class="bk-row">
              <div class="bk-group">
                <label class="bk-label">Departure Date *</label>
                <input id="bkFlightDep" class="bk-input" type="date" required />
              </div>
              <div class="bk-group">
                <label class="bk-label">Return Date</label>
                <input id="bkFlightRet" class="bk-input" type="date" />
              </div>
            </div>
            <div class="bk-row">
              <div class="bk-group">
                <label class="bk-label">Passengers *</label>
                <input id="bkFlightPax" class="bk-input" type="number" min="1" max="20" value="1" />
              </div>
              <div class="bk-group">
                <label class="bk-label">Seat Preference</label>
                <select id="bkFlightSeat" class="bk-select">
                  <option value="">Any</option>
                  <option value="Window">Window</option>
                  <option value="Aisle">Aisle</option>
                  <option value="Middle">Middle</option>
                </select>
              </div>
            </div>
            <div class="bk-group">
              <label class="bk-label">Class</label>
              <select id="bkFlightClass" class="bk-select">
                <option value="Economy">Economy</option>
                <option value="Business">Business</option>
                <option value="First Class">First Class</option>
              </select>
            </div>
          </div>

          <!-- BUS SECTION -->
          <div class="transport-section" id="section-bus">
            <div class="bk-section-title">🚌 Bus Details</div>
            <div class="bk-row">
              <div class="bk-group">
                <label class="bk-label">From City *</label>
                <input id="bkBusFrom" class="bk-input" type="text" placeholder="Ranchi" />
              </div>
              <div class="bk-group">
                <label class="bk-label">To City *</label>
                <input id="bkBusTo" class="bk-input" type="text" placeholder="Delhi" />
              </div>
            </div>
            <div class="bk-row">
              <div class="bk-group">
                <label class="bk-label">Travel Date *</label>
                <input id="bkBusDate" class="bk-input" type="date" />
              </div>
              <div class="bk-group">
                <label class="bk-label">Number of Seats *</label>
                <input id="bkBusPax" class="bk-input" type="number" min="1" max="40" value="1" />
              </div>
            </div>
            <div class="bk-row">
              <div class="bk-group">
                <label class="bk-label">Bus Type</label>
                <select id="bkBusType" class="bk-select">
                  <option value="AC Sleeper">AC Sleeper</option>
                  <option value="Non-AC Sleeper">Non-AC Sleeper</option>
                  <option value="AC Seater">AC Seater</option>
                  <option value="Non-AC Seater">Non-AC Seater</option>
                  <option value="Volvo">Volvo</option>
                </select>
              </div>
              <div class="bk-group">
                <label class="bk-label">Preferred Operator</label>
                <input id="bkBusOperator" class="bk-input" type="text" placeholder="Any / KSRTC / RedBus..." />
              </div>
            </div>
            <div class="bk-group">
              <label class="bk-label">Pick-up Point</label>
              <input id="bkBusPickup" class="bk-input" type="text" placeholder="Bus stand / Colony name" />
            </div>
          </div>

          <!-- TRAIN SECTION -->
          <div class="transport-section" id="section-train">
            <div class="bk-section-title">🚆 Train Details</div>
            <div class="bk-row">
              <div class="bk-group">
                <label class="bk-label">From Station *</label>
                <input id="bkTrainFrom" class="bk-input" type="text" placeholder="Ranchi Jn" />
              </div>
              <div class="bk-group">
                <label class="bk-label">To Station *</label>
                <input id="bkTrainTo" class="bk-input" type="text" placeholder="New Delhi" />
              </div>
            </div>
            <div class="bk-row">
              <div class="bk-group">
                <label class="bk-label">Travel Date *</label>
                <input id="bkTrainDate" class="bk-input" type="date" />
              </div>
              <div class="bk-group">
                <label class="bk-label">Passengers *</label>
                <input id="bkTrainPax" class="bk-input" type="number" min="1" max="6" value="1" />
              </div>
            </div>
            <div class="bk-row">
              <div class="bk-group">
                <label class="bk-label">Class</label>
                <select id="bkTrainClass" class="bk-select">
                  <option value="Sleeper">Sleeper (SL)</option>
                  <option value="3AC">3 AC (3A)</option>
                  <option value="2AC">2 AC (2A)</option>
                  <option value="1AC">1 AC (1A)</option>
                  <option value="General">General (GN)</option>
                </select>
              </div>
              <div class="bk-group">
                <label class="bk-label">Quota</label>
                <select id="bkTrainQuota" class="bk-select">
                  <option value="General">General</option>
                  <option value="Ladies">Ladies</option>
                  <option value="Senior Citizen">Senior Citizen</option>
                  <option value="Tatkal">Tatkal</option>
                </select>
              </div>
            </div>
            <div class="bk-group">
              <label class="bk-label">Train Name / Number (if known)</label>
              <input id="bkTrainName" class="bk-input" type="text" placeholder="Rajdhani Express / 12309" />
            </div>
          </div>

          <!-- SPECIAL REQUESTS -->
          <div class="bk-section-title">Additional Notes</div>
          <div class="bk-group">
            <label class="bk-label">Special Requests / Notes</label>
            <textarea id="bkSpecial" class="bk-textarea" rows="3" placeholder="Wheelchair assistance, dietary needs, group info..."></textarea>
          </div>

          <p id="bkError" style="color:red;font-size:0.85rem;display:none;margin-top:6px;"></p>

          <button class="bk-submit" id="bkSubmitBtn" onclick="submitBooking()">
            Submit Booking Request
          </button>

        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close on overlay click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeBookingModal();
  });
}

let currentTransport = "flight";

window.switchTransport = function (type, btn) {
  currentTransport = type;

  // Update tab active states
  document
    .querySelectorAll(".bk-tab")
    .forEach((t) => t.classList.remove("active"));
  btn.classList.add("active");

  // Show/hide sections
  document
    .querySelectorAll(".transport-section")
    .forEach((s) => s.classList.remove("active"));
  const section = document.getElementById(`section-${type}`);
  if (section) section.classList.add("active");
};

window.submitBooking = async function () {
  const btn = document.getElementById("bkSubmitBtn");
  const errEl = document.getElementById("bkError");
  errEl.style.display = "none";

  const fullName = document.getElementById("bkFullName").value.trim();
  const contactNumber = document.getElementById("bkContact").value.trim();
  const email = document.getElementById("bkEmail").value.trim();

  if (!fullName || !contactNumber || !email) {
    errEl.textContent = "Please fill in your name, contact, and email.";
    errEl.style.display = "block";
    return;
  }

  let bookingData = {
    fullName,
    contactNumber,
    email,
    travelType: currentTransport,
    createdAt: new Date().toISOString(),
  };

  // Collect transport-specific data
  if (currentTransport === "flight") {
    const departureCity = document.getElementById("bkFlightFrom").value.trim();
    const destinationCity = document.getElementById("bkFlightTo").value.trim();
    const departureDate = document.getElementById("bkFlightDep").value;
    if (!departureCity || !destinationCity || !departureDate) {
      errEl.textContent =
        "Please fill in flight departure city, destination, and date.";
      errEl.style.display = "block";
      return;
    }
    bookingData = {
      ...bookingData,
      passportNumber: document.getElementById("bkPassport").value.trim(),
      departureCity,
      destinationCity,
      departureDate,
      returnDate: document.getElementById("bkFlightRet").value,
      passengers: document.getElementById("bkFlightPax").value,
      seatPreference: document.getElementById("bkFlightSeat").value,
      flightClass: document.getElementById("bkFlightClass").value,
    };
  } else if (currentTransport === "bus") {
    const departureCity = document.getElementById("bkBusFrom").value.trim();
    const destinationCity = document.getElementById("bkBusTo").value.trim();
    const departureDate = document.getElementById("bkBusDate").value;
    if (!departureCity || !destinationCity || !departureDate) {
      errEl.textContent =
        "Please fill in bus from city, destination, and date.";
      errEl.style.display = "block";
      return;
    }
    bookingData = {
      ...bookingData,
      departureCity,
      destinationCity,
      departureDate,
      passengers: document.getElementById("bkBusPax").value,
      busType: document.getElementById("bkBusType").value,
      busOperator: document.getElementById("bkBusOperator").value.trim(),
      pickupPoint: document.getElementById("bkBusPickup").value.trim(),
    };
  } else if (currentTransport === "train") {
    const departureCity = document.getElementById("bkTrainFrom").value.trim();
    const destinationCity = document.getElementById("bkTrainTo").value.trim();
    const departureDate = document.getElementById("bkTrainDate").value;
    if (!departureCity || !destinationCity || !departureDate) {
      errEl.textContent =
        "Please fill in train from station, destination, and date.";
      errEl.style.display = "block";
      return;
    }
    bookingData = {
      ...bookingData,
      departureCity,
      destinationCity,
      departureDate,
      passengers: document.getElementById("bkTrainPax").value,
      trainClass: document.getElementById("bkTrainClass").value,
      trainQuota: document.getElementById("bkTrainQuota").value,
      trainName: document.getElementById("bkTrainName").value.trim(),
    };
  }

  bookingData.specialRequests = document
    .getElementById("bkSpecial")
    .value.trim();

  btn.disabled = true;
  btn.textContent = "Submitting...";

  try {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    });

    if (!res.ok) throw new Error("Server error");

    // Show success message
    const formWrap = document.getElementById("bookingFormWrap");
    const icon =
      currentTransport === "flight"
        ? "✈️"
        : currentTransport === "bus"
          ? "🚌"
          : "🚆";
    formWrap.innerHTML = `
      <div class="bk-success">
        <div class="bk-icon">${icon}</div>
        <h4>Booking Request Received!</h4>
        <p>Thank you, <strong>${fullName}</strong>. We've received your ${currentTransport} booking request and will contact you at <strong>${email}</strong> shortly.</p>
        <button class="bk-submit" style="margin-top:16px;" onclick="closeBookingModal()">Close</button>
      </div>
    `;
  } catch (err) {
    btn.disabled = false;
    btn.textContent = "Submit Booking Request";
    errEl.textContent = "❌ Submission failed. Please try again.";
    errEl.style.display = "block";
  }
};

export function closeBookingModal() {
  const modal = document.getElementById("bookingModalOverlay");
  if (modal) {
    modal.style.opacity = "0";
    modal.style.transition = "opacity 0.25s";
    setTimeout(() => modal.remove(), 250);
  }
}
