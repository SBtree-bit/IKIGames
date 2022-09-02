var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/index', function(req, res, next) {
	res.send(`<!DOCTYPE html>
		<html>
			<head>
				<meta charset="utf-8">
			</head>
			<body>
				<script>
					try {
						location.redirect("/")
					}
					catch {
						location.replace("/")
					}
				</script>
			</body>
		</html>`)
})

module.exports = router;
