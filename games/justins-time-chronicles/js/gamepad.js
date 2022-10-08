function getControls(controllerIDX) {
    var buttons = []
    var joysticks = {"L": {"x": 0, "y": 0}, "R": {"x": 0, "y": 0}}
    var pad = navigator.getGamepads()[controllerIDX]
    joysticks.L.x = pad.axes[0]
    joysticks.R.x = pad.axes[2]
    joysticks.L.y = pad.axes[1]
    joysticks.R.y = pad.axes[3]
    var buttonsMapping = [
        'A','B','X','Y',
        'L','R','ZL','ZR',
        '-','+',
        'LStick','RStick',
        'DPad-Up','DPad-Down','DPad-Left','DPad-Right', 
        'Home'
      ]
    for (var i = 0; i < pad.buttons.length; i++) {
        if(pad.buttons[i].pressed) {
            buttons.push(buttonsMapping[i])
        }
    }
    var output = {buttons, joysticks}
    return output;
}
export default getControls;