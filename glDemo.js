//////////////////////////////////////////
//// WEBGL MECHANICS HELPER FUNCTIONS ////
//////////////////////////////////////////
function createShaderObject(gl, shaderSource, shaderType) {
    // Create a shader object of the requested type
    var shaderObject = gl.createShader(shaderType);
    // Pass the source code to the shader object
    gl.shaderSource(shaderObject, shaderSource);
    // Compile the shader
    gl.compileShader(shaderObject);

    // Check if there were any compile errors
    if (!gl.getShaderParameter(shaderObject, gl.COMPILE_STATUS)) {
        // If so, get the error and output some diagnostic info
        // Add some line numbers for convenience
        var lines = shaderSource.split("\n");
        for (var i = 0; i < lines.length; ++i)
            lines[i] = ("   " + (i + 1)).slice(-4) + " | " + lines[i];
        shaderSource = lines.join("\n");

        throw new Error(
            (shaderType == gl.FRAGMENT_SHADER ? "Fragment" : "Vertex") + " shader compilation error for shader '" + name + "':\n\n    " +
            gl.getShaderInfoLog(shaderObject).split("\n").join("\n    ") +
            "\nThe shader source code was:\n\n" +
            shaderSource);
    }

    return shaderObject;
}

function createShaderProgram(gl, vertexSource, fragmentSource) {
    // Create shader objects for vertex and fragment shader
    var   vertexShader = createShaderObject(gl,   vertexSource, gl.  VERTEX_SHADER);
    var fragmentShader = createShaderObject(gl, fragmentSource, gl.FRAGMENT_SHADER);

    // Create a shader program
    var program = gl.createProgram();
    // Attach the vertex and fragment shader to the program
    gl.attachShader(program,   vertexShader);
    gl.attachShader(program, fragmentShader);
    // Link the shaders together into a program
    gl.linkProgram(program);

    return program;
}

function createVertexBuffer(gl, vertexData) {
    // Create a buffer
    var vbo = gl.createBuffer();
    // Bind it to the ARRAY_BUFFER target
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    // Copy the vertex data into the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    // Return created buffer
    return vbo;
}

function createIndexBuffer(gl, indexData) {
    // Create a buffer
    var ibo = gl.createBuffer();
    // Bind it to the ELEMENT_ARRAY_BUFFER target
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    // Copy the index data into the buffer
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
    // Return created buffer
    return ibo;
}

/////////////////////////////////
//// SOURCE CODE FOR SHADERS ////
/////////////////////////////////
var VertShaderSource = `
    // TODO 2.2: Declare the uniform variable Matrix as a mat4 here:

    attribute vec3 Position;
    // TODO 3.3: Declare the Color attribute.

    // TODO 3.4: Declare a varying called vColor

    void main() {

        // TODO 2.3: Change the following line so the gl_Position
        // gets the product of Matrix and the Position attribute
        gl_Position = vec4(Position, 1.0);

        // TODO 3.5: Store the color attribute's value in the color varying

    }
`;
var FragShaderSource = `
    precision highp float; // use highest available precision for floats

    // TODO 3.6: Declare the varying for color

    void main() {

        // TODO 1: Set gl_FragColor to black instead of white
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

        // TODO 3.7: Set gl_FragColor to the interpolated value passed
        // in from the rasterizer.

    }
`;


////////////////////////
//// TRIANGLE CODE ////
////////////////////////
var Triangle = function(gl, vertexPositions, vertexColors, indices, vertexSource, fragmentSource) {
    // Create OpenGL buffers for the vertex and index data of the triangle
    this.positionVbo = createVertexBuffer(gl, vertexPositions);
    this.indexIbo = createIndexBuffer(gl, indices);

    // TODO 3.1 - create a vertex buffer for the color data contained in vertexColors

    // Create the shader program that will render the triangle
    this.shaderProgram = createShaderProgram(gl, vertexSource, fragmentSource);

    // Store the number of indices for later
    this.indexCount = indices.length;
}

Triangle.prototype.render = function(gl, matrix) {

    // Bind shader program
    gl.useProgram(this.shaderProgram);

    // TODO 2.1 - uncomment these two lines of code to pass the matrix to the
    // shader as a uniform. The matrix is transposed to convert from row-major
    // to column-major.
    //var Matrix_loc = gl.getUniformLocation(this.shaderProgram, "Matrix");
    //gl.uniformMatrix4fv(Matrix_loc, false, matrix.transpose().m);

    // Bind the vertex and index buffers with our triangle positions
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionVbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexIbo);

    // OpenGL boiler plate: link position attribute and buffer correctly
    var positionAttrib = gl.getAttribLocation(this.shaderProgram, "Position");
    if (positionAttrib >= 0) {
        gl.enableVertexAttribArray(positionAttrib);
        gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, false, 0, 0);
    }

    // TODO 3.2: Bind the color VBO and link it to the Color attribute

    // Draw the triangle!
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
}

/////////////////////////////
//// GLDEMO - main code  ////
/////////////////////////////
var glDemo = function(canvas, gl)
{
    // vertex data for a single triangle
    var vertices = [
        0.2,  0.5, 0.0,
       -0.5, -0.5, 0.0,
        0.8, -0.4, 0.0
    ];

    // color data for each vertex
    var colors = [
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0
    ];

    // index data for a single triangle
    var indices = [0,1,2];

    this.tri = new Triangle(gl, vertices, colors, indices, VertShaderSource, FragShaderSource);

    gl.enable(gl.DEPTH_TEST); // turn on z buffering
}

glDemo.prototype.render = function(canvas, gl, w, h)
{
    // set the background color to white
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // clear the color and the depth framebuffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // basic matrix class, defined in matrix.js (same as used in A3)
    var matrix = new SimpleMatrix();

    // TODO 2.4: Adjust the translation component to make the triangle
    // fit back inside the canvas.
    matrix.m = [1.5, 0.0, 0.0, 0.0,
                0.0, 1.5, 0.0, 0.0,
                0.0, 0.0, 1.5, 0.0,
                0.0, 0.0, 0.0, 1.0];

    this.tri.render(gl, matrix);
}

