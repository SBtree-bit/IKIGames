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

//variable declaration
let physicsWorld, scene, stats, camera, renderer, controls, clock, rigidBodies = [], tmpTrans;
let colGroupPlane = 1, colGroupRedBall = 2, colGroupGreenBall = 4;
let player;
let commands;
let socket;
let multiPlayers = {
    sockets: [],
    threeOBJs: []
};
let moveDirection = { left: 0, right: 0, forward: 0, back: 0, up: 0, down: 0, stop: false }
const STATE = { DISABLE_DEACTIVATION: 4 }

//Ammojs Initialization
Ammo().then(start)

function renderFrame() {
    let deltaTime = clock.getDelta();
    moveBall()
    camera.position.x = player.position.x;
    camera.position.y = player.position.y;
    camera.position.z = player.position.z;
    updatePhysics(deltaTime);
    stats.update();
    renderer.render(scene, camera);
    socket.emit("update position", { x: player.position.x, y: player.position.y, z: player.position.z })
    socket.emit("get players")
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
    ({ clock, scene, camera, renderer, stats } = setupGraphics())
    createBackground(scene);
    ({ player, controls } = await createPlayer(scene, physicsWorld, camera, STATE, rigidBodies, renderer))
    createLevel(scene, physicsWorld)
    //createJointObjects()
    setupEventHandlers(moveDirection)
    renderFrame()
}

function moveBall() {
    let physicsBody = player.userData.physicsBody;

    if (moveDirection.stop) {
        physicsBody.setLinearVelocity(new Ammo.btVector3(0, 0, 0))
    } else {
        let scalingFactor = 20;

        let moveY = moveDirection.up - moveDirection.down;
        let moveZ = moveDirection.forward - moveDirection.back;
        let moveX = moveDirection.left - moveDirection.right;

        if (moveY == 0 && moveZ == 0 && moveX == 0) return;

        let resultantImpulse = new Ammo.btVector3(0, moveY, 0)
        resultantImpulse.op_mul(scalingFactor);
        physicsBody.setLinearVelocity(resultantImpulse);

        if (moveZ == 0 && moveX == 0) return;
        var direction = new THREE.Vector3()
        camera.getWorldDirection(direction)
        console.log(direction)
        camera.position.add(direction.multiplyScalar(moveZ))
        player.position.x = camera.position.x;
        player.position.y = camera.position.y;
        player.position.z = camera.position.z;
        physicsWorld.removeRigidBody(player.userData.physicsBody)
        let ms = player.userData.physicsBody.getMotionState()
        if (ms) {
            var tmpTrans = new Ammo.btTransform()
            ms.getWorldTransform(tmpTrans)
            tmpTrans.setOrigin(new Ammo.btVector3(player.position.x, player.position.y, player.position.z))
            player.userData.physicsBody.setWorldTransform(tmpTrans)
        }
        physicsWorld.addRigidBody(player.userData.physicsBody)
        updatePhysics(clock.getDelta())

        if (moveX == 0) return;
        camera.rotation.y -= 90
        direction = new THREE.Vector3()
        camera.getWorldDirection(direction)
        console.log(direction)
        camera.position.add(direction.multiplyScalar(moveX))
        player.position.x = camera.position.x;
        player.position.y = camera.position.y;
        player.position.z = camera.position.z;
        physicsWorld.removeRigidBody(player.userData.physicsBody)
        ms = player.userData.physicsBody.getMotionState()
        if (ms) {
            var tmpTrans = new Ammo.btTransform()
            ms.getWorldTransform(tmpTrans)
            tmpTrans.setOrigin(new Ammo.btVector3(player.position.x, player.position.y, player.position.z))
            player.userData.physicsBody.setWorldTransform(tmpTrans)
        }
        physicsWorld.addRigidBody(player.userData.physicsBody)
        updatePhysics(clock.getDelta())
        camera.rotation.y += 90
    }

}