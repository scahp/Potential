var mainCamera = null;
var gizmo = null;
var quad = null;
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
var shadowMapDebugQuad = null;
const pointLightPos = CreateVec3(0.0, 100.0, 0.0);
const pointLightRadius = 500.0;
const spotLightPos = CreateVec3(0.0, 60.0, 5.0);
const umbraRadian = 1.0;
const penumbraRadian = 0.7;
const spotLightRadius = 500.0;
const spherePosX = 65.0;
const spherePosY = 35.0;
const spherePosZ = 10.0;
const sphereRadius = 30.0;
var CubeTest = null;
var ShadowmapType = 0;
var UsePoissonSample = 1;
var ShowDirectionalLightMap = 0;
var nullTexture = null;
var fullscreenQuadBlur = null;

var jGame = function(gl)
{
    this.gl = gl;
}

jGame.prototype.processKeyEvents = function()
{
    // Process Key Event
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

jGame.prototype.Setup = function()
{
    var gl = this.gl;

    nullTexture = createNullTexture(gl);

    // Create Cameras
    const mainCameraPos = CreateVec3(172.66, 166.47, -180.63);
    const mainCameraTarget = CreateVec3(171.96, 166.02, -180.05);
    // const mainCameraPos = CreateVec3(38.16, 44.40, 67.83);
    // const mainCameraTarget = CreateVec3(20.0,0.0,50.0);
    mainCamera = CreateCamera(gl, mainCameraPos, mainCameraTarget, mainCameraPos.CloneVec3().Add(CreateVec3(0.0, 1.0, 0.0)), DegreeToRadian(45), 10.0, 500.0, false);
    updateCamera(gl, 0);

    // Origin Point Gizmo
    gizmo = CreateGizmo(gl, StaticObjectArray, CreateVec3(0.0, 0,0, 0.0), CreateVec3(0.0, 0,0, 0.0), OneVec3);
    gizmo.skipShadowMapGeneration = true;

    var lightColor = CreateVec3(0.5, 0.5, 0.5);
    var diffuseLightIntensity = CreateVec3(1.0, 1.0, 1.0);
    var specularLightIntensity = CreateVec3(0.4, 0.4, 0.4);
    var specularPow = 64.0;

    // Create lights
    dirLight = CreateDirectionalLight(gl, LightArray, CreateVec3(-1.0, -1.0, -1.0), lightColor, diffuseLightIntensity, specularLightIntensity, specularPow
        , {debugObject:true, pos:CreateVec3(100.0, 100.0, 100.0), size:CreateVec3(10.0, 10.0, 10.0), length:20.0, targetCamera:mainCamera, texture:"image/sun.png", TargetObjectArray:TransparentStaticObjectArray});
    dirLight.setHideDebugInfo(!document.getElementById('ShowDirectionalLightInfo').checked);
    mainCamera.addLight(dirLight);

    pointLight = CreatePointLight(gl, LightArray, CreateVec3(10.0, 100.0, 10.0), CreateVec3(2.0, 0.7, 0.7), pointLightRadius, diffuseLightIntensity, specularLightIntensity, 256
        , {debugObject:true, pos:null, size:CreateVec3(10.0, 10.0, 10.0), length:null, targetCamera:mainCamera, texture:"image/bulb.png", TargetObjectArray:TransparentStaticObjectArray});
    pointLight.setHideDebugInfo(!document.getElementById('ShowPointLightInfo').checked);
    mainCamera.addLight(pointLight);

    spotLight = CreateSpotLight(gl, LightArray, spotLightPos, CreateVec3(-1.0, -1.0, -0.4).GetNormalize()
        , CreateVec3(0.0, 1.0, 0.0), spotLightRadius, penumbraRadian, umbraRadian, diffuseLightIntensity, specularLightIntensity, 256
        , {debugObject:true, pos:null, size:CreateVec3(10.0, 10.0, 10.0), length:null, targetCamera:mainCamera, texture:"image/spot.png", TargetObjectArray:TransparentStaticObjectArray});
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
    quad.hideBoundInfo = true;
    var normal = CreateVec3(0.0, 1.0, 0.0).GetNormalize();
    quad.setPlane(CreatePlane(normal.x, normal.y, normal.z, -0.1));

    CubeA = CreateCube(gl, StaticObjectArray, CreateVec3(-60.0, 55.0, -20.0), OneVec3, CreateVec3(50, 50, 50)
        , CreateVec4(0.7, 0.7, 0.7, 1.0), colorOnlyShader);
    CubeB = CreateCube(gl, StaticObjectArray, CreateVec3(-65.0, 35.0, 10.0), OneVec3, CreateVec3(50, 50, 50)
        , CreateVec4(0.7, 0.7, 0.7, 1.0), colorOnlyShader);
    CapsuleA = CreateCapsule(gl, StaticObjectArray, CreateVec3(30.0, 30.0, -80.0), 40, 10, 20, 1.0
       , CreateVec4(1.0, 1.0, 0.0, 1.0), colorOnlyShader);
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
    
    // CubeTest = CreateCube(gl, null, pointLight.pos, OneVec3, CreateVec3(25, 25, 25)
    //     , CreateVec4(0.7, 0.7, 0.7, 1.0), CreateTexArrayCubeMapShaderFile());
    if (CubeTest)
    {
        CubeTest.isDisablePipeLineChange = true;
        //CubeTest.hide = true;
    }

    // Create frameBuffer to render at offscreen
    if (dirLight)
    {
        fullscreenQuadBlur = CreateFullScreenQuad(gl, null, null);

        shadowMapDebugQuad = CreateUIQuad(gl, UIStaticObjectArray, 10, 10, 300, 300
            , dirLight.directionalShadowMap.getDepthMap());
        shadowMapDebugQuad.hide = !document.getElementById("ShowDirectionalLightMap").checked;
    }
}

jGame.prototype.Update = function(deltaTime)
{
    var gl = this.gl;

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
    customUpdateForPrimitives();

    // 1. Update lights
    for(var i=0;i<LightArray.length;++i)
    {
        if(LightArray[i].hasOwnProperty('updateFunc'))
            LightArray[i].updateFunc();
    }

    // 2. Update cameras
    for(var i=0;i<Cameras.length;++i)
    {
        updateCamera(gl, i);
        updateCameraFrustum(gl, Cameras[i]);
    }

    // Update static objects
    for(var i = 0;i<StaticObjectArray.length;++i)
    {
        if (StaticObjectArray[i].updateFunc)
            StaticObjectArray[i].updateFunc();
    }

    // Update transparent static objects
    for(var i = 0;i<TransparentStaticObjectArray.length;++i)
    {
        if (TransparentStaticObjectArray[i].updateFunc)
            TransparentStaticObjectArray[i].updateFunc();
    }

    if (CubeTest)
        CubeTest.updateFunc();
}

jGame.prototype.Teardown = function()
{
    removeObject(gizmo);
    removeObject(quad);
    removeObject(CubeA);
    removeObject(CubeB);
    removeObject(CapsuleA);
    removeObject(ConeA);
    removeObject(CylinderA);
    removeObject(TriangleA);
    removeObject(QuadA);
    removeObject(BillboardQuadA);
    removeObject(SphereA);
    removeObject(SphereA);
    removeObject(shadowMapDebugQuad);

    removeObject(dirLight);
    removeObject(pointLight);
    removeObject(spotLight);

    addObject(mainCamera);
}
