const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const socket = io("https://1c3cca08-8104-423a-bed7-e7ce5f3adbcb-00-2brvmohad4s73.pike.replit.dev");

let players = {};
let currentPlayer = null;
let moveX = 0;
let moveY = 0;

// Load background
const bg = new Image();
bg.src = 'assets/bg.png';

// Load player images
const images = {
  male: new Image(),
  female: new Image(),
};
images.male.src = 'assets/player_male.png';
images.female.src = 'assets/player_female.png';

// --- TOUCHSCREEN DRAG MOVE ---
let dragging = false;
let startX = 0, startY = 0;

canvas.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  if (touch.clientX < window.innerWidth / 2) {
    dragging = true;
    startX = touch.clientX;
    startY = touch.clientY;
  }
});

canvas.addEventListener('touchmove', (e) => {
  if (!dragging) return;
  const touch = e.touches[0];
  const dx = touch.clientX - startX;
  const dy = touch.clientY - startY;

  const max = 40;
  moveX = Math.max(-1, Math.min(1, dx / max));
  moveY = Math.max(-1, Math.min(1, dy / max));
});

canvas.addEventListener('touchend', () => {
  dragging = false;
  moveX = 0;
  moveY = 0;
});

// PILIH GENDER
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

// SOCKET LISTENER
socket.on("updatePlayers", (serverPlayers) => {
  players = serverPlayers;
});

// GAME LOOP
function gameLoop() {
  requestAnimationFrame(gameLoop);
  if (!currentPlayer) return;

  updateKeyboardMovement();
// Tombol panah touchscreen (HP)
const btnUp = document.getElementById("btnUp");
const btnDown = document.getElementById("btnDown");
const btnLeft = document.getElementById("btnLeft");
const btnRight = document.getElementById("btnRight");

btnUp.addEventListener("touchstart", () => moveY = -1);
btnDown.addEventListener("touchstart", () => moveY = 1);
btnLeft.addEventListener("touchstart", () => moveX = -1);
btnRight.addEventListener("touchstart", () => moveX = 1);

btnUp.addEventListener("touchend", () => moveY = 0);
btnDown.addEventListener("touchend", () => moveY = 0);
btnLeft.addEventListener("touchend", () => moveX = 0);
btnRight.addEventListener("touchend", () => moveX = 0);

  
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
    }
  }
}
gameLoop();

// PC: Keyboard movement
let keys = {};
window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

function updateKeyboardMovement() {
  if (keys["ArrowUp"] || keys["w"]) moveY = -1;
  else if (keys["ArrowDown"] || keys["s"]) moveY = 1;
  else if (!dragging) moveY = 0;

  if (keys["ArrowLeft"] || keys["a"]) moveX = -1;
  else if (keys["ArrowRight"] || keys["d"]) moveX = 1;
  else if (!dragging) moveX = 0;
}
