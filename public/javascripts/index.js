(async function() {
	var gameTemplate = document.querySelector("#game")
	var res = await fetch("/server/query?all=true")
	console.log(res[0])
})()