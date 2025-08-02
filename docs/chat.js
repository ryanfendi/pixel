const chatInput = document.getElementById("chatInput");
const messages = document.getElementById("messages");

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && chatInput.value.trim() !== "") {
    socket.emit("chat", chatInput.value);
    chatInput.value = "";
  }
});

socket.on("chat", (msg) => {
  const div = document.createElement("div");
  div.textContent = msg;
  messages.appendChild(div);
});
