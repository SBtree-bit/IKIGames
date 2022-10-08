import * as THREE from 'three';

function bigBlockTest(Ammo, scene, physicsWorld) {
    /*var threeObject = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: 0x00ff00}))
    scene.add(threeObject)*/

    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(0, 100, 0))
    let motionState = new Ammo.btDefaultMotionState(transform)
    let colShape = new Ammo.btBoxShape(new Ammo.btVector3(1, 1, 1))
    colShape.setMargin(0.05)
    let localInertia = new Ammo.btVector3(0, 0, 0)
    colShape.calculateLocalInertia(localInertia)
    let rbInfo = new Ammo.btRigidBodyConstructionInfo(1, motionState, colShape, localInertia);
    let ammoObject = new Ammo.btRigidBody(rbInfo)
    physicsWorld.addRigidBody(ammoObject)

    //threeObject.userData.physicsBody = ammoObject
    //ammoObject.threeObject = threeObject

    //return threeObject;
}

export default bigBlockTest;