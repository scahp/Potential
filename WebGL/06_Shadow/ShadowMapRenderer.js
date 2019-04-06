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

    const defaultPipeLineHashCode = LoadPipeline(CreateBaseShadowMapShaderFile()).hashCode;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    
    gl.enable(gl.BLEND);

    gl.clearColor(0.5, 0.5, 0.5, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var drawLightWithOmniShadowMap = function(light, index)
    {
        gl.blendFunc(gl.ONE, gl.ONE);

        for(var i = 0;i<StaticObjectArray.length;++i)
        {
            var obj = StaticObjectArray[i];
    
            obj.textureCubeMap = light.omniShadowMap.depthCubeMap;
            if (obj.drawFunc)
                obj.drawFunc(camera, defaultPipeLineHashCode, index);
            obj.textureCubeMap = null;
        }
    }

    // 2. Light pass
    // 2.1 Directional Light
    gl.blendFunc(gl.ONE, gl.ZERO);
    camera.ambient = ambientLight;

    var matShadowVP = CloneMat4(dirLight.directionalShadowMap.camera.matProjection).Mul(dirLight.directionalShadowMap.camera.matView);

    if (camera.lights.directionalLights.length > 0)
    {
        for(var i = 0;i<StaticObjectArray.length;++i)
        {
            var obj = StaticObjectArray[i];
    
            obj.textureShadowMap = dirLight.directionalShadowMap.framebuffer.tbo;
            obj.matShadowVP = matShadowVP;
            if (obj.drawFunc)
                obj.drawFunc(camera, defaultPipeLineHashCode, 0);
            obj.textureShadowMap = null;
            obj.matShadowVP = null;
        }
    }
    camera.ambient = null;

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
