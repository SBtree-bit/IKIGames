import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { LoadingManager } from 'three'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import * as THREE from 'three';

async function createLevel(scene, physicsWorld, renderer, rigidBodies, kinematicBodies, Ammo, customObjects) {
    let pos = { x: -1, y: -5, z: 0 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;

    var MANAGER = new LoadingManager()
    const DRACO_LOADER = new DRACOLoader(MANAGER).setDecoderPath(`three/examples/js/libs/draco/gltf/`);
    const KTX2_LOADER = new KTX2Loader(MANAGER).setTranscoderPath(`three/examples/js/libs/basis/`);
    /*const loader = new GLTFLoader(MANAGER)
        .setCrossOrigin('anonymous')
        .setDRACOLoader(DRACO_LOADER)
        .setKTX2Loader(KTX2_LOADER.detectSupport(renderer))
        .setMeshoptDecoder(MeshoptDecoder);*/
    const loader = new GLTFLoader()
    loader.load("models/obj_test/test37.glb", (gltf) => {

        //var gltf = await loader.loadAsync('models/obj_test/test20.glb')
        //var gltf = await loader.loadAsync('temple.glb')
        let level = gltf.scene
        console.log("level")
        console.log(gltf.scene.children)
        console.log(gltf.scene.children.length)
        let children = []
        level.children.forEach((val, idx) => {
            console.log(idx, val)
            children[idx] = val
        })

        level.position.set(pos.x, pos.y, pos.z);

        level.castShadow = true;
        for(var i = 0; i < children.length; i++) {
            let item = children[i]
            console.log(item)
            if (!item) return
            for (var j = 0; j < customTypes.length; j++) {
                if (item.userData.type == customTypes[j]) {
                    var pos1 = {
                        x: item.position.x,
                        y: item.position.y,
                        z: item.position.z
                    }
                    startScripts[j](customObjects, Ammo, physicsWorld, rigidBodies, kinematicBodies, scene, THREE, GLTFLoader, pos1, item.userData)
                }
            }
            scene.add(item)
            item.userData.tag = "level";
            if (item.geometry) {
                let transform = new Ammo.btTransform();
                transform.setIdentity()
                var tpos = item.position;
                var rot = item.rotation
                transform.setOrigin(new Ammo.btVector3(tpos.x, tpos.y, tpos.z));
                transform.setRotation(new Ammo.btQuaternion(quat.x + rot.x, quat.y + rot.y, quat.z + rot.z, quat.w));
                let motionState = new Ammo.btDefaultMotionState(transform);

                let triangle, triangle_mesh = new Ammo.btTriangleMesh;
                triangle_mesh.setScaling(new Ammo.btVector3(item.scale.x, item.scale.y, item.scale.z))
                var geometry = item.geometry
                console.log("geometry")
                console.log(item)
                //new ammo vectors
                let vectA = new Ammo.btVector3(0, 0, 0);
                let vectB = new Ammo.btVector3(0, 0, 0);
                let vectC = new Ammo.btVector3(0, 0, 0);

                //retrieve vertices positions from object
                let verticesPos = geometry.getAttribute('position').array;
                let triangles = [];
                for (let j = 0; j < verticesPos.length; j += 3) {
                    triangles.push({ x: verticesPos[j], y: verticesPos[j + 1], z: verticesPos[j + 2] })
                }

                //use triangles data to draw ammo shape
                for (let j = 0; j < triangles.length - 3; j += 3) {

                    vectA.setX(triangles[j].x);
                    vectA.setY(triangles[j].y);
                    vectA.setZ(triangles[j].z);

                    vectB.setX(triangles[j + 1].x);
                    vectB.setY(triangles[j + 1].y);
                    vectB.setZ(triangles[j + 1].z);

                    vectC.setX(triangles[j + 2].x);
                    vectC.setY(triangles[j + 2].y);
                    vectC.setZ(triangles[j + 2].z);

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
                body.threeObject = item;

                physicsWorld.addRigidBody(body);
            } else if (item.children.length > 0) {

            } else {
                console.log("no geometry")
                console.log(item)
            }
        }
        /*level.children.forEach((item, index) => {
            console.log(item)
            if (!item) return
            for (var j = 0; j < customTypes.length; j++) {
                if (item.userData.type == customTypes[j]) {
                    var pos1 = {
                        x: item.position.x,
                        y: item.position.y,
                        z: item.position.z
                    }
                    startScripts[j](customObjects, Ammo, physicsWorld, rigidBodies, kinematicBodies, scene, THREE, GLTFLoader, pos1, item.userData)
                }
            }
            scene.add(item)
            item.userData.tag = "level";
            if (item.geometry) {
                let transform = new Ammo.btTransform();
                transform.setIdentity()
                var tpos = item.position;
                var rot = item.rotation
                transform.setOrigin(new Ammo.btVector3(tpos.x, tpos.y, tpos.z));
                transform.setRotation(new Ammo.btQuaternion(quat.x + rot.x, quat.y + rot.y, quat.z + rot.z, quat.w));
                let motionState = new Ammo.btDefaultMotionState(transform);

                let triangle, triangle_mesh = new Ammo.btTriangleMesh;
                triangle_mesh.setScaling(new Ammo.btVector3(item.scale.x, item.scale.y, item.scale.z))
                var geometry = item.geometry
                console.log("geometry")
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
                body.threeObject = item;

                physicsWorld.addRigidBody(body);
            } else if (item.children.length > 0) {

            } else {
                console.log("no geometry")
                console.log(item)
            }
        })*/
    })
}

/*
function addAll(level, scene, physicsWorld) {
    let pos = { x: -1, y: -5, z: 0 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;
    for (var i = 0; i < level.children.length; i++) {
        let item = level.children[i];
        if (!item) continue
        scene.add(item)
        item.userData.tag = "level";
        if (item.geometry) {
            let transform = new Ammo.btTransform();
            transform.setIdentity()
            var tpos = item.position;
            var rot = item.rotation
            transform.setOrigin(new Ammo.btVector3(tpos.x, tpos.y, tpos.z));
            transform.setRotation(new Ammo.btQuaternion(quat.x + rot.x, quat.y + rot.y, quat.z + rot.z, quat.w));
            let motionState = new Ammo.btDefaultMotionState(transform);

            let triangle, triangle_mesh = new Ammo.btTriangleMesh;
            triangle_mesh.setScaling(new Ammo.btVector3(item.scale.x, item.scale.y, item.scale.z))
            var geometry = item.geometry
            /*console.log("geometry")
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
            body.threeObject = item;

            physicsWorld.addRigidBody(body);
        }  else if (item.children.length > 0) {
            console.log(item)
            addAll(item, scene, physicsWorld)
            //addAll(item.parent,scene,physicsWorld)
        } else {
            /*console.log("no geometry")
            console.log(item)
        }
    }
}*/
export default createLevel;