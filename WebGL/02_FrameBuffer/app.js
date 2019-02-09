var jWebGL;
var Clicks = [];
var StaticObjectArray = [];
var TransparentStaticObjectArray = [];
var UIStaticObject = [];

// StaticObject
var createStaticObject = function(gl, vertices, faces, vsCode, fsCode, attribParameters, cameraIndex, bufferType, vertexCount, primitiveType)
{
    var vbo = gl.createBuffer();
    var program = CreateProgram(gl, vsCode, fsCode);

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), bufferType);
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

    var ebo = null;
    var elementCount = 0;
    if (faces)
    {
        ebo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int32Array(faces), bufferType);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        elementCount = faces.length;
    }

    var setCameraProperty = function(camera)
    {
        // Update StaticObject Transforms
        var matPos = CreatePosMat4(this.pos.x, this.pos.y, this.pos.z);
        var matRot = CreateRotMat4(this.rot.x, this.rot.y, this.rot.z);
        var matScale = CreateScaleMat4(this.scale.x, this.scale.y, this.scale.z);
        this.matWorld = CloneMat4(matPos).Mul(matRot).Mul(matScale);

        var matMVP = CloneMat4(camera.matViewProjection).Mul(this.matWorld);

        matMVP.Transpose();
        var mpvArray = matMVP.m[0].concat(matMVP.m[1],matMVP.m[2],matMVP.m[3]);

        var mvpLoc = gl.getUniformLocation(this.program, 'MVP');
        gl.uniformMatrix4fv(mvpLoc, false, new Float32Array(mpvArray));
    }

    var setRenderProperty = function()
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        for(var i=0;i<this.attribs.length;++i)
        {
            var attrib = this.attribs[i];
            gl.vertexAttribPointer(attrib.loc,
                attrib.count,
                attrib.type,
                attrib.normalized,
                attrib.stride,
                attrib.offset);
    
            gl.enableVertexAttribArray(attrib.loc);
        }
    }

    var drawFunc = function(camera)
    {
        gl.useProgram(this.program);
    
        if (this.setRenderProperty)
            this.setRenderProperty();
    
        if (this.setCameraProperty)
            this.setCameraProperty(camera);
    
        if (this.ebo)
        {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
            gl.drawElements(this.primitiveType, this.elementCount, gl.UNSIGNED_INT, 0);
        }
        else
        {
            gl.drawArrays(this.primitiveType, 0, this.vertexCount);    
        }
    }

    var matWorld = new jMat4();
    var pos = CreateVec3(0.0, 0.0, 0.0);
    var rot = CreateVec3(0.0, 0.0, 0.0);
    var scale = CreateVec3(1.0, 1.0, 1.0);
    return {vbo:vbo, ebo:ebo, program:program, attribs:attribs, matWorld:matWorld, cameraIndex:cameraIndex, pos:pos
        , rot:rot, scale:scale, vertexCount:vertexCount, elementCount:elementCount, primitiveType:primitiveType
        , updateFunc:null, setRenderProperty:setRenderProperty, setCameraProperty:setCameraProperty, drawFunc:drawFunc};
}

// Framebuffer
var CraeteFramebuffer = function(gl, width, height)
{
    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    var tbo = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tbo);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tbo, 0);

    var rbo = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
    {
        alert('failed to create framebuffer');
        return null;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return {fbo:fbo, tbo:tbo, dbo:rbo};
}

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
        alert('Your browser does not support webgl');

    var ext = gl.getExtension('OES_element_index_uint');        // To use gl.UNSIGNED_INT

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    var FPSElement = document.getElementById("FPS");
    this.fpsNode = document.createTextNode("");
    FPSElement.appendChild(this.fpsNode);

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

    gl.enable(gl.DEPTH_TEST);
    //gl.enable(gl.BLEND);
    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.BLEND);
    gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);

    var matPos = CreatePosMat4(10.0, 20.0, 30.0);
    var matRot = CreateRotMat4(
        DegreeToRadian(10)
        , DegreeToRadian(20)
        , DegreeToRadian(30));
    var matScale = CreateScaleMat4(1, 2, 3);

    // Process Key Event
    var processKeyEvents = function()
    {
        if (KeyState['a']) moveShift(-1, 0);
        if (KeyState['d']) moveShift(1, 0);
        if (KeyState['1']) rotateFowardAxis(0, -0.1);
        if (KeyState['2']) rotateFowardAxis(0, 0.1);
        if (KeyState['3']) rotateUpAxis(0, -0.1);
        if (KeyState['4']) rotateUpAxis(0, 0.1);
        if (KeyState['5']) rotateRightAxis(0, -0.1);
        if (KeyState['6']) rotateRightAxis(0, 0.1);
        if (KeyState['w']) forward(1, 0);
        if (KeyState['s']) forward(-1, 0);
    }

    // Create Cameras
    var mainCamera = CreateCamera(gl, CreateVec3(50.0, 70.0, 46.0), CreateVec3(0.0, 50.0, -50.0), DegreeToRadian(45), 1.0, 500.0, false);
    CreateCamera(gl, CreateVec3(0, 50, 0), CreateVec3(0.0, 50.0, -1.0), DegreeToRadian(40), 5.0, 200.0, true);
    updateCamera(gl, 0);

    // Origin Point Gizmo
    CreateGizmo(gl, StaticObjectArray, CreateVec3(0.0, 0,0, 0.0), CreateVec3(0.0, 0,0, 0.0), CreateVec3(0.0, 0,0, 0.0));

    // Create Coordinate Guide lines
    CreateCoordinateXZObject(gl, StaticObjectArray, mainCamera);
    CreateCoordinateYObject(gl, StaticObjectArray);

    // Create frameBuffer to render at offscreen
    var framebuffer = CraeteFramebuffer(gl, 512, 512);
    CreateUIQuad(gl, UIStaticObject, 10, 10, 300, 300, framebuffer.tbo);

    // Create cube object
    var whiteCube = CreateRectangle(gl, StaticObjectArray, CreateVec3(0, 50, -100), CreateVec3(0, 0, 0), CreateVec3(1, 1, 1)
        , CreateVec3(25, 25, 25), CreateVec4(1, 1, 1, 1));

    var whiteCubeRotation = 0.0;
    whiteCube.updateFunc = function()
    {
        whiteCubeRotation += 1.0;
        whiteCube.rot.x += 0.01;
        whiteCube.rot.y += 0.02;
        whiteCube.rot.z += 0.015;
        whiteCube.pos.x = Math.sin(whiteCubeRotation * 0.01) * 100;
        whiteCube.pos.y = Math.cos(whiteCubeRotation * 0.02) * 20 + 50;
    };

    var redCube = CreateRectangle(gl, StaticObjectArray, CreateVec3(0, 50, -100), CreateVec3(0, 0, 0), CreateVec3(1, 1, 1)
        , CreateVec3(25, 25, 25), CreateVec4(1, 0, 0, 1));

    var redCubeRotation = 0.0;
    redCube.updateFunc = function()
    {
        redCubeRotation += 1.0;
        this.rot.y += 0.01;
        this.pos.x = Math.sin(redCubeRotation * 0.01) * 20;
        this.pos.y = Math.sin(redCubeRotation * 0.01) * 100 + 50;
    };

    var main = this;

    var lastTime = performance.now();
    var loopCount = 0;
    var loop = function()
    {
        // Update time
        var currentTime = performance.now();
        ++loopCount;
        if (currentTime - lastTime > 1000)
        {
            this.fpsNode.nodeValue = loopCount.toFixed(0);
            loopCount = 0;
            lastTime = currentTime;
        }

        processKeyEvents();
        main.Update();

        var prePass = function()
        {
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.fbo);
            gl.viewport(0, 0, 512, 512);
            main.Render(1);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        };

        prePass();

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        main.Render(0);

        // Render To 3D UI
        for(var i=0;i<UIStaticObject.length;++i)
        {
            var obj = UIStaticObject[i];
            if (obj.updateFunc)
                obj.updateFunc();
            if (obj.drawFunc)
                obj.drawFunc(mainCamera);
        }

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

jWebGL.prototype.Update = function()
{
    var gl = this.gl;

    for(var i=0;i<Cameras.length;++i)
    {
        updateCamera(gl, i);
        updateCameraFrustum(gl, i);
    }

    for(var i = 0;i<StaticObjectArray.length;++i)
    {
        if (StaticObjectArray[i].updateFunc)
            StaticObjectArray[i].updateFunc();
    }

    for(var i = 0;i<TransparentStaticObjectArray.length;++i)
    {
        if (TransparentStaticObjectArray[i].updateFunc)
            TransparentStaticObjectArray[i].updateFunc();
    }
}

jWebGL.prototype.Render = function(cameraIndex)
{
    var gl = this.gl;
    var camera = Cameras[cameraIndex];

    gl.clearColor(0.5, 0.5, 0.5, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for(var i = 0;i<StaticObjectArray.length;++i)
        StaticObjectArray[i].drawFunc(camera);

    for(var i = 0;i<TransparentStaticObjectArray.length;++i)
        TransparentStaticObjectArray[i].drawFunc(camera);
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
