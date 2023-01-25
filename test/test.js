function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));  // eslint-disable-line
    gl.deleteShader(shader);
    return undefined;
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));  // eslint-disable-line
    gl.deleteProgram(program);
    return undefined;
}

async function main() {
    var canvas = document.querySelector("#c");
    var gl = canvas.getContext("webgl2");
    if (!gl) {
        console.log("There is a problem with your webgl-version: -no webgl2 available");
    }
    var reader = new FileReader();
    reader.onload = function (event) {
        console.log('File content:', event.target.result);
    };

    var one = await fetch("./shader/test.vert",  {cache: "no-store"})
    var vertexShaderSource = await one.text()

    one = await fetch("./shader/test.frag",  {cache: "no-store"})
    var fragmentShaderSource = await one.text()

    console.log(vertexShaderSource);
    console.log(fragmentShaderSource);


    // create GLSL shaders, upload the GLSL source, compile the shaders
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Link the two shaders into a program
    var program = createProgram(gl, vertexShader, fragmentShader);

    // look up where the vertex data needs to go.
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    // Create a buffer and put three 2d clip space points in it
    var positionBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var positions = [
        0, 0, 0,
        0, 0.15, 0.15,
        0.17, 0, 0.17,
        0.2, 0.2, 0.2,
        0.4, 0.2, 0.2,
        0.2, 0.5, 0.2,    
        0.2, 0.2, 0.2,
        0.7, 0.6, 0.6,
        0.6, 0.7, 0.7,
          
        -0.6, -0.6, -0.6,
        -0.7, -0.6, -0.6,
        -0.6, -0.7, -0.7
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Create a vertex array object (attribute state)
    var vao = gl.createVertexArray();

    // and make it the one we're currently working with
    gl.bindVertexArray(vao);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionAttributeLocation, size, type, normalize, stride, offset);

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    // draw
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = positions.length / 3;
    gl.drawArrays(primitiveType, offset, count);
}

main()

