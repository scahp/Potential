var jWebGL;
var KeyState = [];
var Clicks = [];
var Cameras = [];

var createStaticObject = function(gl, vertices, vsCode, fsCode, attribParameters, cameraIndex)
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

    var matWorld = new jMat4();
    var pos = CreateVec3(0.0, 0.0, 0.0);
    var rot = CreateVec3(0.0, 0.0, 0.0);
    var scale = CreateVec3(1.0, 1.0, 1.0);
    return {vbo:vbo, program:program, attribs:attribs, matWorld:matWorld, cameraIndex:cameraIndex, pos:pos, rot:rot, scale:scale};
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

var rotation = 0.0;

var drawStaticObject = function(gl, StaticObject)
{
    bindAttribPointer(gl, StaticObject);
    gl.useProgram(StaticObject.program);

    ////////////////////////////////////////////
    // Update StaticObject Transforms
    rotation += 1.0;

    StaticObject.rot.y = DegreeToRadian(rotation) * 5;
    StaticObject.rot.z = DegreeToRadian(rotation);
    StaticObject.pos.x = Math.sin(rotation*0.01) * 20.0;
    StaticObject.pos.y = Math.sin(rotation*0.05) * 10.0;

    var matPos = CreatePosMat4(StaticObject.pos.x, StaticObject.pos.y, StaticObject.pos.z, 1.0);
    var matRot = CreateRotMat4(StaticObject.rot.x, StaticObject.rot.y, StaticObject.rot.z);
    var matScale = CreateScaleMat4(StaticObject.scale.x, StaticObject.scale.y, StaticObject.scale.z);
    var temp = new jMat4();
    multi(temp, matRot, matScale);
    multi(StaticObject.matWorld, matPos, temp);

    var matMVP = new jMat4();
    multi(matMVP, Cameras[StaticObject.cameraIndex].matViewProjection, StaticObject.matWorld);

    matMVP.transpose();
    var mpvArray = matMVP.m[0].concat(matMVP.m[1],matMVP.m[2],matMVP.m[3]);
    
    var mvpLoc = gl.getUniformLocation(StaticObject.program, 'MVP');
    gl.uniformMatrix4fv(mvpLoc, false, new Float32Array(mpvArray));
    ////////////////////////////////////////////

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);    
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

var OnKeyDown = function(e)
{
    console.log('KeyDown : ' + e.key);
    KeyState[e.key] = 1;
}

var OnKeyUp = function(e)
{
    console.log('KeyUp : ' + e.key);
    KeyState[e.key] = 0;
}

var OnMouseMove = function(e)
{
    console.log('MouseMove : (' + e.movementX + ', ' + e.movementY + ')');

    if (Clicks[0])
    {
        Cameras[0].rot.y += e.movementX * 0.01;
        Cameras[0].rot.x += e.movementY * 0.01;
    }
}

var OnClick = function(e)
{
    console.log('Click : ' + e.button);
}

var OnMouseButtonUp = function(e)
{
    console.log('MouseButtonUp : ' + e.button);
    Clicks[0] = 0;
}

var OnMouseButtonDown = function(e)
{
    console.log('MouseButtonDown : ' + e.button);
    Clicks[0] = 1;
}

var OnTouchStart = function(e)
{
    alert('OnTouchStart');
    console.log('TouchStart : ' + e.button);
    Clicks[0] = 0;
}

var OnTouchEnd = function(e)
{
    console.log('TouchEnd : ' + e.button);
    Clicks[0] = 1;
}

var OnTouchMove = function(e)
{
    console.log('TouchMove : (' + e.movementX + ', ' + e.movementY + ')');

    if (Clicks[0])
    {
        Cameras[0].rot.y += e.movementX * 0.01;
        Cameras[0].rot.x += e.movementY * 0.01;
    }
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

    var matPos = CreatePosMat4(10, 20, 30);
    var matRot = CreateRotMat4(
        DegreeToRadian(10)
        , DegreeToRadian(20)
        , DegreeToRadian(30));
    var matScale = CreateScaleMat4(1, 2, 3);

    {
        var scale = 10.0;
        var vertices = [
            -0.5*scale, -0.5*scale, 0.0,    0, 0, 1,
            -0.5*scale, 0.5*scale, 0.0,     1, 0, 0,
            0.5*scale, 0.5*scale, 0.0,      1, 1, 1,
        ];

        var attrib0 = createAttribParameter('Pos', 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 6, 0);
        var attrib1 = createAttribParameter('Color', 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 6, Float32Array.BYTES_PER_ELEMENT * 3);
        var newStaticObject = createStaticObject(gl, vertices, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1], 0);

        newStaticObject.pos = CreateVec3(10.0, 10.0, -20.0);
        newStaticObject.rot = CreateVec3(0.0, 0.0, DegreeToRadian(rotation));
        newStaticObject.scale = CreateVec3(1.0, 1.0, 1.0);
        StaticObjectArray.push(newStaticObject);
    }

    var updateCamera = function(cameraIndex)
    {        
        var eye = CreateVec3(Cameras[cameraIndex].pos.x, Cameras[cameraIndex].pos.y, Cameras[cameraIndex].pos.z);
        var target = CreateVec3(eye.x, eye.y, eye.z - 1.0);
        var up = CreateVec3(0.0, 1.0, 0.0);

        var rot = Cameras[cameraIndex].rot;

        var matRot = CreateRotMat4(rot.x, rot.y, rot.z);
        eye.Transform(matRot);
        target.Transform(matRot);
        up.Transform(matRot);

        Cameras[cameraIndex].matView = CreateViewMatrix(eye, target, up);
        Cameras[cameraIndex].matProjection = CreatePerspectiveMatrix(gl.canvas.width, gl.canvas.height, DegreeToRadian(45), 100.0, 1.0);
        multi(Cameras[cameraIndex].matViewProjection, Cameras[cameraIndex].matProjection, Cameras[cameraIndex].matView);
    }

    var eye = CreateVec3(0.0, 0.0, 0.0);
    var target = CreateVec3(0.0, 0.0, -1.0);
    var up = CreateVec3(0.0, 1.0, 0.0);
    var matView = CreateViewMatrix(eye, target, up);
    var matProjection = CreatePerspectiveMatrix(gl.canvas.width, gl.canvas.height, DegreeToRadian(45), 100.0, 1.0);
    
    var rot = CreateVec3(0.0, 0.0, 0.0);

    var matMV = new jMat4();
    multi(matMV, matProjection, matView);
    Cameras.push({matView:matView, matProjection:matProjection, matViewProjection:matMV, pos:eye, rot:rot});

    updateCamera(0);

    var t = this;

    var loop = function()
    {
        if (KeyState['a'])
        {
            Cameras[0].pos.x -= 1.0;
        }
        else if (KeyState['d'])
        {
            Cameras[0].pos.x += 1.0;
        }
        else if (KeyState['q'])
        {
            Cameras[0].pos.y -= 1.0;
        }
        else if (KeyState['e'])
        {
            Cameras[0].pos.y += 1.0;
        }
        else if (KeyState['w'])
        {
            Cameras[0].pos.z -= 1.0;
        }
        else if (KeyState['s'])
        {
            Cameras[0].pos.z += 1.0;
        }

        updateCamera(0);
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
