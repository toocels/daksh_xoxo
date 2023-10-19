const socket = new WebSocket("ws://"+window.location.hostname);

socket.addEventListener("open", (event) => {
  // socket.send("Play XOXO");
});

socket.addEventListener("message", (event) => {
  console.log("Message from server ", event.data);
});
