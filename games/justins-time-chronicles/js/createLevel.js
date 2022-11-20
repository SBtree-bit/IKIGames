import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

async function createLevel(scene, physicsWorld) {
    let pos = { x: -1, y: -5, z: 0 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;

    const loader = new GLTFLoader().setPath('models/');
    var gltf = await loader.loadAsync('cave.glb')
    //var gltf = await loader.loadAsync('temple.glb')
    let level = gltf.scene

    level.position.set(pos.x, pos.y, pos.z);

    level.castShadow = true;

    for (var i = 0; i < 7; i++) {
        let item = level.children[i];
        scene.add(item)
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
        } else {
            console.log("no geometry")
            console.log(item)
        }
    }
}
export default createLevel;