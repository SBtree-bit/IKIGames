import * as THREE from 'three';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
async function loadModels(playerURL, animationURLS, scene) {
    var fbxLoader = new FBXLoader();
    var object = await fbxLoader.loadAsync(playerURL)
    object.scale.set(0.01, 0.01, 0.01);
    //let activeAction = object.animations[0];
    var animationActions = [];
    let mixer = new THREE.AnimationMixer(object);
    console.log(mixer)
    let animationAction = mixer.clipAction(object.animations[0]);
    animationActions.push(animationAction);
    let activeAction = animationActions[0];
    scene.add(object);
    //add an animation from another file
    /*fbxLoader.load(animationURLS[0], function (object) {
        console.log('loaded samba');
        var animationAction = mixer.clipAction(object.animations[0]);
        animationActions.push(animationAction);
        //add an animation from another file
        fbxLoader.load('models/vanguard@bellydance.fbx', function (object) {
            console.log('loaded bellydance');
            var animationAction = mixer.clipAction(object.animations[0]);
            animationActions.push(animationAction);
            //add an animation from another file
            fbxLoader.load('models/vanguard@goofyrunning.fbx', function (object) {
                console.log('loaded goofyrunning');
                object.animations[0].tracks.shift(); //delete the specific track that moves the object forward while running
                //console.dir((object as THREE.Object3D).animations[0])
                var animationAction = mixer.clipAction(object.animations[0]);
                animationActions.push(animationAction);
                modelReady = true;
            }, function (xhr) {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            }, function (error) {
                console.log(error);
            });
        }, function (xhr) {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        }, function (error) {
            console.log(error);
        });
    }, function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    }, function (error) {
        console.log(error);
    });*/
    for (var i = 0; i < animationURLS.length; i++) {
        let object1 = await fbxLoader.loadAsync(animationURLS[i]);
        animationAction = mixer.clipAction(object1.animations[0]);
        animationActions.push(animationAction);
    }
    let modelReady = true;
    return {animationActions, mixer, activeAction, modelReady, object}
}
export default loadModels;