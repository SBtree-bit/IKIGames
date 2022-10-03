
/*
const gamepadAPI = {
    controller: {},
    turbo: false,
    connect(evt) {
        gamepadAPI.controller = evt.gamepad;
        gamepadAPI.turbo = true;
        console.log('Gamepad connected.');
      },
      disconnect(evt) {
        gamepadAPI.turbo = false;
        delete gamepadAPI.controller;
        console.log('Gamepad disconnected.');
      },
      update() {
        // Clear the buttons cache
        gamepadAPI.buttonsCache = [];
      
        // Move the buttons status from the previous frame to the cache
        for (let k = 0; k < gamepadAPI.buttonsStatus.length; k++) {
          gamepadAPI.buttonsCache[k] = gamepadAPI.buttonsStatus[k];
        }
      
        // Clear the buttons status
        gamepadAPI.buttonsStatus = [];
      
        // Get the gamepad object
        const c = gamepadAPI.controller || {};
      
        // Loop through buttons and push the pressed ones to the array
        const pressed = [];
        if (c.buttons) {
          for (let b = 0; b < c.buttons.length; b++) {
            if (c.buttons[b].pressed) {
                console.log(gamepadAPI.buttons[b])
              pressed.push(gamepadAPI.buttons[b]);
            }
          }
        }

        console.log(c.buttons[0].pressed ? "A Button Pressed": "A Button Not Pressed")        
      
        // Loop through axes and push their values to the array
        const axes = [];
        if (c.axes) {
          for (let a = 0; a < c.axes.length; a++) {
            axes.push(c.axes[a].toFixed(2));
          }
        }
      
        // Assign received values
        gamepadAPI.axesStatus = axes;
        gamepadAPI.buttonsStatus = pressed;
        requestAnimationFrame(gamepadAPI.update)
      
        // Return buttons for debugging purposes
        return pressed;
      },
      buttonPressed(button, hold) {
        let newPress = false;
      
        // Loop through pressed buttons
        for (let i = 0; i < gamepadAPI.buttonsStatus.length; i++) {
          // If we found the button we're looking for
          if (gamepadAPI.buttonsStatus[i] === button) {
            // Set the boolean variable to true
            newPress = true;
      
            // If we want to check the single press
            if (!hold) {
              // Loop through the cached states from the previous frame
              for (let j = 0; j < gamepadAPI.buttonsCache.length; j++) {
                // If the button was already pressed, ignore new press
                newPress = (gamepadAPI.buttonsCache[j] !== button);
              }
            }
          }
        }
        return newPress;
      },
    buttons: [
        'A','B','X','Y',
        'LB','RB','LT','RT',
        'Address Bar','Menu','LStick','RStick','DPad-Up','DPad-Down','DPad-Left',
        'DPad-Right', 'Logo'
      ],
    buttonsCache: [],
    buttonsStatus: [],
    axesStatus: [],
  };

  window.addEventListener("gamepadconnected", gamepadAPI.connect);
  window.addEventListener("gamepaddisconnected", gamepadAPI.disconnect);
  setInterval(gamepadAPI.update, 100)*/
  ///*
  setInterval(() => {
	const myGamepad = navigator.getGamepads()[0]; // use the first gamepad
	console.log(`Left stick at (${myGamepad.axes[0]}, ${myGamepad.axes[1]})` );
	console.log(`Right stick at (${myGamepad.axes[2]}, ${myGamepad.axes[3]})` );
    console.log(myGamepad.buttons[0].pressed ? "A Button Pressed": "A Button Not Pressed")
}, 100) // print axes 10 times per second//*/
