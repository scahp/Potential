var jWebGL;
var Clicks = [];
var StaticObjectArray = [];
var TransparentStaticObjectArray = [];
var UIStaticObject = [];
var arrowSegment = null;
var intersectionPoint = null;
var quad = null;
var quadRot = CreateVec3(0.0, 0.0, 0.0);
var updateIntersection = null;
var sphere = null
var box = null;

// StaticObject
var createStaticObject = function(gl, attribDesc, attribParameters, faceInfo, cameraIndex, vertexCount, primitiveType)
{
    var shader = [];
    GetShaderFromAttribDesc(shader, attribDesc);

    var program = CreateProgram(gl, shader.vs, shader.fs);

    var attribs = [];
    for(var i=0;i<attribParameters.length;++i)
    {
        var attr = attribParameters[i];

        var vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attr.datas), attr.bufferType);
    
        var loc = gl.getAttribLocation(program, attr.name);
        attribs[i] = { name:attr.name
            , loc:loc
            , vbo:vbo
            , count:attr.count
            , type:attr.type
            , normalized:attr.normalized
            , stride:attr.stride
            , offset:attr.offset };
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var ebo = null;
    var elementCount = 0;
    if (faceInfo)
    {
        ebo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int32Array(faceInfo.faces), faceInfo.bufferType);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        elementCount = faceInfo.faces.length;
    }

    var setCameraProperty = function(camera)
    {
        // Update StaticObject Transforms
        var matPos = CreatePosMat4(this.pos.x, this.pos.y, this.pos.z);
        var matRot = CreateRotMat4(this.rot.x, this.rot.y, this.rot.z);
        var matScale = CreateScaleMat4(this.scale.x, this.scale.y, this.scale.z);
        this.matWorld = matPos.Clone().Mul(matRot).Mul(matScale);

        var matMVP = camera.matViewProjection.Clone().Mul(this.matWorld);
        var matMV = camera.matView.Clone().Mul(this.matWorld);
        var matM = this.matWorld.Clone();

        matMVP.Transpose();
        var mvpArray = matMVP.m[0].concat(matMVP.m[1],matMVP.m[2],matMVP.m[3]);
        var mvpLoc = gl.getUniformLocation(this.program, 'MVP');
        gl.uniformMatrix4fv(mvpLoc, false, new Float32Array(mvpArray));

        matMV.Transpose();
        var mvArray = matMV.m[0].concat(matMV.m[1],matMV.m[2],matMV.m[3]);
        var mvLoc = gl.getUniformLocation(this.program, 'MV');
        gl.uniformMatrix4fv(mvLoc, false, new Float32Array(mvArray));

        matM.Transpose();
        var mArray = matM.m[0].concat(matM.m[1],matM.m[2],matM.m[3]);
        var mLoc = gl.getUniformLocation(this.program, 'M');
        gl.uniformMatrix4fv(mLoc, false, new Float32Array(mArray));

        var eyeLoc = gl.getUniformLocation(this.program, 'Eye');
        gl.uniform3fv(eyeLoc, [camera.pos.x, camera.pos.y, camera.pos.z]);

        var collidedLoc = gl.getUniformLocation(this.program, 'Collided');
        gl.uniform1i(collidedLoc, this.collided);
    }

    var setRenderProperty = function()
    {
        for(var i=0;i<this.attribs.length;++i)
        {
            var attrib = this.attribs[i];
            
            gl.bindBuffer(gl.ARRAY_BUFFER, attrib.vbo);
            gl.vertexAttribPointer(attrib.loc,
                attrib.count,
                attrib.type,
                attrib.normalized,
                attrib.stride,
                attrib.offset);    
            gl.enableVertexAttribArray(attrib.loc);
        }

        if (this.texture)
        {
            var tex_object = gl.getUniformLocation(this.program, 'tex_object');
            if (tex_object)
                gl.uniform1i(tex_object, 0);
    
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        }
    }

    var drawFunc = function(camera)
    {
        if (this.hide)
            return;

        gl.useProgram(this.program);
    
        if (this.setRenderProperty)
            this.setRenderProperty();
    
        if (this.setCameraProperty)
            this.setCameraProperty(camera);
    
        if (camera.ambient)
        {
            var ambientColorLoc = gl.getUniformLocation(this.program, 'AmbientLight.Color');
            gl.uniform3fv(ambientColorLoc, [camera.ambient.ambientColor.x, camera.ambient.ambientColor.y, camera.ambient.ambientColor.z]);

            var AmbientLightIntensityLoc = gl.getUniformLocation(this.program, 'AmbientLight.Intensity');
            gl.uniform3fv(AmbientLightIntensityLoc, [camera.ambient.ambientIntensity.x, camera.ambient.ambientIntensity.y, camera.ambient.ambientIntensity.z]);
        }

        if (camera.lights)
        {
            for(var i=0;i<camera.lights.length;++i)
            {
                var light = camera.lights[i];

                var lightDirectionLoc = gl.getUniformLocation(this.program, 'LightDirection');
                gl.uniform3fv(lightDirectionLoc, [light.direction.x, light.direction.y, light.direction.z]);

                var lightColorLoc = gl.getUniformLocation(this.program, 'DirectionalLight.Color');
                gl.uniform3fv(lightColorLoc, [light.lightColor.x, light.lightColor.y, light.lightColor.z]);

                var diffuseLightIntensityLoc = gl.getUniformLocation(this.program, 'DirectionalLight.DiffuseLightIntensity');
                gl.uniform3fv(diffuseLightIntensityLoc, [light.diffuseLightIntensity.x, light.diffuseLightIntensity.y, light.diffuseLightIntensity.z]);

                var specularLightIntensityLoc = gl.getUniformLocation(this.program, 'DirectionalLight.SpecularLightIntensity');
                gl.uniform3fv(specularLightIntensityLoc, [light.specularLightIntensity.x, light.specularLightIntensity.y, light.specularLightIntensity.z]);

                var specularPowLoc = gl.getUniformLocation(this.program, 'DirectionalLight.SpecularPow');
                gl.uniform1f(specularPowLoc, light.specularPow);
            }
        }

        if (this.ebo)
        {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
            gl.drawElements(this.primitiveType, this.elementCount, gl.UNSIGNED_INT, 0);
        }
        else
        {
            if (this.drawArray)
            {
                for(var i=0;i<this.drawArray.length;++i)
                    gl.drawArrays(this.primitiveType, this.drawArray[i].startVert, this.drawArray[i].count);    
            }
        }
    }

    var drawArray = [
        {startVert:0, count:vertexCount}
    ];

    var matWorld = new jMat4();
    var pos = CreateVec3(0.0, 0.0, 0.0);
    var rot = CreateVec3(0.0, 0.0, 0.0);
    var scale = CreateVec3(1.0, 1.0, 1.0);
    return {gl:gl, vbo:vbo, ebo:ebo, program:program, attribs:attribs, matWorld:matWorld, cameraIndex:cameraIndex, pos:pos
        , rot:rot, scale:scale, vertexCount:vertexCount, elementCount:elementCount, primitiveType:primitiveType
        , updateFunc:null, setRenderProperty:setRenderProperty, setCameraProperty:setCameraProperty, drawFunc:drawFunc, drawArray:drawArray
        , collided:false, hide:false, onRemoved:null};
}

var RemoveStaticObject = function(staticObject)
{
    for(var i=0;i<StaticObjectArray.length;++i)
    {
        if (StaticObjectArray[i] == staticObject)
        {
            var removingObject = StaticObjectArray[i];
            StaticObjectArray.splice(i, 1);
            if (removingObject.onRemoved)
                removingObject.onRemoved();
            break;
        }
    }
}

var CreateSegmentAgainstPlanePrimitives = function(gl)
{
    quad = CreateQuad(gl, StaticObjectArray, ZeroVec3, OneVec3, CreateVec3(10000.0, 10000.0, 10000.0), GetAttribDesc(CreateVec4(0.0, 0.0, 1.0, 1.0), true, false, false));
    var normal = CreateVec3(0.0, 1.0, 0.0).GetNormalize();
    quad.setPlane(CreatePlane(normal.x, normal.y, normal.z, document.getElementById("PlaneD").valueAsNumber));
    updateIntersection = function()
    {
        if (arrowSegment && quad)
        {
            var result = IntersectSegmentPlane(arrowSegment.segment.start.Clone(), arrowSegment.segment.getCurrentEnd(), quad.plane);
            if (result && intersectionPoint)
            {
                intersectionPoint.pos = result.point.Clone();
                intersectionPoint.hide = false;
                quad.collided = true;
            }
            else
            {
                intersectionPoint.pos = CreateVec3(0.0, 0.0, 0.0);
                intersectionPoint.hide = true;
                quad.collided = false;
            }
        }
    };
}

var CreateSegmentAgainstSpherePrimitives = function(gl)
{
    var x = document.getElementById("SpherePosX").valueAsNumber;
    var y = document.getElementById("SpherePosY").valueAsNumber;
    var z = document.getElementById("SpherePosZ").valueAsNumber;
    sphere = CreateSphere(gl, StaticObjectArray, CreateVec3(x, y, z), 30.0, GetAttribDesc(CreateVec4(0.0, 0.0, 1.0, 1.0), true, false, false));
    updateIntersection = function()
    {
        if (arrowSegment && sphere)
        {
             var a = arrowSegment.segment.start.Clone();
             var b = arrowSegment.segment.getCurrentEnd();

             // Test for ray
             //var dir = b.Clone().Sub(a).GetNormalize();
             //var result = IntersectRaySphere(a, dir, sphere);
             //sphere.collided = TestRaySphere(a, dir, sphere);        // if we don't need to have intersection point, you will use it.

            // Test for segment
            var result = IntersectSegmentSphere(a, b, sphere);
            //sphere.collided = TestSegmentSphere(a, b, sphere);        // if we don't need to have intersection point, you will use it.
            if (result && intersectionPoint)
            {
                intersectionPoint.pos = result.point.Clone();
                intersectionPoint.hide = false;
                sphere.collided = true;
            }
            else
            {
                intersectionPoint.pos = CreateVec3(0.0, 0.0, 0.0);
                intersectionPoint.hide = true;
                sphere.collided = false;
            }
        }
    };
}

var CreateSegmentAgainstBoxPrimitives = function(gl)
{
    var x = document.getElementById("BoxPosX").valueAsNumber;
    var y = document.getElementById("BoxPosY").valueAsNumber;
    var z = document.getElementById("BoxPosZ").valueAsNumber;
    const centerPos = CreateVec3(x, y, z);
    const radius = OneVec3.Clone().Mul(15);
    box = CreateCube(gl, StaticObjectArray, centerPos, OneVec3, CreateVec3(30.0, 30.0, 30.0), GetAttribDesc(CreateVec4(0.0, 0.0, 1.0, 1.0), true, false, false));
    box.setAABB(CreateAABB(centerPos.Clone().Sub(radius), centerPos.Clone().Add(radius)));
    updateIntersection = function()
    {
        if (arrowSegment && box)
        {
             var a = arrowSegment.segment.start.Clone();
             var b = arrowSegment.segment.getCurrentEnd();

            // // Test for ray
            // var dir = b.Clone().Sub(a).GetNormalize();
            // var result = IntersectRayBox(a, dir, box);

            // Test for segment
            var result = IntersectSegmentBox(a, b, box);
            //var result = TestSegmentBox(a, b, box);

            if (result && intersectionPoint)
            {
                intersectionPoint.hide = !result.hasOwnProperty('point');
                if (!intersectionPoint.hide)
                    intersectionPoint.pos = result.point.Clone();
                box.collided = true;
            }
            else
            {
                intersectionPoint.hide = true;
                intersectionPoint.pos = CreateVec3(0.0, 0.0, 0.0);
                box.collided = false;
            }
        }
    };
}

var SwitchExampleType = function(type)
{
    RemoveStaticObject(quad);
    RemoveStaticObject(sphere);
    RemoveStaticObject(box);
    quad = null;
    sphere = null;
    box = null;

    var div_segmentAgainstPlane = document.getElementById('div-SegmentAgainstPlane');
    var div_segmentAgainstSphere = document.getElementById('div-SegmentAgainstSphere');
    var div_segmentAgainstBox = document.getElementById('div-SegmentAgainstBox');
    if (type == "SegmentAgainstPlane")
    {
        CreateSegmentAgainstPlanePrimitives(jWebGL.gl);

        div_segmentAgainstPlane.style.display = 'block';
        div_segmentAgainstSphere.style.display = 'none';
        div_segmentAgainstBox.style.display = 'none';
    }
    else if (type == "SegmentAgainstSphere")
    {
        CreateSegmentAgainstSpherePrimitives(jWebGL.gl);
        div_segmentAgainstPlane.style.display = 'none';
        div_segmentAgainstSphere.style.display = 'block';
        div_segmentAgainstBox.style.display = 'none';
    }
    else if (type == "SegmentAgainstBox")
    {
        CreateSegmentAgainstBoxPrimitives(jWebGL.gl);
        div_segmentAgainstPlane.style.display = 'none';
        div_segmentAgainstSphere.style.display = 'none';
        div_segmentAgainstBox.style.display = 'block';
    }

    if (updateIntersection)
        updateIntersection();
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
    var matRot = CreateRotMat4(DegreeToRadian(10), DegreeToRadian(20), DegreeToRadian(30));
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
    var mainCamera = CreateCamera(gl, CreateVec3(90, 30, 10), CreateVec3(0.0, 30.0, 20.0), DegreeToRadian(45), 1.0, 500.0, false);
    CreateCamera(gl, CreateVec3(0, 50, 0), CreateVec3(0.0, 50.0, -1.0), DegreeToRadian(40), 5.0, 200.0, false);
    updateCamera(gl, 0);

    // Origin Point Gizmo
    CreateGizmo(gl, StaticObjectArray, CreateVec3(0.0, 0,0, 0.0), CreateVec3(0.0, 0,0, 0.0), OneVec3);

    // Create Coordinate Guide lines
    CreateCoordinateXZObject(gl, StaticObjectArray, mainCamera);
    CreateCoordinateYObject(gl, StaticObjectArray);

    arrowSegment = CreateArrowSegment(gl, StaticObjectArray, CreateVec3(50.0, 50.0, -10.0), CreateVec3(0.0, -30.0, 50.0), Time.value
        , 2.0, 1.0, GetAttribDesc(CreateVec4(1.0, 1.0, 1.0, 1.0), false, false, false), GetAttribDesc(CreateVec4(1.0, 0.0, 0.0, 1.0), false, false, false));

    intersectionPoint = CreateSphere(gl, StaticObjectArray, CreateVec3(0.0, 0.0, 0.0), 2.0, GetAttribDesc(CreateVec4(0.0, 1.0, 0.0, 1.0), true, false, false));

    SwitchExampleType("SegmentAgainstPlane");

    // Create a texture.
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));
                
    // Asynchronously load an image
    var image = new Image();
    image.src = "sun.png";
    image.addEventListener('load', function() {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    });

    var lightColor = CreateVec3(1.0, 1.0, 1.0);
    var diffuseLightIntensity = CreateVec3(1.0, 1.0, 1.0);
    var specularLightIntensity = CreateVec3(0.4, 0.4, 0.4);
    var specularPow = 64.0;

    var dirLight = CreateDirectionalLight(gl, CreateVec3(-1.0, -1.0, -1.0), lightColor, diffuseLightIntensity, specularLightIntensity, specularPow
        , {debugObject:true, pos:CreateVec3(0.0, 60.0, 60.0), size:CreateVec3(10.0, 10.0, 10.0), length:20.0, targetCamera:mainCamera, texture:texture});

    mainCamera.ambient = CreateAmbientLight(CreateVec3(0.7, 0.8, 0.8), CreateVec3(0.3, 0.3, 0.3));
    mainCamera.lights.push(dirLight);

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
        };

        prePass();

        main.Render(0);

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
    {
        if (StaticObjectArray[i].drawFunc)
            StaticObjectArray[i].drawFunc(camera);
    }

    for(var i = 0;i<TransparentStaticObjectArray.length;++i)
    {
        if (TransparentStaticObjectArray[i].drawFunc)
            TransparentStaticObjectArray[i].drawFunc(camera);
    }
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
