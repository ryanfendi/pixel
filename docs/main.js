const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const socket = io("https://1c3cca08-8104-423a-bed7-e7ce5f3adbcb-00-2brvmohad4s73.pike.replit.dev/");

let players = {};
let currentPlayer = null;

// Background
const bg = new Image();
bg.src = 'assets/bg.png';
bg.onload = () => console.log("Background termuat");

// Player Images
const images = {
  male: new Image(),
  female: new Image(),
};
images.male.src = 'assets/player_male.png';
images.female.src = 'assets/player_female.png';

images.male.onload = () => console.log("Gambar male termuat");
images.female.onload = () => console.log("Gambar female termuat");

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

// Pilih Gender
function selectGender(gender) {
  document.getElementById('genderSelector').style.display = 'none';
  canvas.style.display = 'block';
  document.getElementById('chatBox').style.display = 'block';

  currentPlayer = {
    x: 100,
    y: 100,
    gender: gender
  };

  socket.emit("newPlayer", currentPlayer);
}

// Socket updates
socket.on("updatePlayers", (serverPlayers) => {
  players = serverPlayers;
});

// Game Loop
function gameLoop() {
  requestAnimationFrame(gameLoop);
  if (!currentPlayer) return;

  // Update posisi
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
