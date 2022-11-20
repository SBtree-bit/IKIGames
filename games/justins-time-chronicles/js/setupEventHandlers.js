<<<<<<< HEAD
import getControls from "./gamepad.js";
import * as THREE from 'three';
import joystick from './joystick.js';

function setupEventHandlers(moveDirection, camera, fpCamera, tpCamera, animations, activeAction, animationActions, mixer) {

    window.addEventListener('keydown', (event) => { handleKeyDown(event, moveDirection, camera, fpCamera, tpCamera, animations, activeAction, animationActions, mixer) }, false);
    window.addEventListener('keyup', (event) => { handleKeyUp(event, moveDirection) }, false);

    setInterval(() => { gamepadControls(moveDirection, fpCamera, tpCamera, camera) }, 50)
    console.log(document.querySelector("#joystick"))
    joystick(document.querySelector("#joystick"), window.innerWidth / 50, 8, 2, 8, 2, function(angle_in_degrees, x, y, speed, x_relative, y_relative) {
        moveDirection.back = y_relative;
        moveDirection.right = x_relative
    })
    document.querySelector("#jumpButton").addEventListener('mousedown', mouseDown);
    document.querySelector("#jumpButton").addEventListener('mouseup', mouseUp);
    document.querySelector("#jumpButton").addEventListener('touchstart', mouseDown);
    document.querySelector("#jumpButton").addEventListener('touchend', mouseUp);
    document.querySelector("#jumpButton").addEventListener('touchcancel', mouseUp);

    function mouseDown() {moveDirection.up = 1;}
    function mouseUp() {moveDirection.up = 0;}

}

function gamepadControls(moveDirection, fpCamera,tpCamera,camera) {
    if (navigator.getGamepads()[0]) {
        moveDirection.stop = false;
        var controls = getControls(0)
        moveDirection.back = controls.joysticks.R.y * 10;
        moveDirection.left = controls.joysticks.R.x * 10;
        //camera.rotation.y -= controls.joysticks.L.x * 0.1;
        moveDirection.up = controls.buttons.includes("ZR") ? 1 : 0
        moveDirection.down = controls.buttons.includes("ZL") ? 1 : 0
        if (controls.buttons.includes("ZR") && controls.buttons.includes("ZL")) {moveDirection.stop = true}
        if (controls.buttons.includes("Home")) location.reload()
        if (controls.buttons.includes("+")) {camera.set = true; if (camera.current == tpCamera){ camera.current = fpCamera; moveDirection.hidePlayer = false} else {camera.current = tpCamera; moveDirection.hidePlayer = true}}
        //camera.rotation.x -= movementY * 0.002;
        //camera.rotation.x = Math.max((Math.PI / 2) - Math.PI, Math.min((Math.PI / 2) - 0, movementY))
        var _euler = new THREE.Euler(0, 0, 0, "YXZ")
        const movementX = controls.joysticks.L.x;
        const movementY = controls.joysticks.L.y;

        _euler.setFromQuaternion(fpCamera.quaternion);

        _euler.y -= movementX * 0.1;
        _euler.x -= movementY * 0.1;

        var _PI_2 = Math.PI / 2;

        _euler.x = Math.max(_PI_2 - Math.PI, Math.min(_PI_2 - 0, _euler.x));

        fpCamera.quaternion.setFromEuler(_euler);
    }
}


function handleKeyDown(event, moveDirection, camera, fpCamera, tpCamera, animations, activeAction, animationActions, mixer) {
    //location.replace("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
=======


function setupEventHandlers(moveDirection){

    window.addEventListener( 'keydown', (event) => {handleKeyDown(event, moveDirection)}, false);
    window.addEventListener( 'keyup', (event) => {handleKeyUp(event, moveDirection)}, false);
}


function handleKeyDown(event, moveDirection){
>>>>>>> parent of 1ec4a19 (l)

    let keyCode = event.keyCode;

    switch(keyCode){

        case 70:
            console.log(camera.current)
            camera.set = true;
            if (camera.current.name == "First-Person Camera") {
                moveDirection.hidePlayer = true;
                camera.current = tpCamera
            } else {
                camera.current = fpCamera
                moveDirection.hidePlayer = false
            }
            console.log(camera.current)
            console.log(camera)
            //camera == fpCamera ? tpCamera : fpCamera
            break;

        case 87: //W: FORWARD
            moveDirection.forward = 10
            break;

        case 83: //S: BACK
            moveDirection.back = 10
            break;

        case 65: //A: LEFT
            moveDirection.left = 0.1
            break;

        case 68: //D: RIGHT
            moveDirection.right = 0.1
            break;
        
        case 32:
            activeAction = animations.startJump(activeAction, animationActions)
            moveDirection.up = 1
            mixer.addEventListener("finished", (e) => {
                
                moveDirection.up = 1
            })
            break;

        case 16:
            moveDirection.down = 1;
            break;

        case 13:
            moveDirection.stop = true;
            break;
    }
}


function handleKeyUp(event, moveDirection){
    let keyCode = event.keyCode;

    switch(keyCode){
        case 87: //FORWARD
            moveDirection.forward = 0
            break;

        case 83: //BACK
            moveDirection.back = 0
            break;

        case 65: //LEFT
            moveDirection.left = 0
            break;

        case 68: //RIGHT
            moveDirection.right = 0
            break;

        case 32:
            moveDirection.up = 0;
            break;

        case 16:
            moveDirection.down = 0;
            break;
        
        case 13:
            moveDirection.stop = false;
            break;
    }

}

export default setupEventHandlers;