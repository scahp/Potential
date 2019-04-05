var jWebGL;
var Clicks = [];
var StaticObjectArray = [];
var TransparentStaticObjectArray = [];
var UIStaticObjectArray = [];
var LightArray = []
var PipeLines = [];
var quad = null;
var quadRot = CreateVec3(0.0, 0.0, 0.0);
var ambientLight = null;
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
const pointLightRadius = 500.0;
const spotLightPos = CreateVec3(0.0, 60.0, 5.0);
const umbraRadian = 0.6;
const penumbraRadian = 0.5;
const spotLightRadius = 132.0;
const spherePosX = 65.0;
const spherePosY = 35.0;
const spherePosZ = 10.0;
const sphereRadius = 30.0;

var mainCamera = null;

const shadow_width = 1024.0;
const shadow_height = 1024.0;
var ShadowMode = 'ShadowVolume';

var SetShadowVolumeMode = function()
{
    ShadowMode = 'ShadowVolume';

    var div_segmentAgainstPlane = document.getElementById('div-ShadowVolume');
    div_segmentAgainstPlane.style.display = 'block';
}

var SetShadowMapMode = function()
{
    ShadowMode = 'ShadowMap';
    var div_segmentAgainstPlane = document.getElementById('div-ShadowVolume');
    div_segmentAgainstPlane.style.display = 'none';
}

var IsShadowVolumeMode = function()
{
    return (ShadowMode == 'ShadowVolume');
}

var IsShadowMapMode = function()
{
    return (ShadowMode == 'ShadowMap');
}

var SwitchShadowMode = function(mode)
{
    if (mode == 'ShadowVolume')
        SetShadowVolumeMode();
    else if (mode == 'ShadowMap')
        SetShadowMapMode();
}

var Init = function()
{
    console.log('init function start');

    var canvas = document.getElementById('webgl-surface');
    var gl = canvas.getContext('webgl2', {stencil:true});
    if (!gl)
    {
        console.log('webgl2 not supported');
        //gl = canvas.getContext('experimental-webgl');
    }

    if (!gl)
        alert('Your browser does not support webgl');

    var loadExtension = function(extName)
    {
        var ext = gl.getExtension(extName);
        if (!ext) { console.log(extName); }
    }

    loadExtension('OES_element_index_uint');        // To use gl.UNSIGNED_INT
    loadExtension('OES_texture_float');             // To use gl.FLOAT
    loadExtension('EXT_color_buffer_float');        // To use gl.FLOAT
    loadExtension("OES_texture_float_linear");      // To use gl.FLOAT

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
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);

    var matPos = CreatePosMat4(10.0, 20.0, 30.0);
    var matRot = CreateRotMat4(DegreeToRadian(10), DegreeToRadian(20), DegreeToRadian(30));
    var matScale = CreateScaleMat4(1, 2, 3);

    // Process Key Event
    var processKeyEvents = function()
    {
        if (KeyState['a'] || KeyState['A']) moveShift(-1, 0);
        if (KeyState['d'] || KeyState['D']) moveShift(1, 0);
        if (KeyState['1']) rotateFowardAxis(0, -0.1);
        if (KeyState['2']) rotateFowardAxis(0, 0.1);
        if (KeyState['3']) rotateUpAxis(0, -0.1);
        if (KeyState['4']) rotateUpAxis(0, 0.1);
        if (KeyState['5']) rotateRightAxis(0, -0.1);
        if (KeyState['6']) rotateRightAxis(0, 0.1);
        if (KeyState['w'] || KeyState['W']) forward(1, 0);
        if (KeyState['s'] || KeyState['S']) forward(-1, 0);
    }

    // Create Cameras
    const mainCameraPos = CreateVec3(85, 119, -102);
    mainCamera = CreateCamera(gl, mainCameraPos, mainCameraPos.CloneVec3().Add(CreateVec3(-1.0, -1.0, 1.0)), mainCameraPos.CloneVec3().Add(CreateVec3(0.0, 1.0, 0.0)), DegreeToRadian(45), 10.0, 500.0, false);
    updateCamera(gl, 0);

    // Origin Point Gizmo
    var gizmo = CreateGizmo(gl, StaticObjectArray, CreateVec3(0.0, 0,0, 0.0), CreateVec3(0.0, 0,0, 0.0), OneVec3);
    gizmo.skipShadowMapGeneration = true;

    var lightColor = CreateVec3(1.0, 1.0, 1.0);
    var diffuseLightIntensity = CreateVec3(1.0, 1.0, 1.0);
    var specularLightIntensity = CreateVec3(0.4, 0.4, 0.4);
    var specularPow = 64.0;

    // Create lights
    dirLight = CreateDirectionalLight(gl, LightArray, CreateVec3(-1.0, -1.0, -1.0), lightColor, diffuseLightIntensity, specularLightIntensity, specularPow
        , {debugObject:true, pos:CreateVec3(0.0, 90.0, 90.0), size:CreateVec3(10.0, 10.0, 10.0), length:20.0, targetCamera:mainCamera, texture:"sun.png", TargetObjectArray:TransparentStaticObjectArray});
    dirLight.setHideDebugInfo(!document.getElementById('ShowDirectionalLightInfo').checked);
    mainCamera.addLight(dirLight);

    pointLight = CreatePointLight(gl, LightArray, pointLightPos, CreateVec3(1.0, 0.0, 0.0), pointLightRadius, diffuseLightIntensity, specularLightIntensity, 256
        , {debugObject:true, pos:null, size:CreateVec3(10.0, 10.0, 10.0), length:null, targetCamera:mainCamera, texture:"bulb.png", TargetObjectArray:TransparentStaticObjectArray});
    pointLight.setHideDebugInfo(!document.getElementById('ShowPointLightInfo').checked);
    mainCamera.addLight(pointLight);

    spotLight = CreateSpotLight(gl, LightArray, spotLightPos, CreateVec3(-1.0, -1.0, -0.4).GetNormalize()
        , CreateVec3(0.0, 1.0, 0.0), spotLightRadius, penumbraRadian, umbraRadian, diffuseLightIntensity, specularLightIntensity, 256
        , {debugObject:true, pos:null, size:CreateVec3(10.0, 10.0, 10.0), length:null, targetCamera:mainCamera, texture:"spot.png", TargetObjectArray:TransparentStaticObjectArray});
    spotLight.setHideDebugInfo(!document.getElementById('ShowSpotLightInfo').checked);    
    
    const matRotate = CreateRotationAxisMat4(CreateVec3(0.0, 1.0, 0.0), 0.01);
    spotLight.updateFunc = function()
    {
        // rotate spot light direction
        spotLight.lightDirection = spotLight.lightDirection.Transform(matRotate).GetNormalize();
    }
    mainCamera.addLight(spotLight);

    ambientLight = mainCamera.ambient = CreateAmbientLight(CreateVec3(0.7, 0.8, 0.8), CreateVec3(0.2, 0.2, 0.2));

    const colorOnlyShader = CreateBaseColorOnlyShaderFile();

    // Create primitives
    quad = CreateQuad(gl, StaticObjectArray, ZeroVec3, OneVec3, CreateVec3(10000.0, 10000.0, 10000.0)
        , CreateVec4(1.0, 1.0, 1.0, 1.0), colorOnlyShader);
    quad.skipShadowMapGeneration = false;
    quad.skipShadowVolume = true;
    var normal = CreateVec3(0.0, 1.0, 0.0).GetNormalize();
    quad.setPlane(CreatePlane(normal.x, normal.y, normal.z, -0.1));

    CubeA = CreateCube(gl, StaticObjectArray, CreateVec3(-60.0, 55.0, -20.0), OneVec3, CreateVec3(50, 50, 50)
        , CreateVec4(0.7, 0.7, 0.7, 1.0), colorOnlyShader);
    CubeB = CreateCube(gl, StaticObjectArray, CreateVec3(-65.0, 35.0, 10.0), OneVec3, CreateVec3(50, 50, 50)
        , CreateVec4(0.7, 0.7, 0.7, 1.0), colorOnlyShader);
    CapsuleA = CreateCapsule(gl, StaticObjectArray, CreateVec3(30.0, 30.0, -80.0), 20, 10, 20, 1.0
        , CreateVec4(1.0, 0.0, 0.0, 1.0), colorOnlyShader);
    ConeA = CreateCone(gl, StaticObjectArray, CreateVec3(0.0, 50.0, 60.0), 40, 20, 15, OneVec3
        , CreateVec4(1.0, 1.0, 0.0, 1.0), colorOnlyShader);
    CylinderA = CreateCylinder(gl, StaticObjectArray, CreateVec3(-30.0, 60.0, -60.0), 20, 10, 20, OneVec3
        , CreateVec4(0.0, 0.0, 1.0, 1.0), colorOnlyShader);
    TriangleA = CreateTriangle(gl, StaticObjectArray, CreateVec3(60.0, 100.0, 20.0), OneVec3, CreateVec3(40.0, 40.0, 40.0)
        , CreateVec4(0.5, 0.1, 1.0, 1.0), colorOnlyShader);
    QuadA = CreateQuad(gl, StaticObjectArray, CreateVec3(-20.0, 80.0, 40.0), OneVec3, CreateVec3(20.0, 20.0, 20.0)
        , CreateVec4(0.0, 0.0, 1.0, 1.0), colorOnlyShader);
    BillboardQuadA = CreateBillboardQuad(gl, StaticObjectArray, CreateVec3(0.0, 60.0, 80.0), OneVec3, CreateVec3(20.0, 20.0, 20.0)
        , CreateVec4(1.0, 0.0, 1.0, 1.0), colorOnlyShader, mainCamera);
    SphereA = CreateSphere(gl, StaticObjectArray, CreateVec3(spherePosX, spherePosY, spherePosZ)
        , 1.0, 20, CreateVec3(sphereRadius, sphereRadius, sphereRadius), CreateVec4(0.8, 0.0, 0.0, 1.0), colorOnlyShader);

    // Create frameBuffer to render at offscreen
    CreateUIQuad(gl, UIStaticObjectArray, 10, 10, 300, 300, dirLight.directionalShadowMap.getDepthMap());

    var customUpdateForPrimitives = function()
    {
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
    }

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

        customUpdateForPrimitives();

        processKeyEvents();
        main.Update();
        if (IsShadowVolumeMode())
        {
            main.RenderWithShadowVolume(0);
        }
        else if( IsShadowMapMode())
        {
            main.RenderWithShadowMap(0);

            gl.disable(gl.DEPTH_TEST);
            // Render To 3D UI
            for(var i=0;i<UIStaticObjectArray.length;++i)
            {
                var obj = UIStaticObjectArray[i];
                if (obj.updateFunc)
                    obj.updateFunc();
                if (obj.drawFunc)
                    obj.drawFunc(mainCamera, 0, 0);
            }
        }

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

jWebGL.prototype.Update = function()
{
    var gl = this.gl;

    for(var i=0;i<LightArray.length;++i)
    {
        if(LightArray[i].hasOwnProperty('updateFunc'))
            LightArray[i].updateFunc();
    }

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

var drawStaticTransparentObjects = function(camera, pipeLineHashCode, lightIndex, drawShadowCasterOnly = false)
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

jWebGL.prototype.RenderWithShadowMap = function(cameraIndex)
{
    var gl = this.gl;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

    const omniShadowMapPipeLineHashCode = LoadPipeline(CreateOmniDirectionalShadowMapShaderFile()).hashCode;
    const shadowMapPipeLineHashCode =  LoadPipeline(CreateShadowMapShaderFile()).hashCode;
    const defaultPipeLineHashCode = LoadPipeline(CreateBaseShadowMapShaderFile()).hashCode;

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    var drawOmniShadowMap = function(omniShadowMap)
    {
        for(var k=0;k<omniShadowMap.cameras.length;++k)
        {
            var framebuffer = omniShadowMap.framebuffers[k];
            var camera = omniShadowMap.cameras[k];

            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
    
            gl.viewport(0, 0, shadow_width, shadow_height);
            
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
            for(var i = 0;i<StaticObjectArray.length;++i)
            {
                var obj = StaticObjectArray[i];
                if (obj.skipShadowMapGeneration)
                    continue;
                if (obj.drawFunc)
                    obj.drawFunc(camera, omniShadowMapPipeLineHashCode, 0);
            }
        }
    }

    // 1. ShadowMap pass
    // 1.1 Directional Light ShadowMap Generation
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, dirLight.directionalShadowMap.framebuffer.fbo);
        
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        gl.viewport(0, 0, shadow_width, shadow_height);
        
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for(var i = 0;i<StaticObjectArray.length;++i)
        {
            var obj = StaticObjectArray[i];
            if (obj.skipShadowMapGeneration)
                continue;
            if (obj.drawFunc)
                obj.drawFunc(dirLight.directionalShadowMap.camera, shadowMapPipeLineHashCode, 0);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    // 1.2 Point Light ShadowMap Generation
    var camera = Cameras[cameraIndex];
    for(var i=0;i<camera.lights.pointLights.length;++i)
        drawOmniShadowMap(camera.lights.pointLights[i].omniShadowMap);

    // 1.3 Spot Light ShadowMap Generation
    for(var i=0;i<camera.lights.spotLights.length;++i)
        drawOmniShadowMap(camera.lights.spotLights[i].omniShadowMap);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    
    gl.enable(gl.BLEND);

    gl.clearColor(0.5, 0.5, 0.5, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var currentCamera = Cameras[cameraIndex];
    var drawLightWithOmniShadowMap = function(light, index)
    {
        gl.blendFunc(gl.ONE, gl.ONE);

        for(var i = 0;i<StaticObjectArray.length;++i)
        {
            var obj = StaticObjectArray[i];
    
            obj.textureCubeMap = light.omniShadowMap.depthCubeMap;
            if (obj.drawFunc)
                obj.drawFunc(currentCamera, defaultPipeLineHashCode, index);
            obj.textureCubeMap = null;
        }
    }

    // 2. Light pass
    // 2.1 Directional Light
    gl.blendFunc(gl.ONE, gl.ZERO);
    currentCamera.ambient = ambientLight;

    var matShadowVP = CloneMat4(dirLight.directionalShadowMap.camera.matProjection).Mul(dirLight.directionalShadowMap.camera.matView);

    if (camera.lights.directionalLights.length > 0)
    {
        for(var i = 0;i<StaticObjectArray.length;++i)
        {
            var obj = StaticObjectArray[i];
    
            obj.textureShadowMap = dirLight.directionalShadowMap.framebuffer.tbo;
            obj.matShadowVP = matShadowVP;
            if (obj.drawFunc)
                obj.drawFunc(currentCamera, defaultPipeLineHashCode, 0);
            obj.textureShadowMap = null;
            obj.matShadowVP = null;
        }
    }
    currentCamera.ambient = null;

    // 2.2 Point Light
    for(var i=0;i<camera.lights.pointLights.length;++i)
        drawLightWithOmniShadowMap(camera.lights.pointLights[i], camera.lights.directionalLights.length + i);

    // 2.3 Spot Light
    for(var i=0;i<camera.lights.spotLights.length;++i)
        drawLightWithOmniShadowMap(camera.lights.spotLights[i], camera.lights.directionalLights.length + camera.lights.pointLights.length + i);

    // 3. Transparent object render
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(true);
    gl.colorMask(true, true, true, true);
    gl.disable(gl.STENCIL_TEST);
    drawStaticTransparentObjects(camera, defaultPipeLineHashCode, -1);

    gl.disable(gl.BLEND);
}

jWebGL.prototype.RenderWithShadowVolume = function(cameraIndex)
{
    const ambientPipeLineHashCode = LoadPipeline(CreateBaseShadowVolumeAmbientOnlyShaderFile()).hashCode;
    const defaultPipeLineHashCode = LoadPipeline(CreateBaseShadowVolumeShaderFile()).hashCode;

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

    var checkWhetherCanSkipShadowObj = function(obj, lightPos, lightDir, light)
    {
        if (!obj.shadowVolume || obj.skipShadowVolume)
            return true;

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
    drawStaticTransparentObjects(camera, defaultPipeLineHashCode, -1);

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
