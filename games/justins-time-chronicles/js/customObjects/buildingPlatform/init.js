function addGLB(object, physicsWorld, Ammo, mass, pos, scene, THREE) {
    console.log("speedometer")
    console.log(object.children)
    for(var i = 0; i < object.children.length; i++) {
        let item = object.children[i]
        console.log("SItem")
        console.log(item)
        if (!item) {
            console.log("no item")
            return
        }
        item.userData.tag = "level";
        let xyz = new THREE.Vector3(pos.x, pos.y, pos.z)
        item.position.add(xyz)
        scene.add(item)
        if (item.geometry) {
            let transform = new Ammo.btTransform();
            transform.setIdentity()
            var tpos = item.position;
            var rot = item.rotation
            transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
            transform.setRotation(new Ammo.btQuaternion(rot.x, rot.y, rot.z, 0));
            let motionState = new Ammo.btDefaultMotionState(transform);

            let triangle, triangle_mesh = new Ammo.btTriangleMesh;
            triangle_mesh.setScaling(new Ammo.btVector3(item.scale.x, item.scale.y, item.scale.z))
            var geometry = item.geometry
            console.log("geometryS")
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
            body.threeObject = item
            item.userData.physicsBody = body

            physicsWorld.addRigidBody(body);
            console.log(physicsWorld)
        } else if (item.children.length > 0) {

        } else {
            console.log("no geometry")
            console.log(item)
        }
    }
}
function initPlatform() {
    console.log("platform init")
    customObjects.platforms.update = updatePlatform
    return [initPlatformImport, updatePlatform, "platform"]
}
function updatePlatform(object, scene, THREE) {

}
function addGeometry(object, pos, physicsWorld, Ammo, geometry , loader, scene, THREE) {
    object.addEventListener("clicked", async () => {
        if (!inventory.mainItems.other) return
        let item = inventory.mainItems.other
        console.log(item.type.name)
        let itemTrue = false
        switch (item.type.name) {
            case "Casing":
                let object1 = (await loader.loadAsync("./js/customObjects/buildingPlatform/casing.glb")).scene
                console.log("Casing")
                console.log(object1)
                //object1.position.y = 5
                //object.add(object1)
                itemTrue = true
                //addGLB(object1, physicsWorld, Ammo, mass, pos, scene, THREE)
                object1.position.copy(pos)
                scene.add(object1)
                console.log("clicked")
                break
        }
        if (!itemTrue) return
        inventory.mainItems.other = undefined
    })
    let transform = new Ammo.btTransform();
    transform.setIdentity()
    var rot = object.rotation
    let quat = object.quaternion
    let mass = 0
    transform.setOrigin(new Ammo.btVector3(pos.x + object.position.x, pos.y + object.position.y, pos.z + object.position.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x + rot.x, quat.y + rot.y, quat.z + rot.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);
    let colShape;
    if (geometry == "cylinder") {
        colShape = new Ammo.btCylinderShape(new Ammo.btVector3(object.scale.x * 0.5, object.scale.y * 0.5, object.scale.z * 0.5))
    } else if (geometry == "box") {
        colShape = new Ammo.btBoxShape(new Ammo.btVector3(object.scale.x*0.5, object.scale.y, object.scale.z*0.5))
        object.material.opacity = 0.25
        object.material.transparent = true
    }
    colShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(mass, localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
    let body = new Ammo.btRigidBody(rbInfo);
    physicsWorld.addRigidBody(body);
}
async function initPlatformImport(customObjects, Ammo, physicsWorld, rigidBodies, kinematicBodies, scene, THREE, GLTFLoader, pos, props) {
    let loader = new GLTFLoader()
    let scene1 = (await loader.loadAsync("./js/customObjects/buildingPlatform/platform_test1.glb")).scene
    for (let i = 0; i < scene1.children.length; i++) {
        switch (scene1.children[i].name) {
            case "Cylinder":
                addGeometry(scene1.children[i], pos, physicsWorld, Ammo, "cylinder", loader, scene, THREE)
                console.log("cylinder")
                break
            case "Cube":
                addGeometry(scene1.children[i], pos, physicsWorld, Ammo, "box", loader, scene, THREE)
                console.log("cube")
                break
        }
    }
    scene1.position.copy(pos)
    scene1.userData.built = []
    scene.add(scene1)
    customObjects.platforms.objects.push(object)
}
define(initPlatform)