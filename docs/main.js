const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const socket = io("https://1c3cca08-8104-423a-bed7-e7ce5f3adbcb-00-2brvmohad4s73.pike.replit.dev");

let players = {};
let currentPlayer = null;

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

// Joystick
let moveX = 0;
let moveY = 0;

const stick = document.getElementById('stick');
const joystick = document.getElementById('joystick');

let dragging = false;

joystick.addEventListener('touchstart', (e) => {
  dragging = true;
});

joystick.addEventListener('touchmove', (e) => {
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

joystick.addEventListener('touchend', () => {
  dragging = false;
  stick.style.left = '30px';
  stick.style.top = '30px';
  moveX = 0;
  moveY = 0;
});

// Gender select
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

// Server updates
socket.on("updatePlayers", (serverPlayers) => {
  players = serverPlayers;
});

// Game loop
function gameLoop() {
  requestAnimationFrame(gameLoop);

  if (!currentPlayer) return;

  currentPlayer.x += moveX * 2;
  currentPlayer.y += moveY * 2;
  socket.emit("move", currentPlayer);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  for (let id in players) {
    const p = players[id];
    const img = images[p.gender];
    if (img.complete) {
      ctx.drawImage(img, p.x, p.y, 32, 32);
    }
  }
}
gameLoop();
let keys = {};

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function updateKeyboardMovement() {
  if (keys["ArrowUp"] || keys["w"]) moveY = -1;
  else if (keys["ArrowDown"] || keys["s"]) moveY = 1;
  else moveY = 0;

  if (keys["ArrowLeft"] || keys["a"]) moveX = -1;
  else if (keys["ArrowRight"] || keys["d"]) moveX = 1;
  else moveX = 0;
}
