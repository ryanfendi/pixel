const chatInput = document.getElementById('chatInput');
const messagesDiv = document.getElementById('messages');

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && chatInput.value.trim() !== "") {
    const text = chatInput.value.trim();
    socket.emit("chat", text);
    chatInput.value = "";
  }
});

socket.on("chat", (msg) => {
  const p = document.createElement("p");
  p.textContent = msg;
  messagesDiv.appendChild(p);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
