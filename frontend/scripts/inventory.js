const userItemList = document.querySelector(".inventory-item-list");

async function loadInventoryPage() {
  try {
    const res = await fetch(`http://localhost:5030/api/inventory`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();

    if (data.success && data.message === "NIF") {
      Notify("System", "No Items found", "red", 3500);
      return;
    }

    if (data.success) {
      userItemList.innerHTML = "";
      document.getElementById("username").textContent = window.user.username;

      for (const item of data.items) {
        userItemList.innerHTML += `
          <button class="inventory-item" data-itemid="${item.item_id}">
            <h3>${item.label}</h3>
            <img src="../images/${item.img}" alt="${item.label} image" />
            <div>
              <p>${item.amount}x</p>
            </div>
          </button>
        `;
      }

      const allItemButtons = document.querySelectorAll(".agent-item");
      allItemButtons.forEach((btn, _) => {
        btn.addEventListener("click", () => {
          onItemClick(agent, btn.dataset.itemid);
        });
      });
    }
  } catch (error) {
    console.error("Error loading agent data:", error);
  }
}
