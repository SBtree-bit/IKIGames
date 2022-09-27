

function setupEventHandlers(moveDirection){

    window.addEventListener( 'keydown', (event) => {handleKeyDown(event, moveDirection)}, false);
    window.addEventListener( 'keyup', (event) => {handleKeyUp(event, moveDirection)}, false);
}


function handleKeyDown(event, moveDirection){

    let keyCode = event.keyCode;

    switch(keyCode){

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