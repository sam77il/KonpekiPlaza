const marketplaceItemlist = document.querySelector(".marketplace-item-list");
const listitemBtn = document.querySelector("#marketplace-listitem");

async function loadMarketplacePage() {
  try {
    listitemBtn.addEventListener("click", () => {
      showMarketplaceModal();
    });
    const res = await fetch(`http://localhost:5030/api/marketplace`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();

    if (data.success && data.message === "NIF") {
      Notify("System", "No Items found", "red", 3500);
      return;
    }

    if (data.success) {
      marketplaceItemlist.innerHTML = "";
      console.log(data.items);
      for (const item of data.items) {
        marketplaceItemlist.innerHTML += `
          <button class="marketplace-item" data-marketplaceid="${item.id}">
            <h3>${item.label}</h3>
            <img src="../images/${item.img}" alt="${item.label} image" />
            <div>
              <p>${item.username}</p>
              <p>$${item.price.toFixed(2)} | ${item.amount}x</p>
            </div>
          </button>
        `;
      }

      const allItemButtons = document.querySelectorAll(".marketplace-item");
      allItemButtons.forEach((btn, _) => {
        btn.addEventListener("click", () => {
          onItemClick(btn.dataset.marketplaceid);
        });
      });
    }
  } catch (error) {
    console.error("Error loading agent data:", error);
  }
}

async function showMarketplaceModal() {
  if (!window.user.loggedIn) {
    Notify("System", "Not logged in", "red", 3500);
    return;
  }

  const res = await fetch("http://localhost:5030/api/inventory");
  const data = await res.json();

  console.log(data);

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div class="modal-box">
      <div class="modal-header">
        <h4>List an Item</h4>
        <span class="close-button">&times;</span>
      </div>
      <div class="modal-content">
        <div>
          <select id="modal-select">
            <option value="">Select an Item</option>
            ${data.items
              .map((item) => {
                return `<option value="${item.id}">${item.label} | ${item.amount}x</option>`;
              })
              .join("")}
          </select>
          <div hidden id="modal-item-content-box">
            <input id="modal-item-amount" type="range" step="1" min="1" />
            <input id="modal-item-amount-text" style="display: inline-block; background-color: transparent; color: white; border: none; outline: none; min-width: 50px" />
            <input id="modal-item-price" type="number" placeholder="Price" />
          </div>
        </div>
        <button id="confirm-additems-button">
          List the Items
        </button>
      </div>
    </div>
    `,
  );

  const modalSelect = document.querySelector("#modal-select");
  const modalItemAmount = document.querySelector("#modal-item-amount");
  const modalItemAmountText = document.querySelector("#modal-item-amount-text");
  const modalItemPrice = document.querySelector("#modal-item-price");
  const modelItemContentBox = document.querySelector("#modal-item-content-box");
  const submitAddItems = document.querySelector("#confirm-additems-button");

  modalSelect.addEventListener("change", (event) => {
    const userItemId = event.target.value;
    console.log(data.items);
    const selectedItem = data.items.find(
      (item) => item.id === Number(userItemId),
    );
    if (selectedItem) {
      modelItemContentBox.hidden = false;
      modalItemAmount.setAttribute("max", `${selectedItem.amount}`);
      modalItemAmount.addEventListener("input", (e) => {
        modalItemAmountText.value = e.target.value;

        modalItemAmountText.addEventListener("input", (ee) => {
          modalItemAmount.value = ee.target.value;
        });
      });
    } else {
      modelItemContentBox.hidden = true;
    }
  });

  submitAddItems.addEventListener("click", (event) => {
    const sellingItem = {
      id: Number(modalSelect.value),
      amount: Number(modalItemAmount.value),
      price: Number(modalItemPrice.value),
    };
    addItemsToMarketplace(sellingItem);
  });
}

async function addItemsToMarketplace(itemData) {
  const res = await fetch(`http://localhost:5030/api/marketplace/additem`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ item: itemData }),
  });
  const result = await res.json();
  if (result.success) {
    Notify("System", "Item listed successfully", "green", 3500);
    setTimeout(() => {
      window.location.reload();
    }, 3500);
  } else {
    Notify("System", result.message || "Error listing item", "red", 3500);
  }
}

async function onItemClick(marketplaceid) {
  console.log(marketplaceid);
  const res = await fetch(
    `http://localhost:5030/api/marketplace/${marketplaceid}`,
    {
      method: "GET",
      credentials: "include",
    },
  );
  const data = await res.json();

  if (!data.success) {
    Notify("System", data.message || "Error fetching item data", "red", 3500);
    return;
  }

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div class="modal-box">
      <div class="modal-header">
        <h4>${data.item.label} ${data.item.amount}x | €$${data.item.price.toFixed(2)}</h4>
        <span class="close-button">&times;</span>
      </div>
      <div class="modal-content">
        <div>
          <p></p>Marketplace ID: ${marketplaceid}</p>
          <input id="buy-item-amount" type="number" placeholder="Amount to buy" />
        </div>
        <button id="confirm-buy-button">
          Buy the Item
        </button>
      </div>
    </div>
    `,
  );

  const buyItemAmount = document.querySelector("#buy-item-amount");
  const confirmBuyButton = document.querySelector("#confirm-buy-button");
  const closeButton = document.querySelectorAll(".close-button");

  closeButton.forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector(".modal-box").remove();
    });
  });

  confirmBuyButton.addEventListener("click", async () => {
    const amountToBuy = Number(buyItemAmount.value);
    if (isNaN(amountToBuy) || amountToBuy <= 0) {
      Notify("System", "Invalid amount", "red", 3500);
      return;
    }

    const buyRes = await fetch(
      `http://localhost:5030/api/marketplace/buy/${marketplaceid}/${amountToBuy}`,
      {
        method: "POST",
        credentials: "include",
      },
    );

    const buyResult = await buyRes.json();

    if (buyResult.success) {
      Notify(
        "System",
        buyResult.message || "Item bought successfully",
        "green",
        3500,
      );
      setTimeout(() => {
        window.location.reload();
      }, 3500);
    } else {
      Notify("System", buyResult.message || "Error buying item", "red", 3500);
    }
  });
}
