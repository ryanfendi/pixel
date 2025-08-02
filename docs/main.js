// main.js
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

// JOYSTICK
const joystick = document.getElementById('joystick');
const stick = document.getElementById('stick');

let dragging = false;
let startX = 0, startY = 0;

joystick.addEventListener('touchstart', (e) => {
  dragging = true;
  const touch = e.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;
});

joystick.addEventListener('touchmove', (e) => {
  if (!dragging) return;
  e.preventDefault();

  const touch = e.touches[0];
  const dx = touch.clientX - startX;
  const dy = touch.clientY - startY;

  const max = 40;
  const dist = Math.min(max, Math.hypot(dx, dy));
  const angle = Math.atan2(dy, dx);
  const x = Math.cos(angle) * dist;
  const y = Math.sin(angle) * dist;

  stick.style.transform = `translate(${x}px, ${y}px)`;

  moveX = x / max;
  moveY = y / max;
});

joystick.addEventListener('touchend', () => {
  dragging = false;
  stick.style.transform = `translate(0px, 0px)`;
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
window.selectGender = selectGender; // agar bisa diakses dari HTML onclick

// RECEIVE PLAYER DATA
socket.on("updatePlayers", (serverPlayers) => {
  players = serverPlayers;
});

// GAME LOOP
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
    }
  }
}
gameLoop();

// KEYBOARD (untuk PC)
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
