async function createCustomObjects() {
    requirejs(["./js/customObjects/slidingDoor/init.js", "./js/customObjects/button/init.js", "./js/customObjects/item/init.js","./js/customObjects/buildingPlatform/init.js"], function(...modules) {
        for(var i = 0; i < modules.length; i++) {
            var util = modules[i]
            startScripts.push(util[0])
            updateScripts.push(util[1])
            customTypes.push(util[2])
        }
        updateScriptsLoaded = true
        startScriptsLoaded = true
        customTypesLoaded = true
        console.log("loaded")
    } )
}
createCustomObjects()