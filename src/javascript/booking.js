// booking.js

// Use relative URL that works both locally and on Render
const BASE_URL = "/api";

export function loadBookingModal() {
  const modalContainer = document.getElementById("modalContainer");

  modalContainer.innerHTML = `
    <div class="modal fade show" tabindex="-1" 
         style="display:block; background-color: rgba(0,0,0,0.5);" 
         id="bookingModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">

          <!-- Modal Header -->
          <div class="modal-header" style="background: linear-gradient(135deg, #396960, #173648); color: white;">
            <h5 class="modal-title" id="formModalLabel">
              <i class="fas fa-plane"></i> Hajj & Umrah Flight Booking
            </h5>
            <button type="button" class="btn-close btn-close-white" 
                    data-bs-dismiss="modal" aria-label="Close" 
                    onclick="closeBookingModal()"></button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body" style="background: #f8f9fa;">
            <form id="bookingForm">
              <div class="row">

                <!-- Personal Details -->
                <div class="col-md-6">
                  <h6 class="text-primary mb-3">
                    <i class="fas fa-user"></i> Personal Details
                  </h6>

                  
                  <div class="mb-3">
                    <label for="fullName" class="form-label">Full Name *</label>
                    <input type="text" class="form-control" id="fullName" required />
                  </div>

                  <div class="mb-3">
                    <label for="passportNumber" class="form-label">Passport Number *</label>
                    <input type="text" class="form-control" id="passportNumber" required />
                  </div>

                  <div class="mb-3">
                    <label for="nationality" class="form-label">Nationality *</label>
                    <input type="text" class="form-control" id="nationality" required />
                  </div>

                  <div class="mb-3">
                    <label for="contactNumber" class="form-label">Contact Number *</label>
                    <input type="tel" class="form-control" id="contactNumber" required />
                  </div>
                </div>

                <!-- Travel Details -->
                <div class="col-md-6">
                  <h6 class="text-primary mb-3">
                    <i class="fas fa-plane-departure"></i> Travel Details
                  </h6>

                  <div class="mb-3">
                    <label for="departureCity" class="form-label">Departure City *</label>
                    <input type="text" class="form-control" id="departureCity" 
                           placeholder="e.g. New Delhi" required />
                  </div>

                  <div class="mb-3">
                    <label for="destinationCity" class="form-label">Destination City *</label>
                    <select class="form-control" id="destinationCity" required>
                      <option value="Jeddah">Jeddah (Hajj/Umrah)</option>
                      <option value="Medina">Medina</option>
                    </select>
                  </div>

                  <div class="mb-3">
                    <label for="departureDate" class="form-label">Departure Date *</label>
                    <input type="date" class="form-control" id="departureDate" required />
                  </div>

                  <div class="mb-3">
                    <label for="returnDate" class="form-label">Return Date</label>
                    <input type="date" class="form-control" id="returnDate" />
                  </div>

                  <div class="mb-3">
                    <label for="numberOfPassengers" class="form-label">Number of Passengers *</label>
                    <input type="number" class="form-control" id="numberOfPassengers" 
                           min="1" max="10" value="1" required />
                  </div>
                </div>
              </div>

              <!-- Additional Info -->
              <div class="row">
                <div class="col-12">
                  <h6 class="text-primary mb-3">
                    <i class="fas fa-info-circle"></i> Additional Information
                  </h6>
                  <div class="mb-3">
                    <label for="specialRequests" class="form-label">Special Requests</label>
                    <textarea class="form-control" id="specialRequests" rows="3" 
                              placeholder="e.g. wheelchair assistance, meal preferences, etc."></textarea>
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" 
                        data-bs-dismiss="modal" onclick="closeBookingModal()">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary" 
                        style="background-color: #1ab27b; border: none;">
                  <i class="fas fa-paper-plane"></i> Submit Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  // ✅ Attach event listener to bookingForm after modal is created
  document
    .getElementById("bookingForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const bookingData = {
        fullName: document.getElementById("fullName").value,
        passportNumber: document.getElementById("passportNumber").value,
        nationality: document.getElementById("nationality").value,
        contactNumber: document.getElementById("contactNumber").value,
        departureCity: document.getElementById("departureCity").value,
        destinationCity: document.getElementById("destinationCity").value,
        departureDate: document.getElementById("departureDate").value,
        returnDate: document.getElementById("returnDate").value,
        passengers: document.getElementById("numberOfPassengers").value,
        specialRequests: document.getElementById("specialRequests").value,
      };

      try {
        // Use relative URL instead of hardcoded localhost
        const res = await fetch(`${BASE_URL}/bookings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(bookingData),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${res.status}`
          );
        }

        const data = await res.json();
        alert("✅ " + data.message);
        closeBookingModal();

        // Optional: reload to show updated data
        // window.location.reload();
      } catch (error) {
        console.error("Booking error:", error);
        alert("❌ Error submitting booking: " + error.message);
      }
    });
}

// ✅ Close modal
export function closeBookingModal() {
  const modal = document.getElementById("bookingModal");
  if (modal) modal.remove();
}
