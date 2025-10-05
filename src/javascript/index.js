async function loadDestinations() {
  try {
    const res = await fetch("http://localhost:3000/api/destinations");
    const bookings = await res.json();

    const container = document.getElementById("destinationsContainer");
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
