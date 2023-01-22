import * as THREE from 'three';
import setupPhysicsWorld from './js/setupPhysicsWorld.js'
import setupGraphics from './js/setupGraphics.js'
import createBackground from './js/createBackground.js';
import createPlayer from './js/createPlayer.js';
import createLevel from './js/createLevel.js';
import setupEventHandlers from './js/setupEventHandlers.js';
import setupConsole from './js/console.js';
import initMultiplayer from './js/initMultiplayer.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import loadModels from './js/loadAnims.js';
import { CompressedTextureLoader } from 'three';
import bigBlockTest from './js/bigBlockTest.js'
import * as INVENTORY from "./js/createInventory.js";

//setTimeout(() => location.replace("https://www.youtube.com/watch?v=V1rsERJC7GI"), 10000)


//variable declaration
let physicsWorld, scene, stats, fpCamera, tpCamera, cameraOBJ = { current: undefined, set: false }, camera, renderer, controls, clock, rigidBodies = [], tmpTrans;
let colGroupPlane = 1, colGroupRedBall = 2, colGroupGreenBall = 4;
let player;
let commands;
let animationState = "idle"
let socket;
let multiPlayers = {
    sockets: [],
    threeOBJs: []
};
var kinematicBodies = []
var prevOutput;
let moveDirection = { left: 0, right: 0, forward: 0, back: 0, up: 0, down: 0, stop: false, hidePlayer: false }
var mixer, animations, activeAction, modelReady, animationActions;
const STATE = { DISABLE_DEACTIVATION: 4 }
var updateAnimations = false
let root = document.documentElement;

root.addEventListener("mousemove", e => {
    root.style.setProperty('--mouse-x', e.clientX + "px");
    root.style.setProperty('--mouse-y', e.clientY + "px");
});


//Ammojs Initialization
Ammo().then(start)
const raycaster = new THREE.Raycaster();

var cards = document.getElementsByClassName("card")
for (var i = 0; i < cards.length; i++) {
    cards[i].onclick = function () {
        inventoryState = "items"
        switch (this.classList[1]) {
            case "card-a":
                inventoryCategory = "other"
                break
            case "card-b":
                inventoryCategory = "attack"
                break
            case "card-c":
                inventoryCategory = "defense"
                break
            case "card-d":
                inventoryCategory = "headgear"
                break
            case "card-e":
                inventoryCategory = "crates"
                break
            case "card-f":
                inventoryCategory = "food"
                break
            case "card-g":
                inventoryCategory = "currency"
                break
            case "card-h":
                inventoryCategory = "materials"
                break
        }
        console.log("clicked")
    }
    console.log(cards[i])
}

var slots = document.getElementsByClassName("slot")
document.getElementById("floating").ondragstart = () => { return false }
for (var i = 0; i < slots.length; i++) {
    slots[i].children[0].ondragstart = () => { return false }
    slots[i].onmousedown = function () {
        console.log("floater")
        var floater = document.getElementById("floating")
        floater.src = this.children[0].src
        floater.style.display = "inline"
        if (this.id != "slotMain") {
            let arr_val = parseInt(this.id.replace("slot", "")) - 1
            takenItem = inventory.slotObj[inventoryCategory][arr_val]
            takenFrom = arr_val
            inventory.slotObj[inventoryCategory][arr_val] = undefined
        } else {
            takenItem = inventory.mainItems[inventoryCategory]
            takenFrom = "main"
            inventory.mainItems[inventoryCategory] = undefined
        }
    }
    slots[i].onmouseup = function () {
        if (!this.id == "slotMain") {
            let arr_val = parseInt(this.id.replace("slot", "")) - 1
            inventory.slotObj[inventoryCategory][arr_val] = takenItem
        } else {
            inventory.mainItems[inventoryCategory] = takenItem
        }
        takenItem = undefined
        takenFrom = undefined
        return false
    }
}

function handleInventory() {
    let itemsInCategory = inventory.slotObj[inventoryCategory]
    for (var i = 0; i < 5; i++) {
        let slot = document.getElementById("slot" + (i + 1))
        if (itemsInCategory[i]) {
            slot.children[0].src = itemsInCategory[i].type.icon
            console.log(itemsInCategory[i].type)
            slot.className = "slot down"
            if (slot.dataset.has_spacer) continue
            let spacerElement = document.createElement("div")
            spacerElement.className = "spacer"
            slot.after(spacerElement)
            slot.dataset.has_spacer = "1"
        } else {
            slot.children[0].src = /*"./models/items/empty.png"*/ ""
            slot.className = "slot"
            if (slot.dataset.has_spacer) {
                let index = Array.from(slot.parentElement.children).indexOf(slot);
                slot.parentElement.children[index + 1].remove()
                slot.dataset.has_spacer = ""
            }
        }
    }
    let slot = document.getElementById("slotMain")
    if (inventory.mainItems[inventoryCategory]) {
        slot.children[0].src = inventory.mainItems[inventoryCategory].type.icon
        slot.className = "slot down"
        if (slot.dataset.has_spacer) return
        let spacerElement = document.createElement("div")
        spacerElement.className = "spacer"
        slot.after(spacerElement)
        slot.dataset.has_spacer = "1"
    } else {
        slot.children[0].src = /*"./models/items/empty.png"*/ ""
        slot.className = "slot"
        if (slot.dataset.has_spacer) {
            let index = Array.from(slot.parentElement.children).indexOf(slot);
            slot.parentElement.children[index + 1].remove()
            slot.dataset.has_spacer = ""
        }
    }
}

let wasStopped = false

function renderFrame() {
    if (inventoryState == "categories") {
        document.getElementsByClassName('layout')[0].style.display = 'grid'
        document.getElementById("mobileUIFooter").style.display = 'none'
        document.getElementById("game").style.display = 'none'
        document.getElementById("containedInventory").style.display = 'none'
        document.getElementById("hotbar").style.display = "none"
        controls.unlock()
        moveDirection.stop = true
        wasStopped = true
    } else if (inventoryState == "disabled") {
        document.getElementById("mobileUIFooter").style.display = 'block'
        document.getElementById("game").style.display = 'inline'
        document.getElementsByClassName('layout')[0].style.display = 'none'
        document.getElementById("containedInventory").style.display = 'none'
        document.getElementById("hotbar").style.display = "none"
        if (wasStopped) {
            moveDirection.stop = false
            moveDirection.forward = 0
            wasStopped = false
        }
    } else if (inventoryState == "items") {
        handleInventory()
        document.getElementsByClassName('layout')[0].style.display = 'none'
        document.getElementById("mobileUIFooter").style.display = 'none'
        document.getElementById("game").style.display = 'none'
        document.getElementById("containedInventory").style.display = 'block'
        document.getElementById("hotbar").style.display = "none"
        moveDirection.stop = true
        wasStopped = true
    } else if (inventoryState == "hotbar") {
        let categories = [
            "other",
            "attack",
            "defense",
            "headgear",
            "crates",
            "food",
            "currency",
            "materials"
        ]
        for(var i = 0; i < categories.length; i++) {
            if (!inventory.mainItems[categories[i]]) continue
            document.getElementById("hotbar" + (i+1)).children[0].src = inventory.mainItems[categories[i]].type.icon
        }
        if (hotbarSelectedChanged) {
            try {
                document.getElementsByClassName("selected")[0].classList = "hotbar"
                document.getElementById("hotbar" + currentHotbarSelected).classList = "hotbar selected"
            } catch {
                
            }
            hotbarSelectedChanged = false
        }
        document.getElementsByClassName('layout')[0].style.display = 'none'
        document.getElementById("mobileUIFooter").style.display = 'none'
        document.getElementById("game").style.display = 'block'
        document.getElementById("containedInventory").style.display = 'none'
        document.getElementById("hotbar").style.display = "inline"
        if (wasStopped) {
            moveDirection.stop = false
            moveDirection.forward = 0
            wasStopped = false
        }
    }
    var no_item = document.getElementsByClassName("no-item")
    for (var i = 0; i < no_item.length; i++) {
        no_item[i].style.visibility = 'hidden'
    }
    raycaster.setFromCamera(new THREE.Vector2(), camera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children);

    for (let i = 0; i < intersects.length; i++) {
        if (!moveDirection.clicked) continue
        if (intersects[i].distance > 3) continue
        intersects[i].object.dispatchEvent({ type: "clicked" })
    }
    customObjects.all.forEach((item, idx) => {
        if (!item) return
        customObjects[item.userData.path].update(customObjects.all[idx], scene, THREE, physicsWorld)
    })
    player.visible = moveDirection.hidePlayer
    let deltaTime = clock.getDelta();
    moveBall()
    if (cameraOBJ.set) {
        console.log(camera)
        camera = cameraOBJ.current
        cameraOBJ.set = false
    } else {
        cameraOBJ.current = camera;
    }
    var prevZ = player.children[1].quaternion.z
    player.children[1].rotation.copy(fpCamera.rotation)
    player.children[1].rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI)
    player.quaternion.z = 0
    /*player.rotation.y = fpCamera.rotation.y
    player.children[0].rotation.y = fpCamera.rotation.y
    
    /*camera.position.x = player.position.x;
    camera.position.y = player.position.y;
    camera.position.z = player.position.z - 1;
    player.rotation.set(camera.rotation);*/
    //player.children[0].rotation.y = 90
    //controls.target.set(player.position.x, player.position.y, player.position.z)
    var tmpPos = new THREE.Vector3()
    player.getWorldDirection(tmpPos)
    tmpPos = tmpPos.multiplyScalar(3)
    /*camera.position.copy(player.position)
    camera.position.x -= tmpPos.x;
    camera.position.y -= tmpPos.y - 3;
    camera.position.z -= tmpPos.z;
    camera.lookAt(player)*/
    //controls.update()
    updatePhysics(deltaTime);
    stats.update();
    fpCamera.position.copy(player.position)
    var direction = new THREE.Vector3()
    fpCamera.getWorldDirection(direction)
    direction = direction.multiplyScalar(3)
    tpCamera.position.set(fpCamera.position.x, fpCamera.position.y, fpCamera.position.z)
    tpCamera.position.x -= direction.x;
    tpCamera.position.y -= direction.y;
    tpCamera.position.z -= direction.z;
    tpCamera.lookAt(fpCamera.position)
    renderer.render(scene, camera);
    //socket.emit("update position", { x: player.position.x, y: player.position.y, z: player.position.z })
    //socket.emit("get players")
    mixer.update(deltaTime)

    requestAnimationFrame(renderFrame);
}

function updatePhysics(deltaTime) {
    physicsWorld.stepSimulation(deltaTime, 10);

    for (let i = 0; i < rigidBodies.length; i++) {
        let objThree = rigidBodies[i];
        let objAmmo = objThree.userData.physicsBody;
        let ms = objAmmo.getMotionState();
        if (ms) {
            ms.getWorldTransform(tmpTrans);
            let p = tmpTrans.getOrigin();
            let q = tmpTrans.getRotation();
            objThree.position.set(p.x(), p.y(), p.z());
            objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
        }
        objAmmo.setGravity(0, -10, 0)
    }
    for (let i = 0; i < kinematicBodies.length; i++) {
        let objThree = kinematicBodies[i];
        let objAmmo = objThree.userData.physicsBody;
        let ms = objAmmo.getMotionState()
        if (ms) {
            var pos = objThree.position
            var tpVector = new Ammo.btVector3(pos.x, pos.y, pos.z)
            var trans = new Ammo.btTransform()
            trans.setIdentity()
            trans.setOrigin(tpVector)
            ms.setWorldTransform(trans)
            ms.getWorldTransform(tmpTrans)
            console.log(tmpTrans.getOrigin().x(), tmpTrans.getOrigin().y(), tmpTrans.getOrigin().z())
        }
    }
}

async function start() {
    //code goes here
    tmpTrans = new Ammo.btTransform();
    physicsWorld = setupPhysicsWorld();
    commands = setupConsole();
    /*socket = initMultiplayer(async function (players) {
        multiPlayers.sockets = players
        for (var i = 0; i < multiPlayers.threeOBJs.length; i++) {
            scene.remove(multiPlayers.threeOBJs[i])
        }
        multiPlayers.threeOBJs = []
        const loader = new GLTFLoader().setPath('models/');
        for (var i = 0; i < multiPlayers.sockets.length; i++) {
            var tmpSocket = multiPlayers.sockets[i]
            var gltf = await loader.loadAsync('player.glb')
            var tempPlayer = gltf.scene
            tempPlayer.position.x = tmpSocket.position.x
            tempPlayer.position.y = tmpSocket.position.y
            tempPlayer.position.z = tmpSocket.position.z;
            multiPlayers.threeOBJs.push(tempPlayer)
            scene.add(tempPlayer);
        }
    });*/
    ({ clock, scene, camera, renderer, stats, fpCamera, tpCamera } = setupGraphics());
    createBackground(scene);
    ({ player, controls, mixer, animations, activeAction, modelReady, animationActions } = await createPlayer(scene, physicsWorld, fpCamera, STATE, rigidBodies, renderer, loadModels))
    while (!customTypesLoaded) {

    }
    createLevel(scene, physicsWorld, renderer, rigidBodies, kinematicBodies, Ammo, customObjects)
    //createJointObjects()
    let ms = player.userData.physicsBody.getMotionState();

    let trans = new Ammo.btTransform();
    ms.getWorldTransform(trans);
    setupEventHandlers(moveDirection, cameraOBJ, fpCamera, tpCamera, trans)
    /*var bigBlock = bigBlockTest(Ammo, scene, physicsWorld);
    rigidBodies.push(bigBlock);*/
    //({ animationActions, mixer, activeAction, modelReady } = await loadModels("models/player/AJ.fbx", ["models/player/AJ@idle.fbx"]))
    createCustomObjects()
    console.log(startScripts)
    /*startScripts.forEach((item) => {
        console.log(item)
        item(customObjects, Ammo, physicsWorld, rigidBodies, kinematicBodies, scene, THREE, GLTFLoader)
    })*/
    console.log(INVENTORY)
    inventory = INVENTORY.createInventory()
    itemTypes = inventory[1]
    inventory = inventory[0]
    console.log(inventory)

    renderFrame()
}

function moveBall() {
    let physicsBody = player.userData.physicsBody;
    detectCollision();

    if (moveDirection.stop) {
        physicsBody.setLinearVelocity(new Ammo.btVector3(0, 0, 0))
    } else {
        let scalingFactor = 20;

        let moveY = (moveDirection.isStillJumping ? 0 : moveDirection.up) - moveDirection.down;
        let moveZ = moveDirection.forward - moveDirection.back;
        let moveX = moveDirection.left - moveDirection.right;

        if ((moveZ >= 1 || moveZ <= -1) && animationState != "run") { animationState = "run"; activeAction = animations.run(activeAction, animationActions); console.log("run") }
        if ((moveZ < 1 && moveZ > -1) && animationState != "idle") { activeAction.stop(); animationState = "idle"; animations.idle(activeAction, animationActions) }
        if (moveY == 0 && moveZ == 0 && moveX == 0) return;

        /*if (moveY == 1) {
            console.log(1)
            //animations.midJump(activeAction, animationActions)
        }*/

        let resultantImpulse = new Ammo.btVector3(0, moveY, 0)
        resultantImpulse.op_mul(scalingFactor);
        physicsBody.setLinearVelocity(resultantImpulse);
        if (Math.round(moveZ) == 0 && Math.round(moveX) == 0) { return };

        var direction = new THREE.Vector3()
        //player.rotation.y = 100
        camera.getWorldDirection(direction)
        direction = direction.multiplyScalar(moveZ)
        var velocity = player.userData.physicsBody.getLinearVelocity()
        player.userData.physicsBody.setGravity(new Ammo.btVector3(0, -500, 0))
        player.userData.physicsBody.setLinearVelocity(new Ammo.btVector3(direction.x + velocity.x(), velocity.y(), direction.z + velocity.z()))
        /*direction.y = 0;
        player.position.add(direction.multiplyScalar(0.1))
        physicsWorld.stepSimulation(clock.getDelta())
        //physicsWorld.removeRigidBody(player.userData.physicsBody)
        console.log(player.userData.physicsBody)
        let ms = player.userData.physicsBody.getMotionState()
        if (ms) {
            var tmpTrans = new Ammo.btTransform()
            ms.getWorldTransform(tmpTrans)
            tmpTrans.setOrigin(new Ammo.btVector3(player.position.x, player.position.y, player.position.z))
            player.userData.physicsBody.setWorldTransform(tmpTrans)
        }
        //physicsWorld.addRigidBody(player.userData.physicsBody)
        physicsWorld.stepSimulation(clock.getDelta())*/

        if (moveX == 0) return;
        camera.rotation.y -= 90
        var direction = new THREE.Vector3()
        //player.rotation.y = 100
        camera.getWorldDirection(direction)
        direction = direction.multiplyScalar(moveX)
        var velocity = player.userData.physicsBody.getLinearVelocity()
        player.userData.physicsBody.setGravity(new Ammo.btVector3(0, -500, 0))
        player.userData.physicsBody.setLinearVelocity(new Ammo.btVector3(direction.x + velocity.x(), velocity.y(), direction.z + velocity.z()))
        camera.rotation.y += 90
    }
}

function detectCollision() {
    let dispatcher = physicsWorld.getDispatcher();
    let numManifolds = dispatcher.getNumManifolds();

    for (let i = 0; i < numManifolds; i++) {
        let contactManifold = dispatcher.getManifoldByIndexInternal(i);
        let rb0 = Ammo.castObject(contactManifold.getBody0(), Ammo.btRigidBody);
        let rb1 = Ammo.castObject(contactManifold.getBody1(), Ammo.btRigidBody);

        let threeObject0 = rb0.threeObject;
        let threeObject1 = rb1.threeObject;

        if (!threeObject0 && !threeObject1) continue;

        /*let ms0 = rb0.getMotionState();
        let ms1 = rb1.getMotionState();

        let trans0 = new Ammo.btTransform();
        ms0.getWorldTransform(trans0);
        let trans1 = new Ammo.btTransform();
        ms1.getWorldTransform(trans1);
        let pos0 = trans0.getOrigin();
        let pos1 = trans1.getOrigin();

        let userData0 = threeObject0 ? threeObject0.userData : null;
        let userData1 = threeObject1 ? threeObject1.userData : null

        let tag0 = userData0 ? userData0.tag : "none";
        let tag1 = userData1 ? userData1.tag : "none";
        if (tag0 == "player") {
            if (pos0.y() > pos1.y()) moveDirection.isStillJumping = false;
            if (pos0.y() < pos1.y()) moveDirection.isStillJumping = true;
            console.log(moveDirection.isStillJumping)
            console.log(threeObject1)
            console.log(threeObject0)
            console.log("player:" + pos0.y())
            console.log("level:" + pos1.y())
        } else if (tag0 == "level") {
            if (pos1.y() > pos0.y()) moveDirection.isStillJumping = false;
            if (pos1.y() < pos0.y()) moveDirection.isStillJumping = true;
            console.log(moveDirection.isStillJumping)
            console.log(threeObject1)
            console.log(threeObject0)
            console.log("level:" + pos0.y())
            console.log("player:" + pos1.y())
        }*/
        let numContacts = contactManifold.getNumContacts();

        for (let j = 0; j < numContacts; j++) {
            let contactPoint = contactManifold.getContactPoint(j);
            let distance = contactPoint.getDistance();

            //if (distance > 0.0) continue;
            let velocity0 = rb0.getLinearVelocity();
            let velocity1 = rb1.getLinearVelocity();

            let worldPos0 = contactPoint.get_m_positionWorldOnA();
            let worldPos1 = contactPoint.get_m_positionWorldOnB();

            if (velocity0.y() < 1 && velocity0.y() > -1) moveDirection.isStillJumping = false

            let stopVector = new Ammo.btVector3(0, -20, 0)
            rb0.setLinearVelocity(new Ammo.btVector3(0, 0, 0))
            rb1.setLinearVelocity(new Ammo.btVector3(0, 0, 0))
            rb0.applyImpulse(stopVector, stopVector)
            rb1.applyImpulse(stopVector, stopVector)

            let localPos0 = contactPoint.get_m_localPointA();
            let localPos1 = contactPoint.get_m_localPointB();
            /*console.log({
                manifoldIndex: i,
                contactIndex: j,
                distance,
                object0: {
                    tag: tag0,
                    velocity: { x: velocity0.x(), y: velocity0.y(), z: velocity0.z() },
                    worldPos: { x: worldPos0.x(), y: worldPos0.y(), z: worldPos0.z() },
                    localPos: { x: localPos0.x(), y: localPos0.y(), z: localPos0.z() }
                },
                object1: {
                    tag: tag1,
                    velocity: { x: velocity1.x(), y: velocity1.y(), z: velocity1.z() },
                    worldPos: { x: worldPos1.x(), y: worldPos1.y(), z: worldPos1.z() },
                    localPos: { x: localPos1.x(), y: localPos1.y(), z: localPos1.z() }
                }
            })*/
        }
    }
}