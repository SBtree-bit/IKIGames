import getControls from "./gamepad.js";
import * as THREE from 'three';
import joystick from './joystick.js';
import { CompressedTextureLoader } from "three";

function setupEventHandlers(moveDirection, camera, fpCamera, tpCamera, playerTrans) {
    moveDirection.control_lookup = {"forward": "w", "back": "s"}

    window.addEventListener('keydown', (event) => { handleKeyDown(event, moveDirection, camera, fpCamera, tpCamera, playerTrans,moveDirection.control_lookup) }, false);
    window.addEventListener('keyup', (event) => { handleKeyUp(event, moveDirection) }, false);
    window.addEventListener('mousedown', (event) => {handleMouseDown(event, moveDirection)}, false)
    window.addEventListener('mouseup', (event) => {handleMouseUp(event, moveDirection)}, false)
    document.addEventListener("mousemove", (event) => {
        moveDirection.mouseX = event.clientX;
        moveDirection.mouseY = event.clientY;
    })

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

    document.querySelector("#settingsButton").addEventListener('mousedown', settingsToggle);
    document.querySelector("#settingsButton").addEventListener('touchstart', settingsToggle);
    registerControlMenu(moveDirection.control_lookup)


    function mouseDown() {moveDirection.up = 1;}
    function mouseUp() {moveDirection.up = 0;}

    function settingsToggle() {
        if (moveDirection.settings) {
            hideSettings()
        } else {
            showSettings()
        }
    }

    function showSettings() {
        document.querySelector("#settingsUI").style.display = "inline"
        moveDirection.settings = true
    }
    function hideSettings() {
        document.querySelector("#settingsUI").style.display = "none"
        moveDirection.settings = false
    }

}

function registerControlMenu(control_lookup) {
    document.querySelectorAll(".control_switcher").forEach((elem) => {
        elem.innerHTML = control_lookup[elem.id]
        elem.onclick = async function() {
            control_lookup.stop = true
            let key = await waitingKeypress()
            console.log(key)
            control_lookup[this.id] = key
            this.innerHTML = key
        }
    })
}

function waitingKeypress() {
    return new Promise((resolve) => {
      document.addEventListener('keydown', onKeyHandler);
      function onKeyHandler(e) {
        document.removeEventListener('keydown', onKeyHandler);
        resolve(e.key);
      }
    });
  }

function handleMouseDown(event, moveDirection) {
    if (inventoryState != "items" && inventoryState != "categories")moveDirection.clicked = true
}

function handleMouseUp(event, moveDirection) {
    if (inventoryState != "items") moveDirection.clicked = false
    else {
        let overElements = document.elementsFromPoint(moveDirection.mouseX, moveDirection.mouseY)
        try {
            let arr_val = parseInt(overElements[1].id.replace("slot", "")) - 1
            console.log(arr_val)
            if(overElements[1].id == "slotMain") {
                inventory.mainItems[inventoryCategory] = takenItem
            }
            else if (isNaN(arr_val)) throw new TypeError()
            inventory.slotObj[inventoryCategory][arr_val] = takenItem
        } catch(e) {
            console.log(e)
            if (!takenItem) return
            if (takenFrom != "main") {
                inventory.slotObj[inventoryCategory][takenFrom] = takenItem
            } else {
                inventory.main[inventoryCategory] = takenItem
            }
        } finally {
            document.getElementById("floating").src = ""
        }
    }
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
        if (controls.buttons.includes("A")) {
            moveDirection.space = true;
            if (moveDirection.isStillJumping) return
            moveDirection.up = 1
            moveDirection.isStillJumping = true
        }
        if (controls.buttons.includes("B")) {
            moveDirection.clicked = true
        } else {
            moveDirection.clicked = false
        }
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


function handleKeyDown(event, moveDirection, camera, fpCamera, tpCamera, control_lookup) {
    //location.replace("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    console.log(moveDirection.control_lookup)
    let keyCode = event.keyCode;
    moveDirection.isStillJumping = false;
    if (keyCode < 57 && keyCode > 48) {
        previousHotbarSelected = currentHotbarSelected
        currentHotbarSelected = keyCode - 48
        hotbarSelectedChanged = true
    }
    if(!moveDirection.control_lookup.stop) {
        console.log(moveDirection.control_lookup.forward)
        switch(event.key) {
            case moveDirection.control_lookup.forward:
                moveDirection.forward = 10
                break;
            case moveDirection.control_lookup.back:
                moveDirection.back = 10
                break;
        }
    } else {
        moveDirection.control_lookup.stop = false
    }
    switch(keyCode){
        case 69:
            if (inventoryState == "categories" || inventoryState == "items") {
                inventoryState = "disabled"
            } else {
                inventoryState = "categories"
            }
            break
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
        case 72:
            if (inventoryState == "hotbar") {
                inventoryState = "disabled"
            } else {
                inventoryState = "hotbar"
            }

        case 65: //A: LEFT
            moveDirection.left = 0.1
            break;

        case 68: //D: RIGHT
            moveDirection.right = 0.1
            break;
        
        case 32:
            moveDirection.space = true;
            if (moveDirection.isStillJumping) break
            moveDirection.up = 1
            moveDirection.isStillJumping = true
            break;

        case 16:
            moveDirection.down = 1;
            break;
    }
}


function handleKeyUp(event, moveDirection){
    let keyCode = event.keyCode;

    if(!moveDirection.control_lookup.stop) {
        console.log(moveDirection.control_lookup.forward)
        switch(event.key) {
            case moveDirection.control_lookup.forward:
                moveDirection.forward = 0
                break;
            case moveDirection.control_lookup.back:
                moveDirection.back = 0;
                break;
        }
    } else {
        moveDirection.control_lookup.stop = false
    }

    switch(keyCode){

        case 65: //LEFT
            moveDirection.left = 0
            break;

        case 68: //RIGHT
            moveDirection.right = 0
            break;

        case 32:
            moveDirection.space = false
            moveDirection.up = 0;
            break;

        case 16:
            moveDirection.down = 0;
            break;
    }

}

export default setupEventHandlers;