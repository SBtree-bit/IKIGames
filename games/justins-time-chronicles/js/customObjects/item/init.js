function initItem() {
    console.log("item init")
    customObjects.items.update = updateItem
    return [initItemImport, updateItem, "item"]
}
function updateItem(object, scene, THREE) {
    //object.rotation.y += 0.1
}
async function initItemImport(customObjects, Ammo, physicsWorld, rigidBodies, kinematicBodies, scene, THREE, GLTFLoader, pos, props) {
    let types = {
        "air": { "name": "", "tooltip": "", "maxStackSize": 1, "category": "any", "model": "2023_Snowman.glb"},
        "button": { "name": "Button", "tooltip": "Button\nA button you press", "icon": "./models/items/speedometer.jpeg", "model": "2023_Snowman.glb" },
        "speedometer": {"name": "Speedometer", "tooltip": "A perfect item for measuring speed!", "icon": "./models/items/speedometer.jpeg", "model": "2023_Snowman.glb"}
    }
    let loader = new GLTFLoader()
    let object = await loader.loadAsync("./js/customObjects/item/" + types[props.item].model)
    object = object.scene
    console.log(pos)
    object.position.copy(pos)
    object.scale.setScalar(0.1)
    const geometry = new THREE.BoxGeometry(0.5, 2, 0.5);
    const material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
    const hitbox = new THREE.Mesh( geometry, material );
    hitbox.position.copy(object.position)
    hitbox.visible = false
    console.log("item init - import")
    customObjects.items.objects.push(object)
    customObjects.all.push(object)
    object.userData.path = "items"
    hitbox.addEventListener("clicked", function() {
        console.log("Item picked")
        if (inventory.mainItems.other) {
            for(let i = 0; i < inventory.slotObj.other.length; i++) {
                if (!inventory.slotObj.other[i]) {
                    inventory.slotObj.other[i] = new ItemStack(types[props.item])
                    break
                }
            }
        } else {
            inventory.mainItems.other = new ItemStack(types[props.item])
        }
        scene.remove(this)
        scene.remove(customObjects.items.objects[this.userData.hitOBJ])
        customObjects.items.objects[this.userData.hitOBJ] = null
        customObjects.all[this.userData.globalOBJ] = null
    })
    hitbox.userData.hitOBJ = customObjects.items.objects.length - 1
    hitbox.userData.globalOBJ = customObjects.all.length - 1
    scene.add(hitbox)
    scene.add(object)
}
define(["js/createInventoryRequire"],initItem)