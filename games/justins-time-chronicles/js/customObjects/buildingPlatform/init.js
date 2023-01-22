function initPlatform() {
    console.log("platform init")
    customObjects.platforms.update = updatePlatform
    return [initPlatformImport, updatePlatform, "platform"]
}
function updatePlatform(object, scene, THREE) {

}
async function initPlatformImport(customObjects, Ammo, physicsWorld, rigidBodies, kinematicBodies, scene, THREE, GLTFLoader, pos, props) {
    let loader = new GLTFLoader()
    let object = (await loader.loadAsync("./js/customObjects/buildingPlatform/platform.glb")).scene.children[2]
    object.position.copy(pos)
    object.userData.built = []
    scene.add(object)
    object.addEventListener("clicked", async () => {
        if (!inventory.mainItems.other) return
        let item = inventory.mainItems.other
        console.log(item.type.name)
        let itemTrue = false
        switch(item.type.name) {
            case "Speedometer":
                let object1 = (await loader.loadAsync("./js/customObjects/buildingPlatform/speedometer.glb")).scene
                object1.position.y = 2.5
                object.add(object1)
                itemTrue = true
        }
        if (!itemTrue) return
        object.userData.built.push(item.name)
        inventory.mainItems.other = undefined
    })
    customObjects.platforms.objects.push(object)
}
define(initPlatform)