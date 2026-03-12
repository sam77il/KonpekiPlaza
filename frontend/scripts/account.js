const logoutButton = document.getElementById("logout-button");
const securityButton = document.getElementById("security-button");

logoutButton.addEventListener("click", async () => {
  try {
    const res = await fetch("http://localhost:3000/api/auth/logout", {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    if (data.success) {
      user.id = null;
      user.email = null;
      user.username = null;
      user.loggedIn = false;
      console.log("Logout successful");
      window.location.href = "/index.html";
    } else {
      console.error("Error during logout:", data.message);
    }
  } catch (error) {
    console.error("Error during logout:", error);
  }
});

securityButton.addEventListener("click", () => {
  alert("Security settings are not implemented yet.");
});
