var my_turn = false;
var my_symbol = "X"
var socket;

setTimeout(() => {
	document.querySelector('.start_buttom').click();
}, 100)

function ready() {
	document.querySelector('.start_buttom').style.display = "none";
	document.querySelector('.loading-gif').style.display = "block";
	document.querySelector('.you').style.display = "none"
	document.querySelector('.turn_stat').style.display = "none"
	document.querySelector('.opponent').style.display = "none"

	socket = new WebSocket("ws://" + window.location.hostname);
	socket.addEventListener("open", (event) => {});

	socket.addEventListener("message", (event) => {
		msg = JSON.parse(event.data)

		switch (msg['purpose']) {
			case "game_found":
				document.querySelector('.loading-gif').style.display = "none";
				document.querySelector('.result').style.display = "none";
				document.querySelector('.you').style.display = "block";
				document.querySelector('.you').textContent = "You are playing:" + msg['data']['you_are']
				document.querySelector('.turn_stat').style.display = "block";
				document.querySelectorAll('.cell').forEach(i => i.textContent = "")

				my_symbol = msg['data']['you_are']
				my_turn = msg['data']['you_are'] == "X"
				document.querySelector('.turn_stat').textContent = my_turn ? "Your Turn" : "Opponents Turn"
				document.querySelector('.board').style.opacity = my_turn ? "1" : "0.5";

				socket.send(JSON.stringify({
					"purpose": "my_name",
					"data": {
						"name": Date.now()
					}
				}))
				break;
			case "my_name":
				document.querySelector(".opponent").textContent = "opponent is" + msg['data']['name']
				break;
			case "i_play":
				if (my_symbol == "X")
					document.querySelectorAll(".cell")[msg['data']['pos']].textContent = "O"
				else
					document.querySelectorAll(".cell")[msg['data']['pos']].textContent = "X"
				my_turn = !my_turn
				document.querySelector('.board').style.opacity = "1";
				document.querySelector('.turn_stat').textContent = my_turn ? "Your Turn" : "Opponents Turn"
				checkGameEnd()
				break;
		}
	});
}

function cell_click(id) {
	if (!my_turn)
		return;
	if (document.querySelectorAll(".cell")[id].textContent != "")
		return;

	document.querySelector('.board').style.opacity = "0.5";
	document.querySelectorAll(".cell")[id].textContent = my_symbol
	socket.send(JSON.stringify({ "purpose": "i_play", "data": { "pos": id } }))
	my_turn = !my_turn;
	checkGameEnd()

}

function checkWinner() {
	const cells = document.querySelectorAll('.cell');
	const winningCombinations = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8], // Rows
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8], // Columns
		[0, 4, 8],
		[2, 4, 6] // Diagonals
	];
	for (const combo of winningCombinations)
		if (cells[combo[0]].textContent && cells[combo[0]].textContent == cells[combo[1]].textContent && cells[combo[0]].textContent == cells[combo[2]].textContent)
			return cells[combo[0]].textContent;
	for (var i in cells)
		if (cells[i].textContent == "")
			return false;
	return "-";
}

function checkGameEnd() {
	if (checkWinner()) {
		document.querySelector('.result').style.display = "block";
		document.querySelector('.board').style.opacity = "0.5";
		if (checkWinner() == my_symbol)
			document.querySelector('.result').innerHTML = "YOU WON"
		else if (checkWinner() == "-")
			document.querySelector('.result').innerHTML = "its a draw"
		else
			document.querySelector('.result').innerHTML = "YOU LOST LOOOSER"
		socket.close();
		document.querySelector('.start_buttom').innerHTML = "another game"
		document.querySelector('.start_buttom').style.display = "block"
	}
}