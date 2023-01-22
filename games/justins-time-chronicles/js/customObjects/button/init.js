function initButton() {
    console.log("button init")
    customObjects.buttons.update = updateButton
    return [initButtonImport, updateButton, "button"]
}
function updateButton(object, scene, THREE) {

}
async function initButtonImport(customObjects, Ammo, physicsWorld, rigidBodies, kinematicBodies, scene, THREE, GLTFLoader, pos, props) {
    function sleep(milliseconds) {
        const date = Date.now();
        let currentDate = null;
        do {
            currentDate = Date.now();
        } while (currentDate - date < milliseconds);
    }
    const geometry = new THREE.CylinderGeometry(0.25, 0.25, 0.25);
    const material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
    const object = new THREE.Mesh( geometry, material );
    scene.add(object)
    object.position.x = pos.x
    object.position.z = pos.z
    object.position.y = pos.y
    console.trace("hello")
    console.log("PROPS")
    console.log(props)
    object.addEventListener("clicked", () => {
        object.material.color.set( 0x00ff00 )
        customObjects.slidingDoors.objects[props.linkedTo].userData.active = true
        customObjects.slidingDoors.objects[props.linkedTo + 1].userData.active = true
    })
    console.log("button init - import")
    customObjects.buttons.objects.push(object)
}
define(initButton)