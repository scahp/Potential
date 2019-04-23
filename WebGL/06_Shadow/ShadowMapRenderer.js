var SetShadowMapRenderer = function(renderer)
{
    renderer.Reset();
    renderer.ShadowPrePass = GenerateShadowMap;
    renderer.RenderPass = RenderWithShadowMap;
    renderer.UIPass = RenderUI;
}

var GenerateShadowMap = function(camera)
{
    var gl = this.gl;
    const shadowMapPipeLineHashCode =  LoadPipeline(CreateShadowMapShaderFile()).hashCode;
    const omniShadowMapPipeLineHashCode = LoadPipeline(CreateOmniDirectionalShadowMapShaderFile()).hashCode;

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

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
    }

    // 1. ShadowMap pass
    // 1.1 Directional Light ShadowMap Generation
    if (dirLight)
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
    for(var i=0;i<camera.lights.pointLights.length;++i)
        drawOmniShadowMap(camera.lights.pointLights[i].omniShadowMap);

    // 1.3 Spot Light ShadowMap Generation
    for(var i=0;i<camera.lights.spotLights.length;++i)
        drawOmniShadowMap(camera.lights.spotLights[i].omniShadowMap);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

var RenderWithShadowMap = function(camera)
{
    var gl = this.gl;

    var defaultPipeLineHashCode = null;
    switch (ShadowmapType)
    {
        case 1:     // PCF
            if (UsePoissonSample)
                defaultPipeLineHashCode = LoadPipeline(CreateBaseShadowMap_PCF_PoissonSample_ShaderFile()).hashCode;
            else
                defaultPipeLineHashCode = LoadPipeline(CreateBaseShadowMap_PCF_ShaderFile()).hashCode;
        break;
        case 2:     // PCSS
            if (UsePoissonSample)
                defaultPipeLineHashCode = LoadPipeline(CreateBaseShadowMap_PCSS_PoissonSample_ShaderFile()).hashCode;
            else
                defaultPipeLineHashCode = LoadPipeline(CreateBaseShadowMap_PCSS_ShaderFile()).hashCode;
        break;
        default:
            defaultPipeLineHashCode = LoadPipeline(CreateBaseShadowMapShaderFile()).hashCode;
        break;
    }
    

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    
    gl.enable(gl.BLEND);

    gl.clearColor(0.5, 0.5, 0.5, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 2. Light pass
    gl.blendFunc(gl.ONE, gl.ZERO);
    camera.ambient = ambientLight;

    var matShadowVP = null;
    if (dirLight)
        matShadowVP = CloneMat4(dirLight.directionalShadowMap.camera.matProjection).Mul(dirLight.directionalShadowMap.camera.matView);
    
    var matShadowV = null;
    if (dirLight)
        matShadowV = CloneMat4(dirLight.directionalShadowMap.camera.matView);

    for(var i = 0;i<StaticObjectArray.length;++i)
    {
        var obj = StaticObjectArray[i];

        if (dirLight)
            obj.textureShadowMap = dirLight.directionalShadowMap.framebuffer.tbo;
        else
            obj.textureShadowMap = null;
        obj.matShadowVP = matShadowVP;
        obj.matShadowV = matShadowV;
        if (camera.lights.pointLights.length > 0)
            obj.texture2DArray = camera.lights.pointLights[0].omniShadowMap.texture2DArray;
        else
            obj.texture2DArray = null;
        if (camera.lights.spotLights.length > 0)
            obj.spotLightTexture2DArray = camera.lights.spotLights[0].omniShadowMap.texture2DArray;
        else
            obj.spotLightTexture2DArray = null;
        if (obj.drawFunc)
            obj.drawFunc(camera, defaultPipeLineHashCode, 9999);
        obj.textureShadowMap = null;
        obj.matShadowV = null;
        obj.matShadowVP = null;
        obj.texture2DArray = null;
    }
    camera.ambient = null;

    // 3. Transparent object render
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(true);
    gl.colorMask(true, true, true, true);
    gl.disable(gl.STENCIL_TEST);
    drawStaticTransparentObjects(camera, defaultPipeLineHashCode, -1);

    if (CubeTest && camera.lights.pointLights.length)
        CubeTest.drawFunc(camera, null, camera.lights.pointLights[0].index);

    gl.disable(gl.BLEND);
}

var RenderUI = function(camera)
{
    var gl = this.gl;

    gl.disable(gl.DEPTH_TEST);
    // Render To 3D UI
    for(var i=0;i<UIStaticObjectArray.length;++i)
    {
        var obj = UIStaticObjectArray[i];
        if (obj.updateFunc)
            obj.updateFunc();
        if (obj.drawFunc)
            obj.drawFunc(camera, 0, 0);
    }
}
