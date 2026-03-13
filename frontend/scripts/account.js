const konpekiIdSpan = document.getElementById("konpeki-id");
const konpekiUsernameInput = document.getElementById("konpeki-username");
const konpekiEmailInput = document.getElementById("konpeki-email");
const logoutButton = document.getElementById("logout-button");
const saveUsernameButton = document.getElementById("save-username");
const saveEmailButton = document.getElementById("save-email");
const savePasswordButton = document.getElementById("save-password");
const konpekiCurrentPasswordInput = document.getElementById(
  "konpeki-currentpassword",
);
const konpekiNewPasswortInput = document.getElementById("konpeki-newpassword");
const konpekiNewPasswordConfirmInput = document.getElementById(
  "konpeki-newpasswordconfirm",
);

function loadAccountPage() {
  console.log("Loading account page for user:", window.user);
  if (!window.user.loggedIn) {
    window.location.href = "/login.html";
    return;
  }

  // For now, we'll just display the user's email as their Konpeki ID
  konpekiIdSpan.textContent = window.user.id;
  // Set the username input value to the user's current username
  konpekiUsernameInput.value = window.user.username;
  // Set the email input value to the user's current email
  konpekiEmailInput.value = window.user.email;

  savePasswordButton.addEventListener("click", async () => {
    const currentPassword = konpekiCurrentPasswordInput.value;
    const newPassword = konpekiNewPasswortInput.value;
    const newPasswordConfirm = konpekiNewPasswordConfirmInput.value;
    if (newPassword !== newPasswordConfirm) {
      alert("New password and confirmation do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword: newPassword,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        alert("Password updated successfully");
        konpekiCurrentPasswordInput.value = "";
        konpekiNewPasswortInput.value = "";
        konpekiNewPasswordConfirmInput.value = "";
      } else {
        alert(data.message || "Error updating password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
    }
  });

  saveEmailButton.addEventListener("click", async () => {
    const newEmail = konpekiEmailInput.value.trim();

    if (newEmail === "") {
      alert("Email cannot be empty");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/update-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newEmail }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        alert("Email updated successfully");
        window.user.email = newEmail;
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating email:", error);
    }
  });

  saveUsernameButton.addEventListener("click", async () => {
    const newUsername = konpekiUsernameInput.value.trim();

    if (newUsername === "") {
      alert("Username cannot be empty");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/update-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: newUsername }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        alert("Username updated successfully");
        window.user.username = newUsername;
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating username:", error);
    }
  });

  logoutButton.addEventListener("click", async () => {
    try {
      const res = await fetch("http://localhost:3000/api/auth/logout", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        window.user.loggedIn = false;
        window.user.id = null;
        window.user.username = null;
        window.user.email = null;
        window.location.href = "/login.html";
      } else {
        console.error("Error during logout:", data.message);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  });
}
