const pingUrl = "http://localhost:3000/api/auth/ping";
const registerUrl = "http://localhost:3000/api/auth/register";
const loginUrl = "http://localhost:3000/api/auth/login";

const accountElement = document.getElementById("account");

window.user = {
  id: null,
  email: null,
  username: null,
  eurodollar: 0,
  loggedIn: false,
};

async function pingApi() {
  let loginTemplate = `
  <div>
    <a href="/login.html">Login</a>
    <a href="/register.html">Register</a>
  </div>
  `;

  let accountTemplate = `
  <div>
    <a href="/inventory.html">Inventory</a>
    <a href="/account.html">Account</a>
  </div>
  `;
  const res = await fetch(pingUrl, {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json();

  if (data.loggedIn) {
    console.log("User is logged in:", data.user);

    window.user.loggedIn = true;
    window.user.id = data.user.id;
    window.user.username = data.user.username;
    window.user.email = data.user.email;
    window.user.eurodollar = data.user.eurodollar;

    document.querySelector(".eurodollar").style.display = "block";
    document.getElementById("eurodollar-amount").textContent = Number(
      data.user.eurodollar,
    ).toLocaleString();

    accountElement.innerHTML = accountTemplate;
  } else {
    console.log("User is not logged in");
    document.querySelector(".eurodollar").style.display = "none";
    accountElement.innerHTML = loginTemplate;
  }

  if (window.location.pathname === "/account.html" && !data.loggedIn) {
    window.location.href = "/login.html";
  }

  if (window.location.pathname === "/marketplace.html" && !data.loggedIn) {
    window.location.href = "/login.html";
  }

  if (window.location.pathname === "/account.html" && data.loggedIn) {
    loadAccountPage();
  } else if (window.location.pathname === "/viktor.html") {
    loadAgentPage("viktor");
  } else if (window.location.pathname === "/fingers.html") {
    loadAgentPage("fingers");
  } else if (window.location.pathname === "/nusa.html") {
    loadAgentPage("nusa");
  } else if (window.location.pathname === "/inventory.html" && data.loggedIn) {
    loadInventoryPage();
  } else if (window.location.pathname === "/marketplace.html") {
    loadMarketplacePage();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  pingApi();
});
