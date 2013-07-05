/// <reference path="jquery-2.0.2.js" />
var ui = (function () {

	function buildLoginForm() {
		var html =
            '<div id="login-form-holder">' +
				'<form>' +
					'<div id="login-form">' +
						'<label for="tb-login-username">Username: </label>' +
						'<input type="text" id="tb-login-username"><br />' +
						'<label for="tb-login-password">Password: </label>' +
						'<input type="password" id="tb-login-password"><br />' +
						'<button id="btn-login" class="button">Login</button>' +
					'</div>' +
					'<div id="register-form" style="display: none">' +
						'<label for="tb-register-username">Username: </label>' +
						'<input type="text" id="tb-register-username"><br />' +
						'<label for="tb-register-nickname">Nickname: </label>' +
						'<input type="text" id="tb-register-nickname"><br />' +
						'<label for="tb-register-password">Password: </label>' +
						'<input type="password" id="tb-register-password"><br />' +
						'<button id="btn-register" class="button">Register</button>' +
					'</div>' +
					'<a href="#" id="btn-show-login" class="button selected">Login</a>' +
					'<a href="#" id="btn-show-register" class="button">Register</a>' +
				'</form>' +
            '</div>';
		return html;
	}

	function buildGameUI(nickname) {
		var html = '<span id="user-nickname">' +
				nickname +
		'</span>' +
		'<button id="btn-logout">Logout</button><br/>' +
		'<div id="create-game-holder">' +
			'Title: <input type="text" id="tb-create-title" />' +
			'Password: <input type="text" id="tb-create-pass" />' +
			'<button id="btn-create-game">Create</button>' +
            '<div class="error-game-create"></div>'+
		'</div>' +
		'<div id="open-games-container">' +
			'<h2>Open</h2>' +
			'<div id="open-games"></div>' +
		'</div>' +
		'<div id="active-games-container">' +
			'<h2>Active</h2>' +
			'<div id="active-games"></div>' +
		'</div>' +
		'<div id="game-holder">' +
		'</div>';
		return html;
	}

	function buildOpenGamesList(games) {
		var list = '<ul class="game-list open-games">';
		for (var i = 0; i < games.length; i++) {
			var game = games[i];
			list +=
				'<li data-game-id="' + game.id + '">' +
					'<a href="#" >' +
						$("<div />").html(game.title).text() +
					'</a>' +
					'<span> by ' +
						game.creator +
					'</span>' +
				'</li>';
		}
		list += "</ul>";
		return list;
	}

	function buildMessageList(messages) {
	    var list = '<h1>Messages</h1> <ul class="game-list open-games">';
	    for (var i = 0; i < messages.length; i++) {
	        var message = messages[i];
           // console.log(message)
	        list +=
				'<li data-game-message-id="' + message.gameId + '">' +
					'<div  >' +
						message.text +
					'</div>' +
					'<span>  ' +
						message.type +
					'</span>' +
				'</li>';
	    }
	    list += "</ul>";
	    return list;
	}

	function buildActiveGamesList(games) {
		var gamesList = Array.prototype.slice.call(games, 0);
		gamesList.sort(function (g1, g2) {
			if (g1.status == g2.status) {
				return g1.title > g2.title;
			}
			else
			{
				if (g1.status == "in-progress") {
					return -1;
				}
			}
			return 1;
		});

		var list = '<ul class="game-list active-games">';
		for (var i = 0; i < gamesList.length; i++) {
			var game = gamesList[i];
			list +=
				'<li data-game-id="' + game.id + '">' +
					'<a href="#" class="' + game.status + '">' +
						$("<div />").html(game.title).text() +
					'</a>' +
					'<span> by ' +
						game.creator +
					'</span>' +
				'</li>';
		}
		list += "</ul>";
		return list;
	}

	function buildGuessTable(guesses) {
		var tableHtml =
			'<table border="1" cellspacing="0" cellpadding="5">' +
				'<tr>' +
					'<th>Number</th>' +
					'<th>Cows</th>' +
					'<th>Bulls</th>' +
				'</tr>';
		for (var i = 0; i < guesses.length; i++) {
			var guess = guesses[i];
			tableHtml +=
				'<tr>' +
					'<td>' +
						guess.number +
					'</td>' +
					'<td>' +
						guess.cows+
					'</td>' +
					'<td>' +
						guess.bulls+
					'</td>' +
				'</tr>';
		}
		tableHtml += '</table>';
		return tableHtml;
	}

	function makeEmptyTable() {
	    var tableData = $("<table />");
	    for (var row = 0; row < 9; row++) {
	        var tr = $("<tr/>");
	        for (var column = 0; column < 9; column++) {
                var td = $("<td/>").attr("id", row + "-" + column)
                tr.append(td)
	        }
            tableData.append(tr)
	    }
        console.log(tableData.html())
        return tableData.html()
	}

	function fillEmptyTable( gameState) {
	    var blueUnits = gameState.blue.units;
	    var redUnits = gameState.red.units;

	    for (var index = 0; index < blueUnits.length; index++) {
	        var unitId = blueUnits[index].id;
	        var positionInTD = blueUnits[index].position.x + "-" + blueUnits[index].position.y;
	        var unitType = blueUnits[index].type == "warrior" ? "w" : "r"
	        console.log("#" + positionInTD)
	        $("#" + positionInTD).attr("data-unit-id", unitId);
	        console.log()
	        
	        $("#" + positionInTD).text(unitType).addClass(blueUnits[index].type + "-blue")
	    }

	    for (var index = 0; index < blueUnits.length; index++) {
	        var unitIdRed = redUnits[index].id;
	        var positionInTDRed = redUnits[index].position.x + "-" + redUnits[index].position.y;
	        var unitTypeRed = redUnits[index].type == "warrior" ? "w" : "r"
	        $( "#" + positionInTDRed).attr("data-unit-id", unitIdRed);
	        $(" #" + positionInTDRed).text(unitTypeRed).addClass(blueUnits[index].type+"-red")
	    }

	    console.log(blueUnits)
	    console.log(redUnits)
	}

	function buildGameState(gameState) {

	    var userInturn = gameState.inTurn == "blue" ? gameState.blue.nickname : gameState.red.nickname;
	    var emptyTable = makeEmptyTable();
        console.log()
		var html =
			'<div id="game-state" data-game-id="' + gameState.gameId + '">' +
				'<h2>' + gameState.title + " " + userInturn +"'s turn"+ '</h2>' +
				'<div  class="guess-holder">' +
					'<h3>' +
					    '<span id="blue-guesses">' +	gameState.blue.nickname +'</span>'+ ' VS '+  '<span id="red-guesses">' +
                        gameState.red.nickname +'</span>' +
					'</h3>'+
				'</div>' +
				
                '<div id="player-in-turn-' + gameState.inTurn + '">' + 
        '</div>' +
            '<div id="game-commands">' + 
                '<button id="btn-move-unit">Move inputs</button>' + 
                '<button id="btn-attack-unit">Attack inputs</button>' +
                '<button id="btn-defend-unit">Defend inputs</button>' +
            '</div>' +
            '<div id="command-inputs">' + '</div>' +
          '<table id="field">' + emptyTable + '</table>' +

            '<div id="error-block">' + '</div>'
		'</div>';
		return html;
	}

	function moveInputs() {

	    var html = '<label>Target Position (1-1):</label>' +
                    '<input type="text" value="" id="target-to-move" />'+
                    '<br />'+
                    '<label> Postion to move</label>'+
                    '<input type="text" value="" id="position-to-move" />' +
                    '<button id="btn-move-command">Move</button>'


	    return html;
	}

	function defendInputs() {

	    var html = '<label>Defend Position (1-1):</label>' +
                    '<input type="text" value="" id="target-to-defend" />' +
                    '<button id="btn-defend-command">Defend</button>'
	        ;
                    
	    return html;
	}

	function attackInputs() {

	    var html = '<label>Target Position (1-1):</label>' +
                    '<input type="text" value="" id="target-to-attack" />' +
                    '<br />' +
                    '<label> Postion to attack</label>' +
                    '<input type="text" value="" id="position-to-attack" />'  +
                    
                '<button id="btn-attack-command">Attack</button>'

	    return html;
	}

	return {
		gameUI: buildGameUI,
		openGamesList: buildOpenGamesList,
		loginForm: buildLoginForm,
		activeGamesList: buildActiveGamesList,
		showMessages:buildMessageList,
		gameState: buildGameState,
		fillEmptyTable: fillEmptyTable,
		moveInputs: moveInputs,
		defendInputs: defendInputs,
        attackInputs: attackInputs
	}

}());