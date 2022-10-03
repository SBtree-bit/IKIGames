import getControls from "./gamepad.js";
import * as THREE from 'three';

function setupEventHandlers(moveDirection, camera) {

    window.addEventListener('keydown', (event) => { handleKeyDown(event, moveDirection) }, false);
    window.addEventListener('keyup', (event) => { handleKeyUp(event, moveDirection) }, false);

    setInterval(() => { gamepadControls(moveDirection, camera) }, 50)

}

function gamepadControls(moveDirection, camera) {
    if (navigator.getGamepads()[0]) {
        moveDirection.stop = false;
        var controls = getControls(0)
        moveDirection.back = controls.joysticks.R.y * 0.1;
        moveDirection.left = controls.joysticks.R.x * 0.1;
        //camera.rotation.y -= controls.joysticks.L.x * 0.1;
        moveDirection.up = controls.buttons.includes("ZR") ? 1 : 0
        moveDirection.down = controls.buttons.includes("ZL") ? 1 : 0
        if (controls.buttons.includes("ZR") && controls.buttons.includes("ZL")) {moveDirection.stop = true}
        if (controls.buttons.includes("Home")) location.reload()
        //camera.rotation.x -= movementY * 0.002;
        //camera.rotation.x = Math.max((Math.PI / 2) - Math.PI, Math.min((Math.PI / 2) - 0, movementY))
        var _euler = new THREE.Euler(0, 0, 0, "YXZ")
        const movementX = controls.joysticks.L.x;
        const movementY = controls.joysticks.L.y;

        _euler.setFromQuaternion(camera.quaternion);

        _euler.y -= movementX * 0.1;
        _euler.x -= movementY * 0.1;

        var _PI_2 = Math.PI / 2;

        _euler.x = Math.max(_PI_2 - Math.PI, Math.min(_PI_2 - 0, _euler.x));

        camera.quaternion.setFromEuler(_euler);
    }
}


function handleKeyDown(event, moveDirection) {

    let keyCode = event.keyCode;

    switch (keyCode) {

        case 87: //W: FORWARD
            moveDirection.forward = 0.1
            break;

        case 83: //S: BACK
            moveDirection.back = 0.1
            break;

        case 65: //A: LEFT
            moveDirection.left = 0.1
            break;

        case 68: //D: RIGHT
            moveDirection.right = 0.1
            break;

        case 32:
            moveDirection.up = 1;
            break;

        case 16:
            moveDirection.down = 1;
            break;

        case 13:
            moveDirection.stop = true;
            break;
    }
}


function handleKeyUp(event, moveDirection) {
    let keyCode = event.keyCode;

    switch (keyCode) {
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