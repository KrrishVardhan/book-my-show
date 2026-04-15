const tbl = document.getElementById("tbl");
const currentUserEl = document.getElementById("currentUser");
const logoutBtn = document.getElementById("logoutBtn");

const tokenKey = "bookmyshow_token";
const usernameKey = "bookmyshow_username";

let seats = [];

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

function seatTooltip(bookedBy) {
  return `
    <span class="relative z-10"></span>
    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-slate-900 border border-slate-700 text-sm text-slate-300 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-2xl z-50 pointer-events-none font-normal shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
      Booked by: <span class="font-bold text-white ml-1">${bookedBy || "Unknown"}</span>
      <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-[6px] border-transparent border-t-slate-700"></div>
      <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-[5px] border-transparent border-t-slate-900"></div>
    </div>
  `;
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
      "w-28 h-28 md:w-32 md:h-32 rounded-2xl text-center align-middle text-2xl font-bold transition-all duration-300 select-none relative group";

    td.dataset.seatId = seat.id;
    td.dataset.seatName = seat.seat_name;

    if (seat.isbooked) {
      td.className = `${baseClasses} bg-rose-500/10 text-rose-500/60 border border-rose-500/20 cursor-not-allowed`;
      td.innerHTML = `
        <span class="relative z-10">${seat.seat_name}</span>
        ${seatTooltip(seat.bookedby)}
      `;
    } else {
      td.className = `${baseClasses} bg-emerald-500 text-white border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer hover:bg-emerald-400 hover:-translate-y-1.5 hover:shadow-[0_10px_25px_rgba(16,185,129,0.5)] active:scale-95 active:shadow-[0_0_10px_rgba(16,185,129,0.3)]`;
      td.innerHTML = `<span class="relative z-10">${seat.seat_name}</span>`;
    }

    td.addEventListener("click", () => bookSeat(seat.id));
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