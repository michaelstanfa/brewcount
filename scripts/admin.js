const changeThisLine = (gameId, idToChange, line, side) => {

	let game = thisWeek.games.filter(g => g.id == gameId);
	$("#" + idToChange).val(-line);

	if(side=='away') {
		game[0].awayLine = line / 1;
		game[0].homeLine = -line / 1;
	} else {
		game[0].awayLine = -line / 1;
		game[0].homeLine = line / 1;
	}

}

const loadUsers = async () => {

	let week = $("#select_week_dropdown_admin").val();

	fs = firebase.firestore();

	let users = fs.collection('users');

	let usersTable = TABLE_OPEN;

	usersTable += "<tr><th>Name<th>Email</th><th>Admin</th><th>Pick 1</th><th>Pick 2</th><th>Pick 3</th></tr>";

	users.get().then(function(result) {

		$("#lines_or_scores_label").html("Users (" + result.size + ")");
		
		result.forEach(function(u) {
			
			let picks = new Promise(function(resolve, reject) {
				resolve(fetchUserPicksWithIdAndWeek(week, u.id))
			});

			let html = picks.then(result => {

				if(undefined != result) {
					
					usersTable += TR_OPEN +
					TD_OPEN + u.data().name + TD_CLOSE +
					TD_OPEN + u.data().email + TD_CLOSE +
					TD_OPEN + u.data().admin + TD_CLOSE +
					TD_OPEN + getProperAbbr(result.pick_1.team) + " " + result.pick_1.line + TD_CLOSE +
					TD_OPEN + getProperAbbr(result.pick_2.team) + " " + result.pick_2.line + TD_CLOSE +
					TD_OPEN + getProperAbbr(result.pick_3.team) + " " + result.pick_3.line +  TD_CLOSE +
					TR_CLOSE
				} else {
					usersTable += TR_OPEN +
					TD_OPEN + u.data().name + TD_CLOSE +
					TD_OPEN + u.data().email + TD_CLOSE +
					TD_OPEN + u.data().admin + TD_CLOSE +
					TD_OPEN + "NO PICK" + TD_CLOSE +
					TD_OPEN + "NO PICK" + TD_CLOSE +
					TD_OPEN + "NO PICK" + TD_CLOSE +
					TR_CLOSE
				}
				return usersTable;
			})
			html.then(result => {
				$("#admin_see_users").html(usersTable + TABLE_CLOSE);
			});
		});
	});
}

const setScores = () => {
	let scores = [ ...$(".score")];

	let allIds = new Set();

	scores.forEach(s => {
		allIds.add(s.getAttribute("gameId"));
	});

	let pushScoreUpdate = [];

	let data = {};

	allIds.forEach(id => {
		let idScores = scores.filter(s => s.getAttribute("gameId") == id);
		let away = idScores.filter(s => s.getAttribute('homeaway') == "AWAY");
		let home = idScores.filter(s => s.getAttribute('homeaway') == "HOME");
		let final = $("#" + id + "_final");
		

		data[id] = {
			final: final[0].checked,
			away_team: {
				score: away[0].value
			},
			home_team: {
				score: home[0].value
			}
		}

	})

	let fs = firebase.firestore();	
	
	let linesCollection = fs.collection('lines');
	
	let year = linesCollection.doc('202021');

	let week = year.collection('week');

	let weekX = week.doc($("#select_week_dropdown_admin").val());



	weekX.get().then(function(doc) {

		for (let [k, v] of Object.entries(doc.data().game)) {

			let gameUpdate = {};
			gameUpdate[`game.${k}.away_team.score`] = data[k].away_team.score;
			weekX.update(gameUpdate);

			gameUpdate[`game.${k}.home_team.score`] = data[k].home_team.score;
			weekX.update(gameUpdate);

			gameUpdate[`game.${k}.final`] = data[k].final;
			weekX.update(gameUpdate);

		}

		alert("Scores updated");
	})


}

const reviewLines = async () => {

	let gameWeek = await getWeekOfGames($("#select_week_dropdown_admin").val());

	let lines = [ ...$(".line")];
	
	let allIds = new Set();

	lines.forEach(l => {
		allIds.add(l.getAttribute("gameId"));

	});
	let pushLineUpdate = [];

	let data = {};
	allIds.forEach(id => {

		let idLines = lines.filter(l => l.getAttribute("gameId") == id);

		let away = idLines.filter(l => l.getAttribute('homeaway') == "AWAY");
		let home = idLines.filter(l => l.getAttribute('homeaway') == "HOME")

		let scheduleGame = gameWeek.filter(w => w.id == id);
		data[id] = {
			date: scheduleGame[0].date,
			time: scheduleGame[0].time,
			final: false,
			away_team: {
				line: away[0].value,
				name: away[0].getAttribute('nickname'),
				score: 0,
				abbr: away[0].getAttribute('abbr')

			},
			home_team: {
				line: home[0].value,
				name: home[0].getAttribute('nickname'),
				score: 0,
				abbr: home[0].getAttribute('abbr')
			}
		}

	})

	let weekUpdate = {}

	let game = {
		game:data
	}

	weekUpdate[$("#select_week_dropdown_admin").val()] = {
		game :
			data
	}

	let fs = firebase.firestore();
	let linesCollection = fs.collection('lines');
	
	let year = linesCollection.doc('202021');

	let week = year.collection('week');

	let weekX = week.doc($("#select_week_dropdown_admin").val());

	let setDoc = weekX.set(game);

	console.log(game);

	setDoc.then(window.alert("Lines saved"));

}