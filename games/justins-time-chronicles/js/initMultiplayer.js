import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
function initMultiplayer(playerCallback) {
    const socket = io()
    function uuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
    socket.emit("set username", uuidv4())
    socket.emit("update position", { x: 0, y: 0, z: 0 })
    socket.emit("get players")
    socket.on("players", playerCallback)
    return socket;
}
export default initMultiplayer