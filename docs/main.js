const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const socket = io("https://1c3cca08-8104-423a-bed7-e7ce5f3adbcb-00-2brvmohad4s73.pike.replit.dev");

let players = {};
let currentPlayer = null;
let moveX = 0;
let moveY = 0;
let chatMessages = {};

// Gambar
const bg = new Image();
bg.src = 'assets/bg.png';

const images = {
  male: new Image(),
  female: new Image(),
};
images.male.src = 'assets/player_male.png';
images.female.src = 'assets/player_female.png';

// Fungsi pilih karakter
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

// Tampilkan chat bubble di atas karakter
socket.on("chat", ({ id, message }) => {
  chatMessages[id] = { text: message, time: Date.now() };

  const messagesDiv = document.getElementById("messages");
  const msg = document.createElement("div");
  msg.textContent = `${players[id]?.gender || "Player"}: ${message}`;
  messagesDiv.appendChild(msg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Input chat
const chatInput = document.getElementById("chatInput");
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && chatInput.value.trim() !== "") {
    socket.emit("chat", { id: socket.id, message: chatInput.value });
    chatInput.value = "";
  }
});

// Keyboard movement (PC)
let keys = {};
window.addEventListener("keydown", (e) => { keys[e.key] = true; });
window.addEventListener("keyup", (e) => { keys[e.key] = false; });

function updateKeyboardMovement() {
  if (keys["ArrowUp"] || keys["w"]) moveY = -1;
  else if (keys["ArrowDown"] || keys["s"]) moveY = 1;
  else if (!dragging) moveY = 0;

  if (keys["ArrowLeft"] || keys["a"]) moveX = -1;
  else if (keys["ArrowRight"] || keys["d"]) moveX = 1;
  else if (!dragging) moveX = 0;
}

// Touchscreen joystick
let dragging = false;
const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");

joystick.addEventListener("touchstart", () => {
  dragging = true;
});

joystick.addEventListener("touchend", () => {
  dragging = false;
  stick.style.left = "30px";
  stick.style.top = "30px";
  moveX = 0;
  moveY = 0;
});

joystick.addEventListener("touchmove", (e) => {
  if (!dragging) return;
  e.preventDefault();

  const rect = joystick.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left - 50;
  const y = touch.clientY - rect.top - 50;

  const max = 40;
  const clampedX = Math.max(-max, Math.min(max, x));
  const clampedY = Math.max(-max, Math.min(max, y));

  stick.style.left = `${clampedX + 50 - 20}px`;
  stick.style.top = `${clampedY + 50 - 20}px`;

  moveX = clampedX / max;
  moveY = clampedY / max;
});

// Tombol Arah (Mobile)
document.getElementById("btnUp")?.addEventListener("touchstart", () => moveY = -1);
document.getElementById("btnDown")?.addEventListener("touchstart", () => moveY = 1);
document.getElementById("btnLeft")?.addEventListener("touchstart", () => moveX = -1);
document.getElementById("btnRight")?.addEventListener("touchstart", () => moveX = 1);

["btnUp", "btnDown"].forEach(id => {
  document.getElementById(id)?.addEventListener("touchend", () => moveY = 0);
});
["btnLeft", "btnRight"].forEach(id => {
  document.getElementById(id)?.addEventListener("touchend", () => moveX = 0);
});

// Game Loop
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
const btnUp = document.getElementById("btnUp");
const btnDown = document.getElementById("btnDown");
const btnLeft = document.getElementById("btnLeft");
const btnRight = document.getElementById("btnRight");

let touchInterval;

function startMove(x, y) {
  moveX = x;
  moveY = y;
}

function stopMove() {
  moveX = 0;
  moveY = 0;
}

btnUp?.addEventListener("touchstart", () => startMove(0, -1));
btnDown?.addEventListener("touchstart", () => startMove(0, 1));
btnLeft?.addEventListener("touchstart", () => startMove(-1, 0));
btnRight?.addEventListener("touchstart", () => startMove(1, 0));

["btnUp", "btnDown", "btnLeft", "btnRight"].forEach(id => {
  document.getElementById(id)?.addEventListener("touchend", stopMove);
});
