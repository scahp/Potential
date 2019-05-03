var SetShadowMapRenderer = function(renderer)
{
    renderer.Reset();
    renderer.ShadowPrePass = GenerateShadowMap;
    renderer.RenderPass = RenderWithShadowMap;
    renderer.UIPass = RenderUI;
}

var vsmTexArrayBlurFrameBuffer = null;

var GenerateShadowMap = function(camera)
{
    var gl = this.gl;
    var shadowMapPipeLineHashCode = null;
    if (ShadowmapType == 3)     // VSM
        shadowMapPipeLineHashCode =  LoadPipeline(CreateVarianceShadowMapShaderFile()).hashCode;
    else
        shadowMapPipeLineHashCode =  LoadPipeline(CreateShadowMapShaderFile()).hashCode;
    
    const omniShadowMapPipeLineHashCode = LoadPipeline(CreateOmniDirectionalShadowMapShaderFile()).hashCode;
    const blurPipeLineHashCode = LoadPipeline(CreateFullscreenBlurShaderFile()).hashCode;
    const blurOmniDirectionalPipeLineHashCode = LoadPipeline(CreateFullscreenBlurOmnidirectionalShaderFile()).hashCode;

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
        
        var maxDist = 0.0;
        if (ShadowmapType == 3)     // VSM
            maxDist = dirLight.directionalShadowMap.camera.far * 2.0;

        gl.clearColor(maxDist, maxDist*maxDist, 0.0, 1.0);
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

        // 1.2 Point Light ShadowMap Generation
        for(var i=0;i<camera.lights.pointLights.length;++i)
            drawOmniShadowMap(camera.lights.pointLights[i].omniShadowMap);

        // 1.3 Spot Light ShadowMap Generation
        for(var i=0;i<camera.lights.spotLights.length;++i)
            drawOmniShadowMap(camera.lights.spotLights[i].omniShadowMap);


        if (ShadowmapType == 3)     // VSM
        {
            /////////////////////////////////////////////////
            // Blur

            const vsmBlurFrameBuffer = getFramebufferFromPool(gl, gl.TEXTURE_2D, gl.RG32F, gl.RG, gl.FLOAT, shadow_width, shadow_height);
            fullscreenQuadBlur.textureArray = null;

            //////////////////////
            // Directional Shadow
            fullscreenQuadBlur.maxDist = dirLight.directionalShadowMap.camera.far * 2.0;

            // vertical
            gl.bindFramebuffer(gl.FRAMEBUFFER, vsmBlurFrameBuffer.fbo);
            gl.viewport(0, 0, shadow_width, shadow_height);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            fullscreenQuadBlur.vertical = true;
            fullscreenQuadBlur.texture = dirLight.directionalShadowMap.getDepthMap();
            fullscreenQuadBlur.drawFunc(null, blurPipeLineHashCode);
            // 원본 텍스쳐 -> 임시 텍스쳐
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            // horizontal
            gl.bindFramebuffer(gl.FRAMEBUFFER, dirLight.directionalShadowMap.framebuffer.fbo);
            gl.viewport(0, 0, shadow_width, shadow_height);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            fullscreenQuadBlur.vertical = false;
            fullscreenQuadBlur.texture = vsmBlurFrameBuffer.tbo;
            fullscreenQuadBlur.drawFunc(null, blurPipeLineHashCode);
            // 임시 텍스쳐 -> 원본 텍스쳐
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            //////////////////////

            returnFramebufferToPool(vsmBlurFrameBuffer);

            //////////////////////
            // Point Light OmniDirectional Shadow

            if (!vsmTexArrayBlurFrameBuffer)
                vsmTexArrayBlurFrameBuffer = getFramebufferFromPool(gl, gl.TEXTURE_2D_ARRAY, gl.RG32F, gl.RG, gl.FLOAT, shadow_width, shadow_height);
            fullscreenQuadBlur.texture = null;

            // vertical
            gl.bindFramebuffer(gl.FRAMEBUFFER, vsmTexArrayBlurFrameBuffer.fbo);
            gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1, gl.COLOR_ATTACHMENT2
                            , gl.COLOR_ATTACHMENT3, gl.COLOR_ATTACHMENT4, gl.COLOR_ATTACHMENT5]);
            gl.viewport(0, 0, shadow_width, shadow_height);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            fullscreenQuadBlur.vertical = true;
            fullscreenQuadBlur.textureArray = pointLight.getShadowMap();
            fullscreenQuadBlur.drawFunc(null, blurOmniDirectionalPipeLineHashCode);                
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            // // horizontal
            gl.bindFramebuffer(gl.FRAMEBUFFER, pointLight.omniShadowMap.mrt.fbo);
            gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1, gl.COLOR_ATTACHMENT2
                            , gl.COLOR_ATTACHMENT3, gl.COLOR_ATTACHMENT4, gl.COLOR_ATTACHMENT5]);
            gl.viewport(0, 0, shadow_width, shadow_height);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            fullscreenQuadBlur.vertical = false;
            fullscreenQuadBlur.textureArray = vsmTexArrayBlurFrameBuffer.tbo;
            fullscreenQuadBlur.drawFunc(null, blurOmniDirectionalPipeLineHashCode);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            ////////////////////

            //////////////////////
            // Spot Light OmniDirectional Shadow

            fullscreenQuadBlur.texture = null;

            // // vertical
            gl.bindFramebuffer(gl.FRAMEBUFFER, vsmTexArrayBlurFrameBuffer.fbo);
            gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1, gl.COLOR_ATTACHMENT2
                            , gl.COLOR_ATTACHMENT3, gl.COLOR_ATTACHMENT4, gl.COLOR_ATTACHMENT5]);
            gl.viewport(0, 0, shadow_width, shadow_height);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            fullscreenQuadBlur.vertical = true;
            fullscreenQuadBlur.textureArray = spotLight.getShadowMap();
            fullscreenQuadBlur.drawFunc(null, blurOmniDirectionalPipeLineHashCode);                
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            // horizontal
            gl.bindFramebuffer(gl.FRAMEBUFFER, spotLight.omniShadowMap.mrt.fbo);
            gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1, gl.COLOR_ATTACHMENT2
                            , gl.COLOR_ATTACHMENT3, gl.COLOR_ATTACHMENT4, gl.COLOR_ATTACHMENT5]);
            gl.viewport(0, 0, shadow_width, shadow_height);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            fullscreenQuadBlur.vertical = false;
            fullscreenQuadBlur.textureArray = vsmTexArrayBlurFrameBuffer.tbo;
            fullscreenQuadBlur.texIndex = i;
            fullscreenQuadBlur.drawFunc(null, blurOmniDirectionalPipeLineHashCode);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            ////////////////////

            //returnFramebufferToPool(vsmTexArrayBlurFrameBuffer);
        }
    }
    
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
        case 3:     // VSM
            defaultPipeLineHashCode = LoadPipeline(CreateBaseShadowMap_VarianceShadowMap_ShaderFile()).hashCode;
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
    for(var i = 0;i<StaticObjectArray.length;++i)
    {
        var obj = StaticObjectArray[i];
        if (obj.drawFunc)
            obj.drawFunc(camera, defaultPipeLineHashCode);
    }

    // 3. Transparent object render
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(true);
    gl.colorMask(true, true, true, true);
    gl.disable(gl.STENCIL_TEST);
    drawStaticTransparentObjects(camera, defaultPipeLineHashCode, -1);

    if (CubeTest && camera.lights.pointLights.length)
    {
        //CubeTest.textureArray = vsmTexArrayBlurFrameBuffer.tbo;
        CubeTest.textureArray = camera.lights.pointLights[0].getShadowMap();
        CubeTest.drawFunc(camera, null, camera.lights.pointLights[0].index);
    }

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
