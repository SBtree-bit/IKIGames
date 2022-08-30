var express = require("express")
var router = express.Router();

var games = require("../games.json")

router.get("/query", (req, res) => {
	res.send("hello you have made a query")
	res.send(req.query)
	if (req.query.all = "true") {
		res.end(games)
	} else {
		let queriedGames = []
		for (var i of Object.keys(games)) {
			let find = req.query.q
			if (s.indexOf(find, find.length)) {
				queriedGames.push(games[i])
			}
		}
		res.end(queriedGames)
	}
})

router.get("/", (req, res) => {
	res.end("hello this is the server speaking how may i help you")
})

module.exports = router;