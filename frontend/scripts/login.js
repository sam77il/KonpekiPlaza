const loginForm = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    const data = await res.json();

    if (data.success) {
      // window.location.href = "/account.html";
      user.email = data.user.email;
      user.username = data.user.username;
      user.id = data.user.id;
      user.loggedIn = true;
      console.log("Login successful:", data.user);
      window.location.href = "/account.html";
    } else {
      errorMessage.textContent = data.message || "Error logging in";
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
});
