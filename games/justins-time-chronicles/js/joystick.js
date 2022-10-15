function joystick(canvas, radius, widthSize, widthRatio, heightSize, heightRatio, callback) {
    var ctx;
    ctx = canvas.getContext('2d');
    resize();

    canvas.addEventListener('mousedown', startDrawing);
    document.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mousemove', Draw);

    canvas.addEventListener('touchstart', startDrawing);
    document.addEventListener('touchend', stopDrawing);
    document.addEventListener('touchcancel', stopDrawing);
    canvas.addEventListener('touchmove', Draw);
    window.addEventListener('resize', resize);




    var width, height, x_orig, y_orig;
    function resize() {
        width = window.innerWidth / widthSize;
        height = window.innerHeight / heightSize;
        ctx.canvas.width = width;
        ctx.canvas.height = height;
        background();
        joystick(width / widthRatio, height / heightRatio);
    }

    function background() {
        x_orig = width / widthRatio;
        y_orig = height / heightRatio;

        ctx.beginPath();
        ctx.arc(x_orig, y_orig, radius + 20, 0, Math.PI * 2, true);
        ctx.fillStyle = '#ECE5E5';
        ctx.fill();
    }

    function joystick(width, height) {
        ctx.beginPath();
        ctx.arc(width, height, radius, 0, Math.PI * 2, true);
        ctx.fillStyle = '#F08080';
        ctx.fill();
        ctx.strokeStyle = '#F6ABAB';
        ctx.lineWidth = 8;
        ctx.stroke();
    }

    let coord = { x: 0, y: 0 };
    let paint = false;

    function getPosition(event) {
        var mouse_x = event.clientX || event.touches[0].clientX;
        var mouse_y = event.clientY || event.touches[0].clientY;
        coord.x = mouse_x - canvas.offsetLeft;
        coord.y = mouse_y - canvas.offsetTop;
    }

    function is_it_in_the_circle() {
        var current_radius = Math.sqrt(Math.pow(coord.x - x_orig, 2) + Math.pow(coord.y - y_orig, 2));
        if (radius >= current_radius) return true
        else return false
    }


    function startDrawing(event) {
        paint = true;
        getPosition(event);
        console.log(is_it_in_the_circle())
        if (is_it_in_the_circle()) {
            console.log('circle')
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            background();
            joystick(coord.x, coord.y);
            Draw();
        }
    }


    function stopDrawing() {
        paint = false;
        callback(0, 0, 0, 0, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background();
        joystick(width / widthRatio, height / heightRatio);

    }

    function Draw(event) {

        if (paint) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            background();
            var angle_in_degrees, x, y, speed;
            var angle = Math.atan2((coord.y - y_orig), (coord.x - x_orig));

            if (Math.sign(angle) == -1) {
                angle_in_degrees = Math.round(-angle * 180 / Math.PI);
            }
            else {
                angle_in_degrees = Math.round(360 - angle * 180 / Math.PI);
            }


            if (is_it_in_the_circle()) {
                joystick(coord.x, coord.y);
                x = coord.x;
                y = coord.y;
            }
            else {
                x = radius * Math.cos(angle) + x_orig;
                y = radius * Math.sin(angle) + y_orig;
                joystick(x, y);
            }


            getPosition(event);

            speed = Math.round(100 * Math.sqrt(Math.pow(x - x_orig, 2) + Math.pow(y - y_orig, 2)) / radius);

            var x_relative = Math.round(x - x_orig);
            var y_relative = Math.round(y - y_orig);
            callback(angle_in_degrees, x, y, speed, x_relative, y_relative)
        }
    }
}
export default joystick;