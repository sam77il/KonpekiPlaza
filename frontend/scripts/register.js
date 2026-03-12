const registerForm = document.getElementById("register-form");
const errorMessage = document.getElementById("error-message");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const res = await fetch(registerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();

    if (data.success) {
      window.location.href = "/account.html";
    } else {
      errorMessage.textContent = data.message || "Error registering user";
    }
  } catch (error) {
    console.error("Error during registration:", error);
  }
});
