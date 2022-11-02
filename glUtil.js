function setupGL(canvasId, taskFunction) {
    var canvas = document.getElementById(canvasId);

    try {
        var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    } catch (e) {}
    if (!gl) {
        console.log("Could not initialise WebGL");
        return;
    }

    var renderWidth = 300;
    var renderHeight = 300;
    canvas.width = renderWidth;
    canvas.height = renderHeight;
    gl.viewport(0, 0, renderWidth, renderHeight);

    var task = new taskFunction(canvas, gl);

    var renderLoop = function() {
        task.render(canvas, gl, renderWidth, renderHeight);
        window.requestAnimationFrame(renderLoop);
    }
    window.requestAnimationFrame(renderLoop);

    return task;
}
