const tbl = document.getElementById("tbl");
const currentUserEl = document.getElementById("currentUser");
const logoutBtn = document.getElementById("logoutBtn");

const tokenKey = "bookmyshow_token";
const usernameKey = "bookmyshow_username";

let seats = [];
let tooltipEl = null;

function ensureTooltip() {
  if (tooltipEl) {
    return tooltipEl;
  }

  tooltipEl = document.createElement("div");
  tooltipEl.className =
    "fixed z-9999 pointer-events-none invisible opacity-0 transition-opacity duration-150 px-4 py-2 bg-card border border-border text-sm text-muted-foreground whitespace-nowrap font-normal";
  tooltipEl.style.borderRadius = "calc(var(--radius) + 4px)";
  tooltipEl.style.boxShadow = "var(--shadow-2xl)";
  tooltipEl.innerHTML = `
    Booked by: <span class="font-bold text-foreground ml-1" data-tooltip-user>Unknown</span>
  `;
  document.body.appendChild(tooltipEl);
  return tooltipEl;
}

function hideTooltip() {
  if (!tooltipEl) {
    return;
  }

  tooltipEl.classList.add("invisible", "opacity-0");
  tooltipEl.classList.remove("opacity-100");
}

function showTooltip(anchor, bookedBy) {
  const tooltip = ensureTooltip();
  const userEl = tooltip.querySelector("[data-tooltip-user]");

  if (userEl) {
    userEl.textContent = bookedBy || "Unknown";
  }

  const rect = anchor.getBoundingClientRect();
  const top = Math.max(8, rect.top - 56);
  const left = rect.left + rect.width / 2;

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
  tooltip.style.transform = "translateX(-50%)";
  tooltip.classList.remove("invisible", "opacity-0");
  tooltip.classList.add("opacity-100");
}

async function readResponse(res) {
  const text = await res.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getToken() {
  return localStorage.getItem(tokenKey);
}

function getUsername() {
  return localStorage.getItem(usernameKey);
}

function syncAuthUi() {
  const username = getUsername();
  currentUserEl.textContent = username || "Guest";
  logoutBtn.classList.toggle("hidden", !username);
}

function renderSeats() {
  tbl.innerHTML = "";
  const sortedSeats = [...seats].sort((a, b) => a.id - b.id);
  let tr;

  for (let index = 0; index < sortedSeats.length; index++) {
    if (index % 8 === 0) {
      tr = document.createElement("tr");
      tbl.appendChild(tr);
    }

    const seat = sortedSeats[index];
    const td = document.createElement("td");
    const baseClasses =
      "w-28 h-28 md:w-32 md:h-32 text-center align-middle text-2xl font-bold transition-all duration-300 select-none relative";

    td.dataset.seatId = seat.id;
    td.dataset.seatName = seat.seat_name;

    if (seat.isbooked) {
      td.className = `${baseClasses} bg-secondary text-secondary-foreground border cursor-not-allowed opacity-60`;
      td.style.borderRadius = "calc(var(--radius) + 8px)";
      td.innerHTML = `<span class="relative z-10">${seat.seat_name}</span>`;
      td.addEventListener("mouseenter", () => showTooltip(td, seat.bookedby));
      td.addEventListener("mouseleave", hideTooltip);
    } else {
      td.className = `${baseClasses} bg-primary text-primary-foreground border border-primary cursor-pointer hover:-translate-y-1.5 hover:z-[20] active:scale-95`;
      td.style.borderRadius = "calc(var(--radius) + 8px)";
      td.style.boxShadow = "0 0 20px color-mix(in oklch, var(--primary), transparent 70%)";
      td.onmouseenter = function() {
        this.style.boxShadow = "0 10px 25px color-mix(in oklch, var(--primary), transparent 50%)";
      };
      td.onmouseleave = function() {
        this.style.boxShadow = "0 0 20px color-mix(in oklch, var(--primary), transparent 70%)";
      };
      td.innerHTML = `<span class="relative z-10">${seat.seat_name}</span>`;
    }

    td.addEventListener("click", () => bookSeat(seat.id));
    td.addEventListener("blur", hideTooltip);
    tr.appendChild(td);
  }
}

async function loadSeats() {
  const res = await fetch("/seats");
  seats = await res.json();
  renderSeats();
}

async function bookSeat(seatId) {
  const token = getToken();
  const username = getUsername();

  if (!token || !username) {
    window.location.href = "/login.html";
    return;
  }

  const seat = seats.find((item) => item.id === seatId);
  if (!seat || seat.isbooked) {
    return;
  }

  try {
    const res = await fetch(`/${seatId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await readResponse(res);

    if (!res.ok || data?.error) {
      await loadSeats();
      return;
    }

    seats = seats.map((item) =>
      item.id === seatId
        ? { ...item, isbooked: 1, bookedby: username }
        : item
    );

    renderSeats();
  } catch (error) {
    void error;
  }
}

logoutBtn.addEventListener("click", async () => {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(usernameKey);
  window.location.href = "/login.html";
});

(async function init() {
  if (!getToken()) {
    window.location.href = "/login.html";
    return;
  }

  syncAuthUi();
  await loadSeats();
})();