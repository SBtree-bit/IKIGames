import * as THREE from 'three';
import setupPhysicsWorld from './js/setupPhysicsWorld.js'
import setupGraphics from './js/setupGraphics.js'
import createBackground from './js/createBackground.js';
import createPlayer from './js/createPlayer.js';
import createLevel from './js/createLevel.js';
import setupEventHandlers from './js/setupEventHandlers.js';
import setupConsole from './js/console.js';
import initMultiplayer from './js/initMultiplayer.js';
import getControls from './js/gamepad.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import loadModels from './js/loadAnims.js';
import { CompressedTextureLoader } from 'three';
import bigBlockTest from './js/bigBlockTest.js'

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
var prevOutput;
let moveDirection = { left: 0, right: 0, forward: 0, back: 0, up: 0, down: 0, stop: false, hidePlayer: false }
var mixer, animations, activeAction, modelReady, animationActions;
const STATE = { DISABLE_DEACTIVATION: 4 }

//Ammojs Initialization
Ammo().then(start)

function renderFrame() {
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

    //player.rotation.y = fpCamera.rotation.y
    player.children[0].rotation.copy(fpCamera.rotation)
    /*player.children[0].rotation.x = 0;
    player.children[0].rotation.z = 0;
    
    /*camera.position.x = player.position.x;
    camera.position.y = player.position.y;
    camera.position.z = player.position.z - 1;
    player.rotation.set(camera.rotation);*/
    //player.rotation.set(fpCamera.rotation)
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
    tpCamera.position.x += direction.x;
    tpCamera.position.y += direction.y;
    tpCamera.position.z += direction.z;
    tpCamera.lookAt(fpCamera.position)
    renderer.render(scene, camera);
    socket.emit("update position", { x: player.position.x, y: player.position.y, z: player.position.z })
    socket.emit("get players")
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
}

async function start() {
    //code goes here
    tmpTrans = new Ammo.btTransform();
    physicsWorld = setupPhysicsWorld();
    commands = setupConsole();
    socket = initMultiplayer(async function (players) {
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
    });
    ({ clock, scene, camera, renderer, stats, fpCamera, tpCamera } = setupGraphics());
    createBackground(scene);
    ({ player, controls, mixer, animations, activeAction, modelReady, animationActions } = await createPlayer(scene, physicsWorld, fpCamera, STATE, rigidBodies, renderer, loadModels))
    createLevel(scene, physicsWorld)
    //createJointObjects()
    setupEventHandlers(moveDirection, cameraOBJ, fpCamera, tpCamera, animations, activeAction, animationActions, mixer)
    renderFrame()
    document.querySelector(".loader").style.animation = "fadeOut 1s";
    document.querySelector(".loader").addEventListener("animationend", function() {
        document.querySelector(".loader").style.display = "none";
    })
    /*var bigBlock = bigBlockTest(Ammo, scene, physicsWorld);
    rigidBodies.push(bigBlock);*/
    //({ animationActions, mixer, activeAction, modelReady } = await loadModels("models/player/AJ.fbx", ["models/player/AJ@idle.fbx"]))
}

function moveBall() {
    let physicsBody = player.userData.physicsBody;
    detectCollision();

    if (moveDirection.stop) {
        physicsBody.setLinearVelocity(new Ammo.btVector3(0, 0, 0))
    } else {
        let scalingFactor = 20;

        let moveY = moveDirection.up - moveDirection.down;
        let moveZ = moveDirection.forward - moveDirection.back;
        let moveX = moveDirection.left - moveDirection.right;

        if (moveY == 0 && moveZ == 0 && moveX == 0) return;

        /*if (moveY == 1) {
            console.log(1)
            //animations.midJump(activeAction, animationActions)
        }

        let resultantImpulse = new Ammo.btVector3(0, moveY, 0)
        resultantImpulse.op_mul(20);
        physicsBody.setLinearVelocity(resultantImpulse);*/
        //if (animationState == "run" && moveZ < 1) {activeAction.stop(); animations.run(activeAction, animationActions); animationState = "idle";} 
        if (moveZ == 0 && moveX == 0) { return };
        //activeAction.stop()
        //if(animationState != "run" && moveZ > 0) {activeAction = animations.run(activeAction, animationActions); animationState = "run"}
        var direction = new THREE.Vector3()
        //player.rotation.y = 100
        camera.getWorldDirection(direction)
        direction = direction.multiplyScalar(moveZ)
        var velocity = player.userData.physicsBody.getLinearVelocity()
        //player.userData.physicsBody.setGravity(new Ammo.btVector3(0, 0, 0))
        velocity = new Ammo.btVector3(direction.x + velocity.x(), direction.y + velocity.y(), direction.z + velocity.z())
        player.userData.physicsBody.setLinearVelocity(velocity.op_mul(0.5))
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

        let userData0 = threeObject0 ? threeObject0.userData : null;
        let userData1 = threeObject1 ? threeObject1.userData : null

        let tag0 = userData0 ? userData0.tag : "none";
        let tag1 = userData1 ? userData1.tag : "none";
        let numContacts = contactManifold.getNumContacts();

        for (let j = 0; j < numContacts; j++) {
            let contactPoint = contactManifold.getContactPoint(j);
            let distance = contactPoint.getDistance();

            //if (distance > 0.0) continue;
            let velocity0 = rb0.getLinearVelocity();
            let velocity1 = rb1.getLinearVelocity();

            let worldPos0 = contactPoint.get_m_positionWorldOnA();
            let worldPos1 = contactPoint.get_m_positionWorldOnB();

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