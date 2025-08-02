
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const socket = io("https://your-server-url"); // Ganti dengan servermu

let players = {};
let currentPlayer = null;

const images = {
  male: new Image(),
  female: new Image(),
};
images.male.src = 'assets/player_male.png';
images.female.src = 'assets/player_female.png';

images.male.onload = () => console.log("Male image loaded");
images.female.onload = () => console.log("Female image loaded");

let joystick = {
  velocity: { x: 0, y: 0 }
};

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

socket.on("updatePlayers", (serverPlayers) => {
  players = serverPlayers;
});

function gameLoop() {
  requestAnimationFrame(gameLoop);
  if (!currentPlayer) return;

  currentPlayer.x += joystick.velocity.x;
  currentPlayer.y += joystick.velocity.y;

  socket.emit("move", currentPlayer);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let id in players) {
    const p = players[id];
    const img = images[p.gender] || images.male;
    if (img.complete && img.naturalHeight !== 0) {
      ctx.drawImage(img, p.x, p.y, 32, 32);
    }
  }
}
gameLoop();
