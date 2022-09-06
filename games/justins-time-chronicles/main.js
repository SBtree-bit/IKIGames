/*
import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

let camera, scene, renderer, clock;
let physicsWorld, rigidBodies = [], tmpTrans;
let player;

Ammo().then(init);

function init() {
    setupPhysics()
    setupGraphics()
    initWorld()
}

function initWorld() {

    new RGBELoader()
        .setPath('textures/equirectangular/')
        .load('sky.hdr', function (texture) {

            texture.mapping = THREE.EquirectangularReflectionMapping;

            scene.background = texture;
            scene.environment = texture;

            // model

            const loader = new GLTFLoader().setPath('models/');
            loader.load('level.glb', function (gltf) {

                scene.add(gltf.scene);

            });
            loader.load('player.glb', function (gltf) {
                player = gltf.scene.children[0]
                console.log(player)

                /*
                let transform = new Ammo.btTransform();
                transform.setIdentity()
                transform.setOrigin(new Ammo.btVector3(0, 0, 0))
                transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 0))
                let motionState = new Ammo.btDefaultMotionState(transform)
                // new empty ammo shape


                
                let triangle, triangle_mesh = new Ammo.btTriangleMesh;
                var geometry = player.geometry
                //new ammo vectors
                let vectA = new Ammo.btVector3(0, 0, 0);
                let vectB = new Ammo.btVector3(0, 0, 0);
                let vectC = new Ammo.btVector3(0, 0, 0);

                //retrieve vertices positions from object
                let verticesPos = geometry.getAttribute('position').array;
                let triangles = [];
                for (let i = 0; i < verticesPos.length; i += 3) {
                    triangles.push({ x: verticesPos[i], y: verticesPos[i + 1], z: verticesPos[i + 2] })
                }

                //use triangles data to draw ammo shape
                for (let i = 0; i < triangles.length - 3; i += 3) {

                    vectA.setX(triangles[i].x);
                    vectA.setY(triangles[i].y);
                    vectA.setZ(triangles[i].z);

                    vectB.setX(triangles[i + 1].x);
                    vectB.setY(triangles[i + 1].y);
                    vectB.setZ(triangles[i + 1].z);

                    vectC.setX(triangles[i + 2].x);
                    vectC.setY(triangles[i + 2].y);
                    vectC.setZ(triangles[i + 2].z);

                    triangle_mesh.addTriangle(vectA, vectB, vectC, true);
                }

                Ammo.destroy(vectA)
                Ammo.destroy(vectB)
                Ammo.destroy(vectC)

                const shape = new Ammo.btConvexTriangleMeshShape(triangle_mesh, true)
                const shape = new Ammo.btBoxShape(new Ammo.btVector3(1, 1, 1));
                shape.setMargin(0.05)
                let localInertia = new Ammo.btVector3(0, 0, 0)
                shape.calculateLocalInertia(1, localInertia);
                let rbInfo = new Ammo.btRigidBodyConstructionInfo(1, motionState, shape, localInertia)
                let body = new Ammo.btRigidBody(rbInfo)

                physicsWorld.addRigidBody(body)
                player.userData.physicsBody = body
                rigidBodies.push(player)
                scene.add(player)
                animate()
            })
        });

}

function setupPhysics() {
    let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache = new Ammo.btDbvtBroadphase(),
        solver = new Ammo.btSequentialImpulseConstraintSolver();
    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration)
    physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0))
}

function setupGraphics() {
    clock = new THREE.Clock()
    const container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(- 1.8, 0.6, 2.7);

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render); // use if there is no animation loop
    controls.minDistance = 2;
    controls.maxDistance = 1000;
    controls.target.set(0, 0, - 0.2);
    controls.update();

    window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

window.addEventListener("keydown", (e) => {
    console.log(e.key)
    if (e.key == "w") {
        player.position.z += 1
    } else if (e.key == "s") {
        player.position.z -= 1
    }
    if (e.key == "a") {
        player.position.x += 1;
    } else if (e.key == "d") {
        player.position.x -= 1;
    }
})

function animate() {
    tmpTrans = new Ammo.btTransform()
    let deltaTime = clock.getDelta()
    updatePhysics(deltaTime);
    render();
    requestAnimationFrame(animate)
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

//

function render() {

    renderer.render(scene, camera);

}
*/
import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import Stats from 'three/addons/libs/stats.module.js';

//variable declaration
let physicsWorld, scene, stats, camera, renderer, controls, clock, rigidBodies = [], tmpTrans;
let colGroupPlane = 1, colGroupRedBall = 2, colGroupGreenBall = 4;
let player;

//Ammojs Initialization
Ammo().then(start)
function setupPhysicsWorld() {
    let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache = new Ammo.btDbvtBroadphase(),
        solver = new Ammo.btSequentialImpulseConstraintSolver();
    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration)
    physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0))
}

function setupGraphics() {
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 5000);
    camera.position.set(0, 30, 70);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    if (sessionStorage.getItem("camPosX")) {
        camera.position.set(parseFloat(sessionStorage.getItem("camPosX")), parseFloat(sessionStorage.getItem("camPosY")), parseFloat(sessionStorage.getItem('camPosZ')))
        camera.lookAt(new THREE.Vector3(parseFloat(sessionStorage.getItem("camRotX")), parseFloat(sessionStorage.getItem('camRotY')), parseFloat(sessionStorage.getItem("camRotZ"))))
    }

    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
    hemiLight.color.setHSL(0.6, 0.6, 0.6);
    hemiLight.groundColor.setHSL(0.1, 1, 0.4);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    let dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(-1, 1.75, 1);
    dirLight.position.multiplyScalar(100);
    scene.add(dirLight);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    let d = 50;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.far = 13500;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xbfd1e5);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.shadowMap.enabled = true;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 0.2;
    controls.maxDistance = 100
    controls.target.set(0, 0, 0)
    controls.update()

    stats = Stats()
    document.body.appendChild(stats.dom)
}

function renderFrame() {
    let deltaTime = clock.getDelta();
    updatePhysics(deltaTime);
    stats.update();
    renderer.render(scene, camera);
    requestAnimationFrame(renderFrame);
}

async function createBackground() {
    let texture = await new RGBELoader()
        .setPath('textures/equirectangular/')
        .loadAsync('sky.hdr')

    texture.mapping = THREE.EquirectangularReflectionMapping;

    scene.background = texture;
    scene.environment = texture;
}

async function createPlayer() {
    let pos = { x: 0, y: 0, z: 0 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 1;

    const loader = new GLTFLoader().setPath('models/');
    var gltf = await loader.loadAsync('player.glb')
    player = gltf.scene.children[0]

    scene.add(player);


    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);



    let triangle, triangle_mesh = new Ammo.btTriangleMesh;
    var geometry = player.geometry
    //new ammo vectors
    let vectA = new Ammo.btVector3(0, 0, 0);
    let vectB = new Ammo.btVector3(0, 0, 0);
    let vectC = new Ammo.btVector3(0, 0, 0);

    //retrieve vertices positions from object
    let verticesPos = geometry.getAttribute('position').array;
    let triangles = [];
    for (let i = 0; i < verticesPos.length; i += 3) {
        triangles.push({ x: verticesPos[i], y: verticesPos[i + 1], z: verticesPos[i + 2] })
    }

    //use triangles data to draw ammo shape
    for (let i = 0; i < triangles.length - 3; i += 3) {

        vectA.setX(triangles[i].x);
        vectA.setY(triangles[i].y);
        vectA.setZ(triangles[i].z);

        vectB.setX(triangles[i + 1].x);
        vectB.setY(triangles[i + 1].y);
        vectB.setZ(triangles[i + 1].z);

        vectC.setX(triangles[i + 2].x);
        vectC.setY(triangles[i + 2].y);
        vectC.setZ(triangles[i + 2].z);

        triangle_mesh.addTriangle(vectA, vectB, vectC, true);
    }

    Ammo.destroy(vectA)
    Ammo.destroy(vectB)
    Ammo.destroy(vectC)

    let colShape = new Ammo.btConvexTriangleMeshShape(triangle_mesh, true)
    colShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(mass, localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
    let body = new Ammo.btRigidBody(rbInfo);

    physicsWorld.addRigidBody(body);


    player.userData.physicsBody = body;
    rigidBodies.push(player);
}

async function createLevel() {
    let pos = { x: -5, y: -30, z: 0 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;

    const loader = new GLTFLoader().setPath('models/');
    var gltf = await loader.loadAsync('level.glb')
    let level = gltf.scene

    level.position.set(pos.x, pos.y, pos.z);

    level.castShadow = true;
    level.receiveShadow = true;

    scene.add(level);

    for (var i = 0; i < level.children.length; i++) {
        let item = level.children[i];
        if (item.geometry) {
            let transform = new Ammo.btTransform();
            transform.setIdentity()
            transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
            transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
            let motionState = new Ammo.btDefaultMotionState(transform);

            let triangle, triangle_mesh = new Ammo.btTriangleMesh;
            triangle_mesh.setScaling(new Ammo.btVector3(item.scale.x, item.scale.y, item.scale.z))
            var geometry = item.geometry
            console.log(item)
            //new ammo vectors
            let vectA = new Ammo.btVector3(0, 0, 0);
            let vectB = new Ammo.btVector3(0, 0, 0);
            let vectC = new Ammo.btVector3(0, 0, 0);

            //retrieve vertices positions from object
            let verticesPos = geometry.getAttribute('position').array;
            let triangles = [];
            for (let i = 0; i < verticesPos.length; i += 3) {
                triangles.push({ x: verticesPos[i], y: verticesPos[i + 1], z: verticesPos[i + 2] })
            }

            //use triangles data to draw ammo shape
            for (let i = 0; i < triangles.length - 3; i += 3) {

                vectA.setX(triangles[i].x);
                vectA.setY(triangles[i].y);
                vectA.setZ(triangles[i].z);

                vectB.setX(triangles[i + 1].x);
                vectB.setY(triangles[i + 1].y);
                vectB.setZ(triangles[i + 1].z);

                vectC.setX(triangles[i + 2].x);
                vectC.setY(triangles[i + 2].y);
                vectC.setZ(triangles[i + 2].z);

                triangle_mesh.addTriangle(vectA, vectB, vectC, true);
            }

            Ammo.destroy(vectA)
            Ammo.destroy(vectB)
            Ammo.destroy(vectC)

            let colShape = new Ammo.btConvexTriangleMeshShape(triangle_mesh, true)
            colShape.setMargin(0.05);

            let localInertia = new Ammo.btVector3(0, 0, 0);
            colShape.calculateLocalInertia(mass, localInertia);

            let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
            let body = new Ammo.btRigidBody(rbInfo);

            physicsWorld.addRigidBody(body);
        }
    }
}

function createJointObjects() {
    let pos1 = { x: -1, y: 15, z: 0 };
    let pos2 = { x: -1, y: 10, z: 0 };

    let radius = 2;
    let scale = { x: 5, y: 2, z: 2 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass1 = 0;
    let mass2 = 1;

    let transform = new Ammo.btTransform();

    //Sphere Graphics
    let ball = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({ color: 0xb846db }));

    ball.position.set(pos1.x, pos1.y, pos1.z);

    ball.castShadow = true;
    ball.receiveShadow = true;

    scene.add(ball);


    //Sphere Physics
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos1.x, pos1.y, pos1.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);

    let sphereColShape = new Ammo.btSphereShape(radius);
    sphereColShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(0, 0, 0);
    sphereColShape.calculateLocalInertia(mass1, localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass1, motionState, sphereColShape, localInertia);
    let sphereBody = new Ammo.btRigidBody(rbInfo);

    physicsWorld.addRigidBody(sphereBody, colGroupGreenBall, colGroupRedBall);

    ball.userData.physicsBody = sphereBody;
    rigidBodies.push(ball);


    //Block Graphics
    let block = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({ color: 0xf78a1d }));

    block.position.set(pos2.x, pos2.y, pos2.z);
    block.scale.set(scale.x, scale.y, scale.z);

    block.castShadow = true;
    block.receiveShadow = true;

    scene.add(block);


    //Block Physics
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos2.x, pos2.y, pos2.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    motionState = new Ammo.btDefaultMotionState(transform);

    let blockColShape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5));
    blockColShape.setMargin(0.05);

    localInertia = new Ammo.btVector3(0, 0, 0);
    blockColShape.calculateLocalInertia(mass2, localInertia);

    rbInfo = new Ammo.btRigidBodyConstructionInfo(mass2, motionState, blockColShape, localInertia);
    let blockBody = new Ammo.btRigidBody(rbInfo);

    physicsWorld.addRigidBody(blockBody, colGroupGreenBall, colGroupRedBall);

    block.userData.physicsBody = blockBody;
    rigidBodies.push(block);

    let spherePivot = new Ammo.btVector3(0, -radius, 0);
    let blockPivot = new Ammo.btVector3(-scale.x * 0.5, 1, 1);

    let p2p = new Ammo.btPoint2PointConstraint(sphereBody, blockBody, spherePivot, blockPivot);
    physicsWorld.addConstraint(p2p, false);
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

function start() {
    //code goes here
    tmpTrans = new Ammo.btTransform();
    setupPhysicsWorld()
    setupGraphics()
    createBackground()
    createPlayer()
    createLevel()
    //createJointObjects()
    renderFrame()
}