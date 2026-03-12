const pingUrl = "http://localhost:3000/api/auth/ping";
const registerUrl = "http://localhost:3000/api/auth/register";
const loginUrl = "http://localhost:3000/api/auth/login";

const accountElement = document.getElementById("account");

const user = {
  id: null,
  email: null,
  username: null,
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
    accountElement.innerHTML = accountTemplate;
  } else {
    user.loggedIn = false;
    console.log("User is not logged in");
    accountElement.innerHTML = loginTemplate;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  pingApi();
});
