var jWebGL;

var Init = function()
{
    console.log('init function start');

    var canvas = document.getElementById('webgl-surface');
    var gl = canvas.getContext('webgl');
    if (!gl)
    {
        console.log('webgl not supported');
        gl = canvas.getContext('experimental-webgl');
    }

    if (!gl)
    {
        alert('Your browser does not support webgl');
    }

    jWebGL = new jWebGL(gl);
    jWebGL.Init();
}

var jWebGL = function(gl)
{
    this.gl = gl;
}

jWebGL.prototype.Init = function()
{
    var gl = this.gl;

    window.addEventListener('resize', this.OnResizeWindow.bind(this));

    this.OnResizeWindow();
    
    this.program = CreateProgram(gl, 'shaders/vs.glsl', 'shaders/fs.glsl');

    var vertices = [
        0, 1, 0, 0,
        1, 0, 1, 0,
        2, 0, 0, 1,
        3, 1, 1, 1
    ];

    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var t = this;

    var loop = function()
    {
        t.Render();
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

jWebGL.prototype.Render = function()
{
    var gl = this.gl;

    gl.clearColor(0.5, 0.5, 0.5, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var vertexIDAttribLoc = gl.getAttribLocation(this.program, 'VertexID');
    var colorAttribLoc = gl.getAttribLocation(this.program, 'Color');

    gl.vertexAttribPointer(vertexIDAttribLoc,
        1,
        gl.FLOAT,
        gl.FALSE,
        Float32Array.BYTES_PER_ELEMENT * 4,
        0);
    
    gl.vertexAttribPointer(colorAttribLoc,
        3,
        gl.FLOAT,
        gl.FALSE,
        Float32Array.BYTES_PER_ELEMENT * 4,
        Float32Array.BYTES_PER_ELEMENT * 1);
    
    gl.enableVertexAttribArray(vertexIDAttribLoc);
    gl.enableVertexAttribArray(colorAttribLoc);

    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

jWebGL.prototype.OnResizeWindow = function()
{
    var gl = this.gl;

    var offsetX = 0;
    var offsetY = 0;

    if (window.innerWidth > window.innerHeight)
    {
        gl.canvas.height = window.innerHeight;
        gl.canvas.width = window.innerHeight;

        gl.canvas.style.left = (window.innerWidth - window.innerHeight) / 2;
    }
    else
    {
        gl.canvas.width = window.innerWidth;
        gl.canvas.height = window.innerWidth;
        
        gl.canvas.style.top = (window.innerHeight - window.innerWidth) / 2;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}