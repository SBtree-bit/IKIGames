var express = require("express")
var router = express.Router();

var games = require("../games.json")

router.get("/query", (req, res) => {
	if (req.query.all = "true") {
		res.end(games)
	} else {
		let queriedGames = 
		for (var i of Object.keys(games)) {
			let find = req.query.q
			if (s.indexOf(find, find.length)) {
				queriedGames[i] = games[i]
			}
		}
		res.end(queriedGames)
	}
})

module.exports = router;