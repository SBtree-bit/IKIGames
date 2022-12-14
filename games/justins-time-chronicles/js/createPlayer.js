import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

async function createPlayer(scene, physicsWorld, camera, STATE, rigidBodies, renderer, loadModels) {
    let pos = { x: 0, y: 0, z: 0 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 1;

    let player = new THREE.Group()

    console.log(player)

    let {mixer, activeAction, modelReady, animationActions, object} = await loadModels("models/player/Aj.fbx", ["models/player/Aj@idle.fbx","models/player/Aj@jump.fbx", "models/player/Aj@run.fbx", 'models/player/Aj@fly.fbx'])
    object.position.y -= 0.58;
    player.add(object)
    var animations = {
        startJump(activeAction, animationActions) {
            activeAction = animationActions[2]
            activeAction.timeScale = 1;
            activeAction.setLoop(THREE.LoopOnce)
            activeAction.clampWhenFinished = true;
            activeAction.play()
            return activeAction
        },
        midJump(activeAction, animationActions) {
            activeAction = animationActions[2]
            activeAction.setLoop(THREE.LoopRepeat, 100)
            activeAction.timeScale = -1;
            activeAction.time = 1;
            activeAction.paused = true;
            activeAction.play()
        },
        jump(activeAction, mixer, animationActions) {
            animations.startJump(activeAction, animationActions)
            mixer.addEventListener("finished", () => {
                animations.startJump(activeAction, animationActions)
            })
        },
        stopJump(activeAction, animationActions) {
            activeAction = animationActions[2]
            activeAction.timeScale = -1;
            activeAction.play()
        },
        idle(activeAction, animationActions) {
            activeAction = animationActions[1]
            activeAction.timeScale = 1;
            activeAction.time = 0;
            activeAction.play()
            return activeAction
        },
        run(activeAction, animationActions) {
            activeAction = animationActions[3]
            activeAction.timeScale = 1;
            activeAction.time = 0;
            activeAction.play()
            return activeAction
        },
        fly(activeAction, animationActions) {
            activeAction = animationActions[4]
            activeAction.timeScale = 1;
            activeAction.time = 0;
            activeAction.play()
            return activeAction
        }
    }
    activeAction = animations.fly(activeAction, animationActions)

    /*const loader = new GLTFLoader().setPath('models/');
    var gltf = await loader.loadAsync('player.glb')*/
    //player.visible = false;
    scene.add(player)

    let controls = new PointerLockControls(camera, renderer.domElement)
    /*let controls = new OrbitControls(camera, document.body)
    controls.enableRotate = false
    controls.enablePan = false;
    controls.enableZoom = false;*/

    
    document.querySelector("#game").onclick = function() {
        controls.lock()
    }

    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);



    let triangle, triangle_mesh = new Ammo.btTriangleMesh;
    var geometry = new THREE.BoxGeometry()
    if (!geometry) return {player, controls, mixer, activeAction, modelReady, animationActions};
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

    body.setActivationState(STATE.DISABLE_DEACTIVATION)

    physicsWorld.addRigidBody(body);

    body.setAngularFactor( 1, 0, 0 );


    body.threeObject = player;
    player.userData.physicsBody = body;
    rigidBodies.push(player);

    return {player, controls, mixer, animations, activeAction, modelReady, animationActions};
}

export default createPlayer;