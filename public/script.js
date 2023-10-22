var my_turn = false;
var my_symbol = "X"
var socket = undefined;

setTimeout(() => {
	ready()
}, 100)

document.querySelector('.name_box').value = ["Mike", "Jack", "Bob", "Adam", "Eve"][Math.floor(Math.random() * 5)];

[".loading-gif", ".opponent", ".you", ".turn_stat", ".winLine"].forEach(item => document.querySelector(item).style.display = "none")
document.querySelector('.result').innerHTML = ""

function ready() {
	if (socket != undefined)
		socket.close()
	socket = new WebSocket("ws://" + window.location.hostname);

	document.querySelector(".loading-gif").style.display = "block";
	document.querySelector('.winLine').style.display = "none";
	[".opponent", ".you", ".turn_stat"].forEach(item => document.querySelector(item).style.display = "none")
	document.querySelector('.result').innerHTML = ""
	document.querySelector('.start_button').disabled = true
	socket.addEventListener("message", (event) => {
		msg = JSON.parse(event.data)
		switch (msg['purpose']) {
			case "game_found":
				document.querySelector(".loading-gif").style.display = "none";
				[".opponent", ".you", ".turn_stat"].forEach(item => document.querySelector(item).style.display = "block")

				document.querySelectorAll('.cell').forEach(i => i.textContent = "")

				my_symbol = msg['data']['you_are']
				my_turn = msg['data']['you_are'] == "X"
				document.querySelector('.you').textContent = "You are playing: " + my_symbol
				document.querySelector('.turn_stat').textContent = my_turn ? "Your Turn" : "Opponents Turn"
				document.querySelector('.board').style.opacity = my_turn ? "1" : "0.3";

				socket.send(JSON.stringify({
					"purpose": "my_name",
					"data": {
						"name": document.querySelector('.name_box').value //Date.now()
					}
				}))
				break;
			case "my_name":
				document.querySelector(".opponent").textContent = "You Opponent is: " + msg['data']['name']
				break;
			case "i_play":
				if (my_symbol == "X")
					document.querySelectorAll(".cell")[msg['data']['pos']].textContent = "O"
				else
					document.querySelectorAll(".cell")[msg['data']['pos']].textContent = "X"
				my_turn = !my_turn
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
	socket.send(JSON.stringify({ "purpose": "i_play", "data": { "pos": id } }))
	my_turn = !my_turn;
	document.querySelector('.turn_stat').textContent = "Opponents Turn"
	checkGameEnd()
}

function checkWinner() {
	const cells = document.querySelectorAll('.cell');
	const winningCombinations = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6]
	];
	const winningCombinationsAns = [
		["translate(105px, -65px) rotate(90deg)", "200px"],
		["translate(105px, 10px) rotate(90deg)", "200px"],
		["translate(105px, 85px) rotate(90deg)", "200px"],
		["translate(30px, 10px)", "200px"],
		["translate(105px, 10px)", "200px"],
		["translate(180px, 10px)", "200px"],
		["translate(105px, -10px) rotate(-45deg)", "250px"],
		["translate(105px, -10px) rotate(45deg)", "250px"]
	]
	// for (const combo of winningCombinations)
	// 	if (cells[combo[0]].textContent && cells[combo[0]].textContent == cells[combo[1]].textContent && cells[combo[0]].textContent == cells[combo[2]].textContent)
	// 		return cells[combo[0]].textContent;
	for (const combo in winningCombinations) {
		if (cells[winningCombinations[combo][0]].textContent && cells[winningCombinations[combo][0]].textContent == cells[winningCombinations[combo][1]].textContent && cells[winningCombinations[combo][0]].textContent == cells[winningCombinations[combo][2]].textContent) {
			document.querySelector('.winLine').style.display = "block"
			document.querySelector('.winLine').style.transform = winningCombinationsAns[combo][0]
			document.querySelector('.winLine').style.height = winningCombinationsAns[combo][1]
			return cells[combo[0]].textContent;
		}
	}
	for (var cell of cells)
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
	var result = document.querySelector('.result')
	if (checkWinner() == my_symbol)
		result.innerHTML = "YOU WON"
	else if (checkWinner() == "-")
		result.innerHTML = "Its a DRAW"
	else
		result.innerHTML = "YOU LOST LOOOSER"
	socket.close();

}