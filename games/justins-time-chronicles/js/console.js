function setupConsole() {
    var commands = {}
    commands.ui = {
        element: document.querySelector("#commandUI"),
        header: {
            element: document.querySelector("#commandHeader"),
            closeButton: document.querySelector("#closeButton")
        },
        content: {
            element: document.querySelector("#commandContent"),
            text: document.querySelector("#commandText"),
            input: document.querySelector("#commandInput")
        }
    }
    commands.ui.element.onclick = () => {
        commands.ui.content.input.focus();
    }

    window.addEventListener( 'keydown', (event) => {
        if (event.key == "c") {
            commands.ui.element.style = "display: block"
            commands.ui.content.input.focus();
        }
        return false;
    }, false);

    commands.ui.header.closeButton.onclick = function() {
        commands.ui.element.style = "display: none"
    }

    return commands;
}

export default setupConsole;