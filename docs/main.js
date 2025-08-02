const canvas = document.getElementById('gameCanvas');
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // Panggil sekali di awal

const ctx = canvas.getContext('2d');
const socket = io("https://1c3cca08-8104-423a-bed7-e7ce5f3adbcb-00-2brvmohad4s73.pike.replit.dev");

let players = {};
let currentPlayer = null;
let moveX = 0;
let moveY = 0;
let chatMessages = {};
let isTouching = false; // Untuk mendeteksi apakah touchscreen sedang aktif
let lands = [];
let selectedLandIndex = null;

socket.on("updateLands", (data) => {
  lands = data;
});

// Load background & character images
const bg = new Image();
bg.src = 'assets/bg.png';

const images = {
  male: new Image(),
  female: new Image(),
};
images.male.src = 'assets/player_male.png';
images.female.src = 'assets/player_female.png';

// Pilih gender
function selectGender(gender) {
  document.getElementById('genderSelector').style.display = 'none';
  canvas.style.display = 'block';
  document.getElementById('chatBox').style.display = 'block';

  currentPlayer = {
    x: 100 + Math.random() * 200,
    y: 100 + Math.random() * 200,
    gender: gender
  };

  socket.emit("newPlayer", currentPlayer);
}
window.selectGender = selectGender;

// Update pemain dari server
socket.on("updatePlayers", (serverPlayers) => {
  players = serverPlayers;
});

// Terima chat
socket.on("chat", ({ id, message }) => {
  chatMessages[id] = { text: message, time: Date.now() };

  const messagesDiv = document.getElementById("messages");
  const msg = document.createElement("div");
msg.className = "message " + (id === socket.id ? "self" : "other");
msg.textContent = (id === socket.id ? "🟢 Kamu: " : `${players[id]?.gender || "Player"}: `) + message;
messagesDiv.appendChild(msg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Chat input
const chatInput = document.getElementById("chatInput");
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && chatInput.value.trim() !== "") {
    socket.emit("chat", { id: socket.id, message: chatInput.value });
    chatInput.value = "";
  }
});

// Keyboard PC
let keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function updateKeyboardMovement() {
  if (isTouching) return; // Abaikan jika sedang sentuh

  moveX = 0;
  moveY = 0;

  if (keys["ArrowUp"] || keys["w"]) moveY = -1;
  else if (keys["ArrowDown"] || keys["s"]) moveY = 1;

  if (keys["ArrowLeft"] || keys["a"]) moveX = -1;
  else if (keys["ArrowRight"] || keys["d"]) moveX = 1;
}

// Tombol arah HP
function startMove(x, y) {
  moveX = x;
  moveY = y;
  isTouching = true;
}
function stopMove() {
  moveX = 0;
  moveY = 0;
  isTouching = false;
}

["btnUp", "btnDown", "btnLeft", "btnRight"].forEach(id => {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener("touchstart", () => {
    if (id === "btnUp") startMove(0, -1);
    if (id === "btnDown") startMove(0, 1);
    if (id === "btnLeft") startMove(-1, 0);
    if (id === "btnRight") startMove(1, 0);
  });
  btn.addEventListener("touchend", stopMove);
});

// Game loop
function gameLoop() {
  requestAnimationFrame(gameLoop);

  if (!currentPlayer) return;

  updateKeyboardMovement();

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
        const bubbleWidth = msg.length * 6 + 10;
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(p.x - bubbleWidth / 2 + 16, p.y - 25, bubbleWidth, 20);
        ctx.fillStyle = "white";
        ctx.font = "12px sans-serif";
        ctx.fillText(msg, p.x - bubbleWidth / 2 + 21, p.y - 10);

// Render grid tanah
for (let i = 0; i < 100; i++) {
  const col = i % 10;
  const row = Math.floor(i / 10);
  const x = 50 + col * 50;
  const y = 50 + row * 50;

  ctx.strokeStyle = "yellow";
  ctx.strokeRect(x, y, 48, 48);

  const land = lands[i];
  if (land) {
    ctx.fillStyle = "rgba(255,255,0,0.2)";
    ctx.fillRect(x, y, 48, 48);
    ctx.fillStyle = "white";
    ctx.font = "10px sans-serif";
    ctx.fillText(land.ownerName, x + 2, y + 12);

    function buyLand(index) {
  socket.emit("buyLand", index, currentPlayer?.gender || "Player");
}

  }
}

        
      }
    }
  }
}
gameLoop();

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  for (let i = 0; i < 100; i++) {
    const col = i % 10;
    const row = Math.floor(i / 10);
    const x = 50 + col * 50;
    const y = 50 + row * 50;

    if (mouseX >= x && mouseX <= x + 48 && mouseY >= y && mouseY <= y + 48) {
      selectedLandIndex = i;
      updateLandPopup(i);
      break;
    }
  }
});

// === Tambahan ke main.js === //

// Saldo coin player
let prCoin = 0;

// Tombol Tambang PR Coin
const mineBtn = document.createElement("button");
mineBtn.textContent = "⛏️ Tambang PR Coin";
mineBtn.id = "mineBtn";
mineBtn.style.position = "fixed";
mineBtn.style.bottom = "120px";
mineBtn.style.right = "20px";
mineBtn.style.zIndex = "1000";
mineBtn.style.padding = "10px 15px";
mineBtn.style.borderRadius = "10px";
mineBtn.style.backgroundColor = "#28a745";
mineBtn.style.color = "white";
mineBtn.style.border = "none";
document.body.appendChild(mineBtn);

// Tombol Beli PR Coin
const buyBtn = document.createElement("button");
buyBtn.textContent = "💳 Beli PR Coin";
buyBtn.id = "buyBtn";
buyBtn.style.position = "fixed";
buyBtn.style.bottom = "70px";
buyBtn.style.right = "20px";
buyBtn.style.zIndex = "1000";
buyBtn.style.padding = "10px 15px";
buyBtn.style.borderRadius = "10px";
buyBtn.style.backgroundColor = "#007bff";
buyBtn.style.color = "white";
buyBtn.style.border = "none";
document.body.appendChild(buyBtn);

// Tampilkan saldo
const coinDisplay = document.createElement("div");
coinDisplay.id = "coinDisplay";
coinDisplay.style.position = "fixed";
coinDisplay.style.bottom = "170px";
coinDisplay.style.right = "20px";
coinDisplay.style.zIndex = "1000";
coinDisplay.style.color = "white";
coinDisplay.style.fontSize = "16px";
coinDisplay.style.fontWeight = "bold";
coinDisplay.textContent = `💰 PR Coin: ${prCoin}`;
document.body.appendChild(coinDisplay);

// Fungsi tombol
mineBtn.addEventListener("click", () => {
  prCoin++;
  updateCoinDisplay();
});

buyBtn.addEventListener("click", () => {
  prCoin += 10;
  updateCoinDisplay();
});

function updateCoinDisplay() {
  coinDisplay.textContent = `💰 PR Coin: ${prCoin}`;
}

// Kirim juga saldo PR Coin ke server (nantinya bisa disimpan)
socket.emit("updateCoin", { id: socket.id, coin: prCoin });

function updateLandPopup(index) {
  const land = lands[index];
  const popup = document.getElementById("landPopup");
  const info = document.getElementById("landInfo");
  const buyBtn = document.getElementById("buyLandBtn");

  if (!land) {
    info.textContent = `Tanah #${index} tersedia`;
    buyBtn.style.display = "inline-block";
    buyBtn.onclick = () => {
      socket.emit("buyLand", index, currentPlayer?.gender || "Player");
      popup.style.display = "none";
    };
  } else {
    info.textContent = `Tanah #${index} dimiliki oleh ${land.ownerName}`;
    buyBtn.style.display = "none";
  }

  popup.style.display = "block";
}
canvas.addEventListener("click", () => {
  if (selectedLandIndex === null) {
    document.getElementById("landPopup").style.display = "none";
  }
});
