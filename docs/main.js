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
      }
    }
  }
}
gameLoop();
