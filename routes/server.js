var express = require("express")
var router = express.Router();

var games = require("../games.json").games

router.get("/query", (req, res) => {
	console.log("query")
	if (req.query.all == "true") {
		console.log("all")
		res.send(games)
	} else {
		console.log("search")
		let queriedGames = []
		for (var i = 0; i < games.length; i++) {
			var game = games[i]
			let find = req.query.q
			console.log(game)
			console.log(game["name"])
			if (game["name"].indexOf(find) !== -1) {
				queriedGames.push(game)
			}
		}
		res.send(queriedGames)
	}
})

router.get("/", (req, res) => {
	res.end("hello this is the server speaking how may i help you")
})

module.exports = router;