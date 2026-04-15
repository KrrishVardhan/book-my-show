const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const authMessage = document.getElementById("authMessage");
const showLogin = document.getElementById("showLogin");
const showSignup = document.getElementById("showSignup");

const tokenKey = "bookmyshow_token";
const usernameKey = "bookmyshow_username";

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

function setMessage(message, type = "info") {
  authMessage.textContent = message;
  authMessage.className =
    "mt-5 rounded-xl border px-4 py-3 text-sm " +
    (type === "error"
      ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
      : type === "success"
        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
        : "border-slate-700 bg-slate-950/40 text-slate-400");
}

function showLoginForm() {
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
  showLogin.className = "rounded-xl bg-cyan-500 text-slate-950 font-semibold py-3";
  showSignup.className = "rounded-xl bg-slate-800 text-slate-300 font-semibold py-3 border border-slate-700";
}

function showSignupForm() {
  signupForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  showSignup.className = "rounded-xl bg-cyan-500 text-slate-950 font-semibold py-3";
  showLogin.className = "rounded-xl bg-slate-800 text-slate-300 font-semibold py-3 border border-slate-700";
}

showLogin.addEventListener("click", showLoginForm);
showSignup.addEventListener("click", showSignupForm);

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await readResponse(res);

    if (!res.ok) {
      setMessage(typeof data === "string" ? data : data?.message || "Login failed.", "error");
      return;
    }

    localStorage.setItem(tokenKey, data.token);
    localStorage.setItem(usernameKey, username);
    window.location.href = "/index.html";
  } catch (error) {
    setMessage(`Login failed: ${error.message}`, "error");
  }
});

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value;

  try {
    const res = await fetch("/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await readResponse(res);

    if (!res.ok) {
      setMessage(typeof data === "string" ? data : data?.message || "Signup failed.", "error");
      return;
    }

    setMessage("Account created. Please log in.", "success");
    showLoginForm();
    loginForm.querySelector("#loginUsername").value = username;
    signupForm.reset();
  } catch (error) {
    setMessage(`Signup failed: ${error.message}`, "error");
  }
});

if (localStorage.getItem(tokenKey)) {
  window.location.href = "/index.html";
} else {
  showLoginForm();
}