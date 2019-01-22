var jWebGL;

var createStaticObject = function(gl, vertices, vsCode, fsCode, attribParameters)
{
    var vbo = gl.createBuffer();
    var program = CreateProgram(gl, 'shaders/vs.glsl', 'shaders/fs.glsl');

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var attribs = [];
    for(var i=0;i<attribParameters.length;++i)
    {
        var attr = attribParameters[i];

        var loc = gl.getAttribLocation(program, attr.name);
        attribs[i] = { name:attr.name
            , loc:loc
            , count:attr.count
            , type:attr.type
            , normalized:attr.normalized
            , stride:attr.stride
            , offset:attr.offset };
    }

    return {vbo:vbo, program:program, attribs:attribs};
}

var createAttribParameter = function(name, count, type, normalized, stride, offset)
{
    return { name:name, count:count, type:type, normalized:normalized, stride:stride, offset:offset };
}

var bindAttribPointer = function(gl, StaticObject)
{
    gl.bindBuffer(gl.ARRAY_BUFFER, StaticObject.vbo);
    for(var i=0;i<StaticObject.attribs.length;++i)
    {
        var attrib = StaticObject.attribs[i];
        gl.vertexAttribPointer(attrib.loc,
            attrib.count,
            attrib.type,
            attrib.normalized,
            attrib.stride,
            attrib.offset);

        gl.enableVertexAttribArray(attrib.loc);
    }
}

var drawStaticObject = function(gl, StaticObject)
{
    bindAttribPointer(gl, StaticObject);

    gl.useProgram(StaticObject.program);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);    
}

var StaticObjectArray = [];

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
    
    // ObjectA
    {
        var vertices = [
            // VertexID     Color           Offset          Scale
            2,              0, 0, 1,        0.3, 0.3,       0.6,
            0,              1, 0, 0,        0.3, 0.3,       0.6,
            3,              1, 1, 1,        0.3, 0.3,       0.6,
            1,              0, 1, 0,        0.3, 0.3,       0.6,
        ];

        var attrib0 = createAttribParameter('VertexID', 1, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 7, 0);
        var attrib1 = createAttribParameter('Color', 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 7, Float32Array.BYTES_PER_ELEMENT * 1);
        var attrib2 = createAttribParameter('Offset', 2, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 7, Float32Array.BYTES_PER_ELEMENT * 4);
        var attrib3 = createAttribParameter('Scale', 1, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 7, Float32Array.BYTES_PER_ELEMENT * 6);
        StaticObjectArray.push(createStaticObject(gl, vertices, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1, attrib2, attrib3]));
    }

    // ObjectB
    {
        var vertices = [
            // VertexID     Color           Offset          Scale
            0,              1, 0, 0,        -0.3, -0.3,     0.3,
            1,              0, 1, 0,        -0.3, -0.3,     0.3,
            2,              0, 0, 1,        -0.3, -0.3,     0.3,
            3,              1, 1, 1,        -0.3, -0.3,     0.3,
        ];

        var attrib0 = createAttribParameter('VertexID', 1, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 7, 0);
        var attrib1 = createAttribParameter('Color', 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 7, Float32Array.BYTES_PER_ELEMENT * 1);
        var attrib2 = createAttribParameter('Offset', 2, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 7, Float32Array.BYTES_PER_ELEMENT * 4);
        var attrib3 = createAttribParameter('Scale', 1, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 7, Float32Array.BYTES_PER_ELEMENT * 6);
        StaticObjectArray.push(createStaticObject(gl, vertices, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1, attrib2, attrib3]));
    }

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

    for(var i = 0;i<StaticObjectArray.length;++i)
        drawStaticObject(gl, StaticObjectArray[i]);
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