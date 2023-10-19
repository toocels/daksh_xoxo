const socket = new WebSocket("ws://" + window.location.hostname);

socket.addEventListener("open", (event) => {
	// socket.send("Play XOXO");
	// setTimeout(()=>{
	// socket.send()
	// },3000)
});

socket.addEventListener("message", (event) => {
	console.log("Message from server ", event.data);
	socket.send(event.data)
});