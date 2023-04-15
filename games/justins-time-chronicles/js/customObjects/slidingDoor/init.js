var object
function initSlidingDoor() {
    console.log("sliding door init")
    customObjects.slidingDoors.update = updateSlidingDoor
    return [initSlidingDoorImport, updateSlidingDoor, "slidingDoor"]
}
function updateSlidingDoor(object, scene, THREE, physicsWorld) {
    if (!object) return
    if (!object.userData.active) return
    object.userData.tick++
    if (object.userData.tick >= 0) {
        object.position.x -= 0.04
        //object.visible = false
        var motionState = object.userData.physicsBody.getMotionState()
        var prevTrans = new Ammo.btTransform()
        motionState.getWorldTransform(prevTrans)
        var trans = new Ammo.btTransform()
        trans.setIdentity()
        trans.setOrigin(prevTrans.x - 0.04, prevTrans.y, prevTrans.z)
        motionState.setWorldTransform(trans)
    }
    if (object.userData.tick >= 200) {
        object.visible = false
        physicsWorld.removeRigidBody(object.userData.physicsBody)
    }
}
async function initSlidingDoorImport(customObjects, Ammo, physicsWorld, rigidBodies, kinematicBodies, scene, THREE, GLTFLoader, pos) {
    let loader = new GLTFLoader()
    var gltf = await loader.loadAsync("./js/customObjects/slidingDoor/model.glb")
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;
    object = /*new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshBasicMaterial({color: 0xffffff}))*/ gltf.scene
    object.position.copy(new THREE.Vector3(pos.x, pos.y, pos.z))
    gltf = await loader.loadAsync("./models/obj_test/test17.glb")
    console.log(gltf.scene)
    
    /*let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( 0, 0, 0, 0 ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( 5, 5, 5 ) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( 0, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( 0, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(10);

    physicsWorld.addRigidBody( body );
    body.threeObject = object
    object.userData.physicsBody = body
    //console.log(body.getMotionState().getWorldTransform())
    body.setCollisionFlags(body.getCollisionFlags | 2)
    body.setActivationState(4);*/
    for (var i = 0; i < object.children.length; i++) {
        let item = object.children[i];
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
            object = item
            body.threeObject = object;
            object.userData.physicsBody = body
            object.userData.tick = 0
            //THREE.EventDispatcher.call( object );
            //object.addEventListener("clicked", function(){ console.log("clicked");this.userData.active = true})

            physicsWorld.addRigidBody(body);
        }  else if (item.children.length > 0) {
            
        } else {
            console.log("no geometry")
            console.log(item)
        }
    }
    scene.add(object)
    console.log("sliding door init - import")
    console.log(object)
    object.userData.path = "slidingDoors"
    customObjects.slidingDoors.objects.push(object)
    customObjects.all.push(object)
}
define(initSlidingDoor)
/*var object
function initSlidingDoor() {
    console.log("sliding door init")
    return [initSlidingDoorImport, updateSlidingDoor]
}
function updateSlidingDoor(object, scene, THREE, physicsWorld) {
    if (!object) return
    if (!object.position) return
    /*object.userData.tick++
    console.log(object.userData.tick)
    if (object.userData.tick >= 100) {
        physicsWorld.removeRigidBody(object.userData.physicsBody)
        object.position.y += 0.01
        object.visible = false
        object.userData.visible=false
    }*/
    /*var motionState = object.userData.physicsBody.getMotionState()
    var prevTrans = new Ammo.btTransform()
    motionState.getWorldTransform(prevTrans)
    var trans = new Ammo.btTransform()
    trans.setIdentity()
    trans.setOrigin(prevTrans.x, prevTrans.y + 0.01, prevTrans.z)
    motionState.setWorldTransform(trans)
}
async function initSlidingDoorImport(Ammo, physicsWorld, rigidBodies, kinematicBodies, scene, THREE, GLTFLoader) {
    let loader = new GLTFLoader()
    var gltf = await loader.loadAsync("./js/customObjects/slidingDoor/model.glb")
    let pos = { x: 0, y: 5, z: 0 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;
    object = /*new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshBasicMaterial({color: 0xffffff}) gltf.scene.children[0]
    object.position.copy(new THREE.Vector3(pos.x, pos.y, pos.z))
    
    /*let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( 0, 0, 0, 0 ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( 5, 5, 5 ) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( 0, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( 0, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(10);

    physicsWorld.addRigidBody( body );
    body.threeObject = object
    object.userData.physicsBody = body
    //console.log(body.getMotionState().getWorldTransform())
    body.setCollisionFlags(body.getCollisionFlags | 2)
    body.setActivationState(4);
    for (var i = 0; i < object.children.length; i++) {
        let item = object.children[i];
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
            body.threeObject = object;
            object = item
            object.userData.physicsBody = body
            object.userData.tick = 0

            kinematicBodies.push(object)

            physicsWorld.addRigidBody(body);
        }  else if (item.children.length > 0) {
            
        } else {
            console.log("no geometry")
            console.log(item)
        }
    }

    scene.add(object)
    console.log("sliding door init - import")
    console.log(object)
    return object
}
define(initSlidingDoor)*/