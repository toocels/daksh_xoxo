This is a Tic-Tac-Toe Online game.

Run server using "node server.js",
in linux need sudo cuz by default hosting in port 80.

Can change ADDRESS or hosting PORT in .env file
Eg .env file, with necessary variables
	PORT=80
	ADDRESS="localhost"

Using express to host the fronend.
Using ws to handle websocket communication.

Features:
	If opponent disconnects, you win.
	Many ppl can connect, and server automatically pits 2 against one another.