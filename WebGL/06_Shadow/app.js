var jWebGL;
var Clicks = [];
var StaticObjectArray = [];
var TransparentStaticObjectArray = [];
var UIStaticObject = [];
var PipeLines = [];
var quad = null;
var quadRot = CreateVec3(0.0, 0.0, 0.0);
var dirLight = null;
var pointLight = null;
var spotLight = null;
var CubeA = null;
var CubeB = null;
var CapsuleA = null;
var QuadA = null;
var TriangleA = null;
var ConeA = null;
var CylinderA = null;
var BillboardQuadA = null;
var SphereA = null;
var ShowSilhouetteDirectionalLight = false;
var ShowSilhouettePointLight = false;
var ShowSilhouetteSpotLight = false;
var ShowDebugInfoOfDirectionalLight = false;
var ShowDebugInfoOfSphereLight = false;
var ShowDebugInfoOfSpotLight = false;
const pointLightPos = CreateVec3(-10.0, 100.0, -50.0);
const pointLightRadius = 250.0;
const spotLightPos = CreateVec3(0.0, 60.0, 5.0);
const umbraRadian = 0.6;
const penumbraRadian = 0.5;
const spotLightRadius = 132.0;
const spherePosX = 65.0;
const spherePosY = 35.0;
const spherePosZ = 10.0;
const sphereRadius = 30.0;

var mainCamera = null;


var CreatePipeLineHashCode = function(vsText, fsText)
{
    return (vsText + fsText).hashCode();
}

var CreatePipeLine = function(vsText, fsText)
{
    const hashCode = CreatePipeLineHashCode(vsText, fsText);
    var pipeLine = PipeLines[hashCode];
    if (!pipeLine)
    {
        if (jWebGL && jWebGL.gl)
            pipeLine = PipeLines[hashCode] = CreateProgram(jWebGL.gl, vsText, fsText);
        if (!pipeLine)
            return null;
    }

    return {hashCode:hashCode, pipeLine:PipeLines[hashCode]};
}

var GetPipeLine = function(hashCode)
{
    if (PipeLines[hashCode])
        return {hashCode:hashCode, pipeLine:PipeLines[hashCode]};
    return null;
}

var GetPipeLineFromAttribDesc = function(attribDesc)
{
    var shader = [];
    GetShaderFromAttribDesc(shader, attribDesc);

    const hashCode = CreatePipeLineHashCode(shader.vs, shader.fs);

    var pipeLineInfo = GetPipeLine(hashCode);
    if (!pipeLineInfo)
        pipeLineInfo = CreatePipeLine(shader.vs, shader.fs);

    return pipeLineInfo;
}

// StaticObject
var createStaticObject = function(gl, attribDesc, attribParameters, faceInfo, cameraIndex, vertexCount, primitiveType, isTwoside = false, isDisablePipeLineChange = false)
{
    const pipeLineInfo = GetPipeLineFromAttribDesc(attribDesc);

    var setPipeLine = function(hashCode)
    {
        if (this.isDisablePipeLineChange)
            return;

        const pipeLineInfo = GetPipeLine(hashCode);
        if (!pipeLineInfo)
            return;

        this.pipeLineInfo = pipeLineInfo;

        for(var i=0;i<this.attribs.length;++i)
        {
            var attr = attribs[i];
            if (loc == -1)
                alert('attribLoc is -1 - setPipeLine');
            attr.loc = gl.getAttribLocation(this.pipeLineInfo.pipeLine, attr.name); 
        }
    }

    var attribs = [];
    for(var i=0;i<attribParameters.length;++i)
    {
        var attr = attribParameters[i];

        var vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attr.datas), attr.bufferType);

        var loc = gl.getAttribLocation(pipeLineInfo.pipeLine, attr.name); 
        if (loc == -1)
            alert('attribLoc is -1');
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
        this.matWorld = CloneMat4(matPos).Mul(matRot).Mul(matScale);

        var matM = CloneMat4(this.matWorld);
        var matMV = CloneMat4(camera.matView).Mul(matM);
        
        var matMVP = CloneMat4(camera.matProjection).Mul(matMV);
        matMVP.Transpose();
        var mvpArray = matMVP.m[0].concat(matMVP.m[1],matMVP.m[2],matMVP.m[3]);
        var mvpLoc = gl.getUniformLocation(this.pipeLineInfo.pipeLine, 'MVP');
        if (mvpLoc)
            gl.uniformMatrix4fv(mvpLoc, false, new Float32Array(mvpArray));

        matMV.Transpose();
        var mvArray = matMV.m[0].concat(matMV.m[1],matMV.m[2],matMV.m[3]);
        var mvLoc = gl.getUniformLocation(this.pipeLineInfo.pipeLine, 'MV');
        gl.uniformMatrix4fv(mvLoc, false, new Float32Array(mvArray));

        matM.Transpose();
        var mArray = matM.m[0].concat(matM.m[1],matM.m[2],matM.m[3]);
        var mLoc = gl.getUniformLocation(this.pipeLineInfo.pipeLine, 'M');
        if (mLoc)
            gl.uniformMatrix4fv(mLoc, false, new Float32Array(mArray));

        var matVP = CloneMat4(camera.matProjection).Mul(camera.matView);
        matVP.Transpose();
        var vpArray = matVP.m[0].concat(matVP.m[1],matVP.m[2],matVP.m[3]);
        var vpLoc = gl.getUniformLocation(this.pipeLineInfo.pipeLine, 'VP');
        if (vpLoc)
            gl.uniformMatrix4fv(vpLoc, false, new Float32Array(vpArray));

        var eyeLoc = gl.getUniformLocation(this.pipeLineInfo.pipeLine, 'Eye');
        if (eyeLoc)
            gl.uniform3fv(eyeLoc, [camera.pos.x, camera.pos.y, camera.pos.z]);

        var collidedLoc = gl.getUniformLocation(this.pipeLineInfo.pipeLine, 'Collided');
        if (collidedLoc)
            gl.uniform1i(collidedLoc, this.collided);
    }

    var setRenderProperty = function()
    {
        for(var i=0;i<this.attribs.length;++i)
        {
            var attrib = this.attribs[i];
            
            gl.bindBuffer(gl.ARRAY_BUFFER, attrib.vbo);
            if (attrib.loc == -1)
                alert('attrib.loc is -1');
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
            var tex_object = gl.getUniformLocation(this.pipeLineInfo.pipeLine, 'tex_object');
            if (tex_object)
                gl.uniform1i(tex_object, 0);
    
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        }
    }

    var drawFunc = function(camera, pipeLineHashCode, lightIndex)
    {
        if (this.hide)
            return;

        if (this.adjacencyInfo)
            this.adjacencyInfo.updateFunc(this);

        if (this.setPipeLine)
            this.setPipeLine(pipeLineHashCode);

        if (this.twoSide)
            gl.disable(gl.CULL_FACE);

        gl.useProgram(this.pipeLineInfo.pipeLine);
    
        if (this.setRenderProperty)
            this.setRenderProperty();
    
        if (this.setCameraProperty)
            this.setCameraProperty(camera);
    
        if (camera.ambient)
        {
            var ambientColorLoc = gl.getUniformLocation(this.pipeLineInfo.pipeLine, 'AmbientLight.Color');
            gl.uniform3fv(ambientColorLoc, [camera.ambient.ambientColor.x, camera.ambient.ambientColor.y, camera.ambient.ambientColor.z]);

            var AmbientLightIntensityLoc = gl.getUniformLocation(this.pipeLineInfo.pipeLine, 'AmbientLight.Intensity');
            gl.uniform3fv(AmbientLightIntensityLoc, [camera.ambient.ambientIntensity.x, camera.ambient.ambientIntensity.y, camera.ambient.ambientIntensity.z]);
        }

        var numOfDirectionalLight = 0;
        var numOfPointLight = 0;
        var numOfSpotLight = 0;

        var setDirectionalLight = function(pipeLine, light)
        {
            const structName = 'DirectionalLight[' + light.index + ']';

            var lightDirectionLoc = gl.getUniformLocation(pipeLine, structName + '.' + 'LightDirection');
            gl.uniform3fv(lightDirectionLoc, [light.direction.x, light.direction.y, light.direction.z]);

            var lightColorLoc = gl.getUniformLocation(pipeLine, structName + '.' + 'Color');
            gl.uniform3fv(lightColorLoc, [light.lightColor.x, light.lightColor.y, light.lightColor.z]);

            var diffuseLightIntensityLoc = gl.getUniformLocation(pipeLine, structName + '.' + 'DiffuseLightIntensity');
            gl.uniform3fv(diffuseLightIntensityLoc, [light.diffuseLightIntensity.x, light.diffuseLightIntensity.y, light.diffuseLightIntensity.z]);

            var specularLightIntensityLoc = gl.getUniformLocation(pipeLine, structName + '.' + 'SpecularLightIntensity');
            gl.uniform3fv(specularLightIntensityLoc, [light.specularLightIntensity.x, light.specularLightIntensity.y, light.specularLightIntensity.z]);

            var specularPowLoc = gl.getUniformLocation(pipeLine, structName + '.' + 'SpecularPow');
            gl.uniform1f(specularPowLoc, light.specularPow);
        }

        var setPointLight = function(pipeLine, light)
        {
            const structName = 'PointLight[' + light.index + ']';

            var lightPosLoc = gl.getUniformLocation(pipeLine, structName + '.' + 'LightPos');
            gl.uniform3fv(lightPosLoc, [light.pos.x, light.pos.y, light.pos.z]);

            var lightColorLoc = gl.getUniformLocation(pipeLine, structName + '.' + 'Color');
            gl.uniform3fv(lightColorLoc, [light.lightColor.x, light.lightColor.y, light.lightColor.z]);

            var diffuseLightIntensityLoc = gl.getUniformLocation(pipeLine, structName + '.' + 'DiffuseLightIntensity');
            gl.uniform3fv(diffuseLightIntensityLoc, [light.diffuseLightIntensity.x, light.diffuseLightIntensity.y, light.diffuseLightIntensity.z]);

            var specularLightIntensityLoc = gl.getUniformLocation(pipeLine, structName + '.' + 'SpecularLightIntensity');
            gl.uniform3fv(specularLightIntensityLoc, [light.specularLightIntensity.x, light.specularLightIntensity.y, light.specularLightIntensity.z]);

            var specularPowLoc = gl.getUniformLocation(pipeLine, structName + '.' + 'SpecularPow');
            gl.uniform1f(specularPowLoc, light.specularPow);

            var maxDistanceLoc = gl.getUniformLocation(pipeLine, structName + '.' + 'MaxDistance');
            gl.uniform1f(maxDistanceLoc, light.maxDistance);
        }

        var setSpotLight = function(pipeLine, light)
        {
            const structName = 'SpotLight[' + light.index + ']';

            var lightPosLoc = gl.getUniformLocation(pipeLine, structName + '.' + 'LightPos');
            gl.uniform3fv(lightPosLoc, [light.pos.x, light.pos.y, light.pos.z]);

            var lightDirectionLoc = gl.getUniformLocation(pipeLine, structName + '.' + 'Direction');
            gl.uniform3fv(lightDirectionLoc, [light.lightDirection.x, light.lightDirection.y, light.lightDirection.z]);

            var lightColorLoc = gl.getUniformLocation(pipeLine, structName + '.' + 'Color');
            gl.uniform3fv(lightColorLoc, [light.lightColor.x, light.lightColor.y, light.lightColor.z]);

            var diffuseLightIntensityLoc = gl.getUniformLocation(pipeLine, structName + '.' + 'DiffuseLightIntensity');
            gl.uniform3fv(diffuseLightIntensityLoc, [light.diffuseLightIntensity.x, light.diffuseLightIntensity.y, light.diffuseLightIntensity.z]);

            var specularLightIntensityLoc = gl.getUniformLocation(pipeLine, structName + '.' + 'SpecularLightIntensity');
            gl.uniform3fv(specularLightIntensityLoc, [light.specularLightIntensity.x, light.specularLightIntensity.y, light.specularLightIntensity.z]);

            var specularPowLoc = gl.getUniformLocation(pipeLine, structName + '.' + 'SpecularPow');
            gl.uniform1f(specularPowLoc, light.specularPow);

            var maxDistanceLoc = gl.getUniformLocation(pipeLine, structName + '.' + 'MaxDistance');
            gl.uniform1f(maxDistanceLoc, light.maxDistance);

            var penumbraRadianLoc = gl.getUniformLocation(pipeLine, structName + '.' + 'PenumbraRadian');
            gl.uniform1f(penumbraRadianLoc, light.penumbraRadian);

            var umbraRadianLoc = gl.getUniformLocation(pipeLine, structName + '.' + 'UmbraRadian');
            gl.uniform1f(umbraRadianLoc, light.umbraRadian);
        }

        // Each light should be used one in a render pass.
        const light = camera.lights.getLightByIndex(lightIndex);
        if (light)
        {
            if (light.type == "Directional")
            {
                setDirectionalLight(this.pipeLineInfo.pipeLine, light);
                numOfDirectionalLight = 1;
            }
            else if (light.type == "Point")
            {
                setPointLight(this.pipeLineInfo.pipeLine, light);
                numOfPointLight = 1;
            }
            else if (light.type == "Spot")
            {
                setSpotLight(this.pipeLineInfo.pipeLine, light);
                numOfSpotLight = 1;
            }
        }
        
        // if (camera.lights)
        // {
        //     numOfDirectionalLight = camera.lights.directionalLights.length;
        //     numOfPointLight = camera.lights.pointLights.length;
        //     numOfSpotLight = camera.lights.spotLights.length;

        //      for(var i=0;i<camera.lights.directionalLights.length;++i)
        //     {
        //         const light = camera.lights.directionalLights[i];
        //         lightDir = light.direction.CloneVec3();
        //         setDirectionalLight(this.pipeLineInfo.pipeLine, light);
        //     }

        //     for(var i=0;i<camera.lights.pointLights.length;++i)
        //     {
        //         const light = camera.lights.pointLights[i];
        //         setPointLight(this.pipeLineInfo.pipeLine, light);
        //     }

        //     for(var i=0;i<camera.lights.spotLights.length;++i)
        //     {
        //         const light = camera.lights.spotLights[i];
        //         setSpotLight(this.pipeLineInfo.pipeLine, light);
        //     }
        // }

        var numOfDirectionalLightLoc = gl.getUniformLocation(this.pipeLineInfo.pipeLine, 'NumOfDirectionalLight');
        gl.uniform1i(numOfDirectionalLightLoc, numOfDirectionalLight);

        var numOfPointLightLoc = gl.getUniformLocation(this.pipeLineInfo.pipeLine, 'NumOfPointLight');
        gl.uniform1i(numOfPointLightLoc, numOfPointLight);

        var numOfSpotLightLoc = gl.getUniformLocation(this.pipeLineInfo.pipeLine, 'NumOfSpotLight');
        gl.uniform1i(numOfSpotLightLoc, numOfSpotLight);

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
                {
                    gl.drawArrays(this.primitiveType, this.drawArray[i].startVert, this.drawArray[i].count);
                    //console.log(this.vertexCount+'drawarrays('+i+')'+'[start : ' + this.drawArray[i].startVert + '][count : ' + this.drawArray[i].count + ']');
                }
            }
        }
    }

    var drawArray = [
        {startVert:0, count:vertexCount}
    ];

    var matWorld = new jMat4();
    var matWorld2 = new jMat4();
    var pos = CreateVec3(0.0, 0.0, 0.0);
    var rot = CreateVec3(0.0, 0.0, 0.0);
    var scale = CreateVec3(1.0, 1.0, 1.0);
    return {gl:gl, vbo:vbo, ebo:ebo, pipeLineInfo:pipeLineInfo, attribs:attribs, matWorld:matWorld, matWorld2:matWorld2, cameraIndex:cameraIndex, pos:pos
        , rot:rot, scale:scale, vertexCount:vertexCount, elementCount:elementCount, primitiveType:primitiveType
        , updateFunc:null, setRenderProperty:setRenderProperty, setCameraProperty:setCameraProperty, drawFunc:drawFunc, drawArray:drawArray
        , collided:false, hide:false, twoSide:isTwoside, setPipeLine:setPipeLine, isDisablePipeLineChange:isDisablePipeLineChange};
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
    var gl = canvas.getContext('webgl', {stencil:true});
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
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    //gl.enable(gl.BLEND);
    //gl.disable(gl.BLEND);
    //gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    //gl.cullFace(gl.FRONT);
    gl.frontFace(gl.CCW);

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
    mainCamera = CreateCamera(gl, CreateVec3(85, 119, -102), CreateVec3(24.0, 39.0, -44.0), DegreeToRadian(45), 1.0, 500.0, false);
    CreateCamera(gl, CreateVec3(100, 50, 0), CreateVec3(100.0, 50.0, -1.0), DegreeToRadian(40), 5.0, 200.0, false);
    updateCamera(gl, 0);

    // Origin Point Gizmo
    CreateGizmo(gl, StaticObjectArray, CreateVec3(0.0, 0,0, 0.0), CreateVec3(0.0, 0,0, 0.0), OneVec3);

    // Create Coordinate Guide lines
    //CreateCoordinateXZObject(gl, StaticObjectArray, mainCamera);
    //CreateCoordinateYObject(gl, StaticObjectArray);

    quad = CreateQuad(gl, StaticObjectArray, ZeroVec3, OneVec3, CreateVec3(10000.0, 10000.0, 10000.0), GetAttribDesc(CreateVec4(1.0, 1.0, 1.0, 1.0), true, false, false, false, false));
    var normal = CreateVec3(0.0, 1.0, 0.0).GetNormalize();
    quad.setPlane(CreatePlane(normal.x, normal.y, normal.z, -0.1));

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

    // Create a texture.
    var texture2 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));
                
    // Asynchronously load an image
    var image2 = new Image();
    image2.src = "bulb.png";
    image2.addEventListener('load', function() {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_2D, texture2);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image2);
        gl.generateMipmap(gl.TEXTURE_2D);
    });

    // Create a texture.
    var texture3 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture3);
    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));
                
    // Asynchronously load an image
    var image3 = new Image();
    image3.src = "spot.png";
    image3.addEventListener('load', function() {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_2D, texture3);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image3);
        gl.generateMipmap(gl.TEXTURE_2D);
    });

    var lightColor = CreateVec3(1.0, 1.0, 1.0);
    var diffuseLightIntensity = CreateVec3(1.0, 1.0, 1.0);
    var specularLightIntensity = CreateVec3(0.4, 0.4, 0.4);
    var specularPow = 64.0;

    dirLight = CreateDirectionalLight(gl, StaticObjectArray, CreateVec3(-1.0, -1.0, -1.0), lightColor, diffuseLightIntensity, specularLightIntensity, specularPow
        , {debugObject:true, pos:CreateVec3(0.0, 90.0, 90.0), size:CreateVec3(10.0, 10.0, 10.0), length:20.0, targetCamera:mainCamera, texture:texture});

    dirLight.setHideDebugInfo(!document.getElementById('ShowDirectionalLightInfo').checked);

    pointLight = CreatePointLight(gl, StaticObjectArray, pointLightPos, CreateVec3(1.0, 0.0, 0.0), pointLightRadius, diffuseLightIntensity, specularLightIntensity, 256
        , {debugObject:true, pos:null, size:CreateVec3(10.0, 10.0, 10.0), length:null, targetCamera:mainCamera, texture:texture2});

    pointLight.setHideDebugInfo(!document.getElementById('ShowPointLightInfo').checked);

    spotLight = CreateSpotLight(gl, StaticObjectArray, spotLightPos, CreateVec3(-1.0, -1.0, -0.4).GetNormalize()
        , CreateVec3(0.0, 1.0, 0.0), spotLightRadius, penumbraRadian, umbraRadian, diffuseLightIntensity, specularLightIntensity, 256
        , {debugObject:true, pos:null, size:CreateVec3(10.0, 10.0, 10.0), length:null, targetCamera:mainCamera, texture:texture3});

    spotLight.setHideDebugInfo(!document.getElementById('ShowSpotLightInfo').checked);

    CubeA = CreateCube(gl, StaticObjectArray, CreateVec3(-60.0, 55.0, -20.0), OneVec3, CreateVec3(50, 50, 50)
        , GetAttribDesc(CreateVec4(0.7, 0.7, 0.7, 1.0), true, false, false, false, true));
    CubeB = CreateCube(gl, StaticObjectArray, CreateVec3(-65.0, 35.0, 10.0), OneVec3, CreateVec3(50, 50, 50)
        , GetAttribDesc(CreateVec4(0.7, 0.7, 0.7, 1.0), true, false, false, false, true));
    CapsuleA = CreateCapsule(gl, StaticObjectArray, CreateVec3(30.0, 30.0, -80.0), 20, 10, 20, 1.0
        , GetAttribDesc(CreateVec4(1.0, 0.0, 0.0, 1.0), true, false, false, false, true));
    ConeA = CreateCone(gl, StaticObjectArray, CreateVec3(0.0, 50.0, 60.0), 40, 20, 15, OneVec3
        , GetAttribDesc(CreateVec4(1.0, 1.0, 0.0, 1.0), true, false, false, false, true));
    CylinderA = CreateCylinder(gl, StaticObjectArray, CreateVec3(-30.0, 60.0, -60.0), 20, 10, 20, OneVec3
        , GetAttribDesc(CreateVec4(0.0, 0.0, 1.0, 1.0), true, false, false, false, true));
    TriangleA = CreateTriangle(gl, StaticObjectArray, CreateVec3(60.0, 100.0, 20.0), OneVec3, CreateVec3(40.0, 40.0, 40.0)
        , GetAttribDesc(CreateVec4(0.5, 0.1, 1.0, 1.0), true, false, false, false, true));
    QuadA = CreateQuad(gl, StaticObjectArray, CreateVec3(-20.0, 80.0, 40.0), OneVec3, CreateVec3(20.0, 20.0, 20.0)
        , GetAttribDesc(CreateVec4(0.0, 0.0, 1.0, 1.0), true, false, false, false, true));
    BillboardQuadA = CreateBillboardQuad(gl, StaticObjectArray, CreateVec3(0.0, 60.0, 80.0), OneVec3, CreateVec3(20.0, 20.0, 20.0)
        , GetAttribDesc(CreateVec4(1.0, 0.0, 1.0, 1.0), true, false, false, false, true));
    BillboardQuadA.camera = mainCamera;

    SphereA = CreateSphere(gl, StaticObjectArray, CreateVec3(spherePosX, spherePosY, spherePosZ)
                            , 1.0, 20, CreateVec3(sphereRadius, sphereRadius, sphereRadius)
                            , GetAttribDesc(CreateVec4(0.8, 0.0, 0.0, 1.0), true, false, false, false, true));

    mainCamera.ambient = CreateAmbientLight(CreateVec3(0.7, 0.8, 0.8), CreateVec3(0.2, 0.2, 0.2));
    mainCamera.addLight(dirLight);
    mainCamera.addLight(pointLight);
    mainCamera.addLight(spotLight);

    const matRotate = CreateRotationAxisMat4(CreateVec3(0.0, 1.0, 0.0), 0.01);

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

        if (CylinderA)
            CylinderA.rot.x += 0.1;
        if (ConeA)
            ConeA.rot.y += 0.03;
        if (CapsuleA)
            CapsuleA.rot.x += 0.01;
        if (CubeA)
            CubeA.rot.z += 0.005;
        if (SphereA)
            SphereA.rot.x += 0.01;
        if (TriangleA)
            TriangleA.rot.x += 0.05;
        if (QuadA)
            QuadA.rot.z += 0.08;

        // rotate spot light direction
        spotLight.lightDirection = spotLight.lightDirection.Transform(matRotate).GetNormalize();

        processKeyEvents();
        main.Update();
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
        updateCameraFrustum(gl, Cameras[i]);
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
    var ambientAttribDesc = GetAttribDesc(CreateVec4(1.0, 0.0, 1.0, 1.0), true, false, false, false, true, true);
    var ambientPipeLineInfo = GetPipeLineFromAttribDesc(ambientAttribDesc);
    const ambientPipeLineHashCode = ambientPipeLineInfo.hashCode;

    var defaultAttribDesc = GetAttribDesc(CreateVec4(1.0, 0.0, 1.0, 1.0), true, false, false, false, true, false);
    var defaultPipeLineInfo = GetPipeLineFromAttribDesc(defaultAttribDesc);
    const defaultPipeLineHashCode = defaultPipeLineInfo.hashCode;

    var gl = this.gl;
    var camera = Cameras[cameraIndex];

    var drawStaticOpaqueObjects = function(pipeLineHashCode, lightIndex, drawShadowCasterOnly = false)
    {
        for(var i = 0;i<StaticObjectArray.length;++i)
        {
            var obj = StaticObjectArray[i];

            if (drawShadowCasterOnly && !obj.shadowVolume)
                continue;

            if (obj.drawFunc)
                obj.drawFunc(camera, pipeLineHashCode, lightIndex);
        }
    }

    var drawStaticTransparentObjects = function(pipeLineHashCode, lightIndex, drawShadowCasterOnly = false)
    {
        for(var i = 0;i<TransparentStaticObjectArray.length;++i)
        {
            var obj = TransparentStaticObjectArray[i];

            if (drawShadowCasterOnly && !obj.shadowVolume)
                continue;

            if (obj.drawFunc)
                obj.drawFunc(camera, pipeLineHashCode, lightIndex);
        }
    }

    var checkWhetherCanSkipShadowObj = function(obj, lightPos, lightDir, light)
    {
        var radius = 0.0;
        if (obj.hasOwnProperty('radius'))
            radius = obj.radius;
        else
            radius = obj.scale.x;

        if (lightDir)       // Directional light
        {            
            // 1. check direction against frustum
            if (!camera.checkIsInFrustomWithDirection(obj.pos, radius, lightDir))
                return true;
        }
        else if (lightPos)  // Sphere or Spot Light
        {
            // 1. check out of light radius with obj
            const isCasterOutOfLightRadius = (lightPos.CloneVec3().Sub(obj.pos).GetLength() > light.maxDistance);
            if (isCasterOutOfLightRadius)
                return true;

            // 2. check direction against frustum
            if (!camera.checkIsInFrustomWithDirection(obj.pos, radius, obj.pos.CloneVec3().Sub(lightPos)))
                return true;

            // 3. check Spot light range with obj
            if (isSpotLight)
            {
                const lightToObjVector = obj.pos.CloneVec3().Sub(lightPos);
                const radianOfRadiusOffset = Math.atan(radius / lightToObjVector.GetLength());

                const radian = GetDotProduct3(lightToObjVector.GetNormalize(), light.lightDirection);
                const limitRadian = Math.cos(Math.max(light.umbraRadian, light.penumbraRadian)) - radianOfRadiusOffset;
                if (limitRadian > radian)
                    return true;
            }
        }
        return false;
    }

    //////////////////////////////////////////////////////////////////
    // 1. Render objects to depth buffer and Ambient & Emissive to color buffer.
    //gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ZERO);

    gl.enable(gl.DEPTH_TEST);

    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.5, 0.5, 0.5, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.STENCIL_TEST);

    gl.depthMask(true);
    gl.colorMask(true, true, true, true);

    drawStaticOpaqueObjects(ambientPipeLineHashCode, -1);

    //////////////////////////////////////////////////////////////////
    // 2. Stencil volume update & rendering (z-fail)
    const numOfLights = camera.getNumOfLights();

    var isSpotlightInFrustum = camera.checkIsInFrustom(spotLightPos.CloneVec3(), spotLightRadius);
    var isPointlightInFrustum = camera.checkIsInFrustom(pointLightPos.CloneVec3(), pointLightRadius);

    for(var lightIndex=0;lightIndex<numOfLights;++lightIndex)
    {
        gl.clear(gl.STENCIL_BUFFER_BIT);
        gl.enable(gl.STENCIL_TEST);
        gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.DECR_WRAP, gl.KEEP);
        gl.stencilOpSeparate(gl.BACK, gl.KEEP, gl.INCR_WRAP, gl.KEEP);

        gl.stencilFunc(gl.ALWAYS, 0, 0xff);
        gl.depthFunc(gl.LEQUAL);
        gl.depthMask(false);
        gl.colorMask(false, false, false, false);

        gl.disable(gl.CULL_FACE);

        var lightDir = null;
        var lightPos = null;
        var isSpotLight = false;

        const light = camera.lights.getLightByIndex(lightIndex);
        if (light)
        {
            if (light.type == "Directional")
                lightDir = light.direction.CloneVec3();
            else if (light.type == "Point")
            {
                lightPos = light.pos.CloneVec3();
                if (!isPointlightInFrustum)
                    continue;
            }
            else if (light.type == "Spot")
            {
                lightPos = light.pos.CloneVec3();
                if (!isSpotlightInFrustum)
                    continue;

                isSpotLight = true;
            }
        }

        {
            gl.enable(gl.POLYGON_OFFSET_FILL);
            gl.polygonOffset(0.0, 100.0);

            for(var i = 0;i<StaticObjectArray.length;++i)
            {
                var obj = StaticObjectArray[i];
                if (!obj.shadowVolume)
                    continue;

                if (checkWhetherCanSkipShadowObj(obj, lightPos, lightDir, light))
                    continue;
                
                const shadowVolume = obj.shadowVolume;
                shadowVolume.updateFunc(lightDir, lightPos, obj);

                for(var k=0;k<shadowVolume.objectArray.length;++k)
                {
                    var shadowObj = shadowVolume.objectArray[k];
                    if (shadowObj)
                    {
                        if (shadowObj.updateFunc)
                            shadowObj.updateFunc();
            
                        if (shadowObj.drawFunc)
                            shadowObj.drawFunc(camera, defaultPipeLineHashCode, lightIndex, true);
                    }
                }
            }

            gl.disable(gl.POLYGON_OFFSET_FILL);
        }

        //////////////////////////////////////////////////////////////////
        // 3. Final light(Directional, Point, Spot) rendering.
        gl.stencilFunc(gl.EQUAL, 0, 0xff);
        gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.KEEP, gl.KEEP);
        gl.stencilOpSeparate(gl.BACK, gl.KEEP, gl.KEEP, gl.KEEP);

        gl.depthMask(false);
        gl.colorMask(true, true, true, true);
        gl.enable(gl.CULL_FACE);

        gl.depthFunc(gl.EQUAL);
        gl.blendFunc(gl.ONE, gl.ONE);        
        drawStaticOpaqueObjects(defaultPipeLineHashCode, lightIndex);
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(true);
    gl.colorMask(true, true, true, true);
    gl.disable(gl.STENCIL_TEST);
    drawStaticTransparentObjects(defaultPipeLineHashCode, -1);

    // debug shadow volume
    for(var lightIndex=0;lightIndex<numOfLights;++lightIndex)
    {
        var lightDir = null;
        var lightPos = null;
        var isSpotLight = false;
        const light = camera.lights.getLightByIndex(lightIndex);
        if (light)
        {
            if (light.type == "Directional")
            {
                if (!ShowSilhouetteDirectionalLight)
                    continue;

                lightDir = light.direction.CloneVec3();
                isDirectionalLight = true;
            }
            else if (light.type == "Point")
            {
                if (!ShowSilhouettePointLight)
                    continue;

                if (!isPointlightInFrustum)
                    continue;

                lightPos = light.pos.CloneVec3();
                isPointLight = true;
            }
            else if (light.type == "Spot")
            {
                if (!ShowSilhouetteSpotLight)
                    continue;

                if (!isSpotlightInFrustum)
                    continue;

                lightPos = light.pos.CloneVec3();
                isSpotLight = true;
            }
            else
            {
                continue;
            }
        }

        gl.depthFunc(gl.LEQUAL);
        for(var i = 0;i<StaticObjectArray.length;++i)
        {
            var obj = StaticObjectArray[i];
            if (!obj.shadowVolume)
                continue;
            
            if (checkWhetherCanSkipShadowObj(obj, lightPos, lightDir, light))
                continue;

            const shadowVolume = obj.shadowVolume;
            shadowVolume.updateFunc(lightDir, lightPos, obj);

            for(var k=0;k<shadowVolume.objectArray.length;++k)
            {
                var shadowObj = shadowVolume.objectArray[k];
                if (shadowObj)
                {
                    if (shadowObj.drawFunc)
                        shadowObj.drawFunc(camera, defaultPipeLineHashCode, lightIndex);
                }
            }
        }
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
