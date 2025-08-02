const bg = new Image();
bg.src = 'assets/bg.png';
bg.onload = () => console.log("Background termuat");

const bg = new Image();
bg.src = 'assets/bg.png';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const socket = io("https://1c3cca08-8104-423a-bed7-e7ce5f3adbcb-00-2brvmohad4s73.pike.replit.dev/"); // Ganti ini dengan server Socket.IO kamu

let players = {};
let currentPlayer = null;

const images = {
  male: new Image(),
  female: new Image(),
};
images.male.src = 'assets/player_male.png';
images.female.src = 'assets/player_female.png';

images.male.onload = () => console.log("Gambar male termuat");
images.female.onload = () => console.log("Gambar female termuat");


function selectGender(gender) {let joystick = {
  velocity: { x: 0, y: 0 },
  dragging: false,
  origin: { x: 0, y: 0 },
};

const jb = document.getElementById('joystickBase');
const jt = document.getElementById('joystickThumb');

jb.addEventListener("touchstart", e => {
  joystick.dragging = true;
  const t = e.touches[0];
  joystick.origin.x = t.clientX;
  joystick.origin.y = t.clientY;
});
jb.addEventListener("touchmove", e => {
  if (!joystick.dragging) return;
  e.preventDefault();
  const t = e.touches[0];
  const dx = t.clientX - joystick.origin.x;
  const dy = t.clientY - joystick.origin.y;
  const dist = Math.min(40, Math.hypot(dx, dy));
  const ang = Math.atan2(dy, dx);
  const x = Math.cos(ang) * dist;
  const y = Math.sin(ang) * dist;
  joystick.velocity.x = x / 5;
  joystick.velocity.y = y / 5;
  jt.style.transform = `translate(${x}px, ${y}px)`;
});
jb.addEventListener("touchend", () => {
  joystick.dragging = false;
  joystick.velocity.x = 0;
  joystick.velocity.y = 0;
  jt.style.transform = `translate(0px, 0px)`;
});

  document.getElementById('genderSelector').style.display = 'none';
  canvas.style.display = 'block';
  document.getElementById('chatBox').style.display = 'block';

  currentPlayer = {
    x: 100,
    y: 100,
    gender: gender
  };
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

  socket.emit("newPlayer", currentPlayer);
}

socket.on("updatePlayers", (serverPlayers) => {
  players = serverPlayers;
});

function gameLoop() {
  requestAnimationFrame(gameLoop);
  if (currentPlayer) {
  currentPlayer.x += joystick.velocity.x;
  currentPlayer.y += joystick.velocity.y;
  socket.emit("move", currentPlayer);
}


  if (!currentPlayer) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let id in players) {
    const p = players[id];
    const img = images[p.gender];
    if (img.complete && img.naturalHeight !== 0) {
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, p.x, p.y, 32, 32);
    }
  }
}
gameLoop();
