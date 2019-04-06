var SetShadowVolumeRenderer = function(renderer)
{
    renderer.Reset();
    renderer.RenderPass = RenderWithShadowVolume;
    renderer.DebugRenderPass = RenderShadowVolumeSilhouette;
}

var checkWhetherCanSkipShadowObj = function(camera, obj, lightPos, lightDir, light)
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
        if ((light.type == "Spot"))
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

var RenderWithShadowVolume = function(camera)
{
    const ambientPipeLineHashCode = LoadPipeline(CreateBaseShadowVolumeAmbientOnlyShaderFile()).hashCode;
    const defaultPipeLineHashCode = LoadPipeline(CreateBaseShadowVolumeShaderFile()).hashCode;

    var gl = this.gl;

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

    gl.enable(gl.STENCIL_TEST);
    for(var lightIndex=0;lightIndex<numOfLights;++lightIndex)
    {
        gl.clear(gl.STENCIL_BUFFER_BIT);
        gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.DECR_WRAP, gl.KEEP);
        gl.stencilOpSeparate(gl.BACK, gl.KEEP, gl.INCR_WRAP, gl.KEEP);

        gl.stencilFunc(gl.ALWAYS, 0, 0xff);
        gl.depthFunc(gl.LEQUAL);
        gl.depthMask(false);
        gl.colorMask(false, false, false, false);

        gl.disable(gl.CULL_FACE);

        var lightDir = null;
        var lightPos = null;

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
            }
        }

        {
            gl.enable(gl.POLYGON_OFFSET_FILL);
            gl.polygonOffset(0.0, 100.0);

            for(var i = 0;i<StaticObjectArray.length;++i)
            {
                var obj = StaticObjectArray[i];
                if (checkWhetherCanSkipShadowObj(camera, obj, lightPos, lightDir, light))
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
}

var RenderShadowVolumeSilhouette = function(camera)
{
    const gl = this.gl;

    const defaultPipeLineHashCode = LoadPipeline(CreateBaseShadowVolumeShaderFile()).hashCode;
    
    const numOfLights = camera.getNumOfLights();
    var isSpotlightInFrustum = camera.checkIsInFrustom(spotLightPos.CloneVec3(), spotLightRadius);
    var isPointlightInFrustum = camera.checkIsInFrustom(pointLightPos.CloneVec3(), pointLightRadius);

    // debug shadow volume
    for(var lightIndex=0;lightIndex<numOfLights;++lightIndex)
    {
        var lightDir = null;
        var lightPos = null;
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
            if (checkWhetherCanSkipShadowObj(camera, obj, lightPos, lightDir, light))
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
