// main.js
const socket = io("https://1c3cca08-8104-423a-bed7-e7ce5f3adbcb-00-2brvmohad4s73.pike.replit.dev/");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let players = {};
let lands = {};
let balances = {};
let playerId = null;
let currentPlayer = null;
let chatMessages = {};

// UI references
const chatInput = document.getElementById("chatInput");
const messagesDiv = document.getElementById("messages");
const mineBtn = document.getElementById("mineBtn");
const coinDisplay = document.getElementById("coinDisplay");
const landContainer = document.getElementById("landContainer");

// Assets
const bg = new Image();
bg.src = "assets/bg.png";

const images = {
  male: new Image(),
  female: new Image(),
};
images.male.src = "assets/player_male.png";
images.female.src = "assets/player_female.png";

// Input
let keys = {};
window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

let moveX = 0;
let moveY = 0;
function updateMovement() {
  moveX = 0;
  moveY = 0;
  if (keys["ArrowUp"] || keys["w"]) moveY = -1;
  else if (keys["ArrowDown"] || keys["s"]) moveY = 1;

  if (keys["ArrowLeft"] || keys["a"]) moveX = -1;
  else if (keys["ArrowRight"] || keys["d"]) moveX = 1;
}

// Select gender
function selectGender(gender) {
  document.getElementById("genderSelector").style.display = "none";
  canvas.style.display = "block";
  document.getElementById("chatBox").style.display = "block";

  currentPlayer = {
    x: 100 + Math.random() * 200,
    y: 100 + Math.random() * 200,
    gender,
  };
  socket.emit("newPlayer", currentPlayer);
}
window.selectGender = selectGender;

// Socket Events
socket.on("initData", (data) => {
  lands = data.lands;
  balances = data.balances;
  playerId = data.playerId;
  players = data.players;
  updateBalance(balances[playerId]);
  renderLandGrid();
});

socket.on("updatePlayers", (data) => {
  players = data;
});

socket.on("chat", ({ id, message }) => {
  chatMessages[id] = { text: message, time: Date.now() };
  const msg = document.createElement("div");
  msg.textContent = `${players[id]?.gender || "Player"}: ${message}`;
  messagesDiv.appendChild(msg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on("updateLands", (data) => {
  lands = data;
  renderLandGrid();
});

socket.on("updateBalance", (amount) => {
  updateBalance(amount);
});

function updateBalance(coin) {
  if (coinDisplay) coinDisplay.textContent = `💰 PR Coin: ${coin}`;
}

// Chat Input
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && chatInput.value.trim() !== "") {
    socket.emit("chat", { id: playerId, message: chatInput.value });
    chatInput.value = "";
  }
});

// Mining PR Coin
if (mineBtn) {
  mineBtn.addEventListener("click", () => {
    socket.emit("minePRCoin");
  });
}

// Land UI
function renderLandGrid() {
  if (!landContainer) return;
  landContainer.innerHTML = "";
  for (let i = 0; i < 100; i++) {
    const cell = document.createElement("div");
    cell.className = "land-tile";
    const land = lands[i];
    if (land) {
      cell.textContent = land.ownerName;
      if (land.forSale) cell.style.border = "2px solid gold";
    } else {
      cell.textContent = "Buy";
      cell.style.background = "#333";
      cell.onclick = () => {
        const name = players[playerId]?.name || "Player";
        socket.emit("buyLand", i, name);
      };
    }
    landContainer.appendChild(cell);
  }
}

// Game Loop
function gameLoop() {
  requestAnimationFrame(gameLoop);
  if (!currentPlayer) return;

  updateMovement();
  currentPlayer.x += moveX * 2;
  currentPlayer.y += moveY * 2;
  socket.emit("move", currentPlayer);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  for (let id in players) {
    const p = players[id];
    const img = images[p.gender];
    if (img.complete && img.naturalHeight !== 0) {
      ctx.drawImage(img, p.x, p.y, 32, 32);
      if (chatMessages[id] && Date.now() - chatMessages[id].time < 5000) {
        const msg = chatMessages[id].text;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(p.x, p.y - 20, msg.length * 6 + 10, 20);
        ctx.fillStyle = "white";
        ctx.font = "12px sans-serif";
        ctx.fillText(msg, p.x + 5, p.y - 6);
      }
    }
  }
}
gameLoop();
