let my_turn = false;
let my_symbol = "X"
let socket = undefined;

document.querySelector('.name_box').value = ["Mike", "Jack", "Bob", "Adam", "Eve"][Math.floor(Math.random() * 5)];

function ready() {
	if (socket)
		socket.close()
	socket = new WebSocket("ws://" + window.location.hostname);

	document.querySelector(".loading_gif").style.display = "block";
	document.querySelector('.start_button').disabled = true

	socket.addEventListener("message", (event) => {
		msg = JSON.parse(event.data)
		switch (msg['purpose']) {
			case "game_found":
				my_symbol = msg['data']['you_are']
				my_turn = msg['data']['you_are'] == "X"

				document.querySelector(".loading_gif").style.display = "none";
				document.querySelector(".your_stat").style.display = "block"
				document.querySelector('.winLine').style.display = "none";
				document.querySelector('.board').style.opacity = my_turn ? "1" : "0.3";
				document.querySelector('.your_stat').textContent = "You are playing: " + my_symbol
				document.querySelector('.turn_stat').textContent = my_turn ? "Your Turn" : "Opponents Turn"
				document.querySelector('.result').innerHTML = ""
				document.querySelectorAll('.cell').forEach(i => i.textContent = "")

				socket.send(JSON.stringify({
					"purpose": "my_name",
					"data": {
						"name": document.querySelector('.name_box').value
					}
				}))
				break;
			case "my_name":
				document.querySelector(".opponent_stat").style.display = "block"
				document.querySelector(".opponent_stat").textContent = "You Opponent is: " + msg['data']['name']
				break;
			case "i_play":
				my_turn = !my_turn
				document.querySelectorAll(".cell")[msg['data']['pos']].textContent = my_symbol == "X" ? "O" : "X"
				document.querySelector('.board').style.opacity = "1";
				document.querySelector('.turn_stat').textContent = "Your Turn"
				checkGameEnd()
				break;
			case "game_over":
				document.querySelector('.result').innerHTML = "YOU WON, Opponent left match"
				document.querySelector('.start_button').innerHTML = "Another Game"
				document.querySelector('.start_button').disabled = false
				break;
		}
	});
}

function cell_click(id) {
	if (!my_turn)
		return;
	if (document.querySelectorAll(".cell")[id].textContent != "")
		return;
	document.querySelector('.board').style.opacity = "0.3";
	document.querySelectorAll(".cell")[id].textContent = my_symbol
	document.querySelector('.turn_stat').textContent = "Opponents Turn"
	socket.send(JSON.stringify({ "purpose": "i_play", "data": { "pos": id } }))
	my_turn = !my_turn;
	checkGameEnd()
}

function checkWinner() {
	const cells = document.querySelectorAll('.cell');
	const winningCombinations = [
		[0, 1, 2, ["translate(105px, -65px) rotate(90deg)", "200px"]],
		[3, 4, 5, ["translate(105px, 10px) rotate(90deg)", "200px"]],
		[6, 7, 8, ["translate(105px, 85px) rotate(90deg)", "200px"]],
		[0, 3, 6, ["translate(30px, 10px)", "200px"]],
		[1, 4, 7, ["translate(105px, 10px)", "200px"]],
		[2, 5, 8, ["translate(180px, 10px)", "200px"]],
		[0, 4, 8, ["translate(105px, -10px) rotate(-45deg)", "250px"]],
		[2, 4, 6, ["translate(105px, -10px) rotate(45deg)", "250px"]]
	];

	for (const combo of winningCombinations) {
		if (cells[combo[0]].textContent && cells[combo[0]].textContent == cells[combo[1]].textContent && cells[combo[0]].textContent == cells[combo[2]].textContent) {
			document.querySelector('.winLine').style.display = "block"
			document.querySelector('.winLine').style.transform = combo[3][0]
			document.querySelector('.winLine').style.height = combo[3][1]
			return cells[combo[0]].textContent;
		}
	}
	for (let cell of cells)
		if (cell.textContent == "")
			return false;
	return "-";
}

function checkGameEnd() {
	if (!checkWinner())
		return;

	document.querySelector('.board').style.opacity = "0.3";
	document.querySelector('.start_button').innerHTML = "Another Game"
	document.querySelector('.start_button').disabled = false
	let result = document.querySelector('.result')
	var win = checkWinner()
	if (win == my_symbol)
		result.innerHTML = "YOU WON"
	else if (win == "-")
		result.innerHTML = "Its a DRAW"
	else
		result.innerHTML = "YOU LOST"
	socket.close();
}