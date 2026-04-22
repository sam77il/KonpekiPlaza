const agentItemList = document.querySelector(".agent-item-list");

async function loadAgentPage(agent) {
  if (agent === "viktor") {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <img id="agent-bg" src="../images/viktor_bg.jpg" alt="viktor image" /> 
    `,
    );
  } else if (agent === "fingers") {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <img id="agent-bg" src="../images/fingers_bg.webp" alt="fingers image" /> 
    `,
    );
  } else if (agent === "nusa") {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <img id="agent-bg" src="../images/nusa_bg.webp" alt="fingers image" /> 
    `,
    );
  }

  const agentBackground = document.getElementById("agent-bg");

  agentBackground.style.position = "fixed";
  agentBackground.style.top = "0";
  agentBackground.style.left = "0";
  agentBackground.style.width = "100vw";
  agentBackground.style.height = "100vh";
  agentBackground.style.objectFit = "cover";
  agentBackground.style.zIndex = "-1";

  agentBackground.style.filter = "blur(10px)";
  // agentBackground.style.transform = "scale(1.1)"; // verhindert weiße Ränder durch blur

  try {
    const res = await fetch(`http://localhost:5030/api/agents/${agent}`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();

    if (!data.success) {
      return;
    }

    for (const item of data.items) {
      agentItemList.innerHTML += `
          <button class="agent-item" ${Number(item.amount) > 0 ? "" : "disabled"} data-itemid="${item.item_id}">
            <h3>${item.label}</h3>
            <img src="../images/${item.img}" alt="${item.label} image" />
            <div>
              <p>${item.amount}x</p>
              <p>${Number(Number(item.price)).toLocaleString()}€$</p>
            </div>
          </button>
        `;
    }

    const allItemButtons = document.querySelectorAll(".agent-item");
    allItemButtons.forEach((btn, _) => {
      btn.addEventListener("click", () => {
        if (window.user.loggedIn) {
          toggleModalBox(true, agent, btn.dataset.itemid);
        } else {
          Notify("System", "Not logged in", "red", 3500);
        }
      });
    });
  } catch (error) {
    console.error("Error loading agent data:", error);
  }
}

async function toggleModalBox(state, agent, itemId) {
  if (document.querySelectorAll(".modal-box").length > 0 && state) return;
  if (!state) {
    const modalBoxes = document.querySelectorAll(".modal-box");
    modalBoxes.forEach((box, _) => {
      box.remove();
    });
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:5030/api/agents/${agent}/items/${itemId}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    const data = await res.json();

    if (!data.success) {
      return;
    }

    document.body.insertAdjacentHTML(
      "beforeend",
      `
    <div class="modal-box">
      <div class="modal-header">
        <h4>Confirm Purchase</h4>
        <span class="close-button">&times;</span>
      </div>
      <div class="modal-content">
        <div>
          <div class="modal-info">
            <p class="modal-desc">
              Are you sure that you want to purchase this item?
            </p>
            <p>Item: <span id="modal-item-label">${data.item.label}</span></p>
            <p>Price: <span id="modal-item-price">${Number(data.item.price).toLocaleString()}</span>€$</p>

            <p>Amount: <span id="item-amount-text">0</span></p>
            <p>Total Price: <span id="item-total-price">0</span>€$</p>
            <input id="item-amount" type="number" max="${data.item.amount}" min="1" />
          </div>
          <div id="modal-img" class="modal-img">
            <img
              src="../images/${data.item.img}"
              alt="Item Image"
              id="modal-item-image"
            />
          </div>
        </div>
        <button id="confirm-purchase-button" data-agentitemid="${data.item.id}">Confirm Purchase</button>
      </div>
    </div>
  `,
    );

    const modalItemPurchaseButton = document.querySelector(
      "#confirm-purchase-button",
    );
    const modalCloseButton = document.querySelector(".close-button");
    const modelItemAmountText = document.querySelector("#item-amount-text");
    const modelItemAmount = document.querySelector("#item-amount");
    const modelItemTotalPrice = document.querySelector("#item-total-price");

    modalCloseButton.addEventListener("click", () => {
      toggleModalBox(false, null, null);
    });

    modalItemPurchaseButton.addEventListener("click", () => {
      buyItem(
        modalItemPurchaseButton.dataset.agentitemid,
        modelItemAmount.value,
      );
    });

    modelItemAmount.addEventListener("input", (e) => {
      modelItemAmountText.textContent = e.target.value;
      modelItemTotalPrice.textContent =
        Number(data.item.price) * Number(e.target.value);
    });
  } catch (error) {
    console.error("Error loading item data:", error);
  }
}

async function buyItem(id, amount) {
  try {
    const res = await fetch(
      `http://localhost:5030/api/agents/buy/${id}/${amount}`,
      {
        method: "POST",
        credentials: "include",
      },
    );

    const data = await res.json();

    if (!data.success) {
      return;
    }

    Notify("System", "Successfully bought item", "green", 3500);
    setTimeout(() => {
      window.location.reload();
    }, 3500);
  } catch (error) {
    console.error("Error clicking item:", error);
  }
}
