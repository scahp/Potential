var CreateAmbientLight = function(ambientColor, ambientIntensity)
{
    return { type:"Ambient", ambientColor:ambientColor, ambientIntensity:ambientIntensity };
}

var CreateDirectionalLight = function(gl, TargetArray, direction, lightColor, diffuseLightIntensity, specularLightIntensity, specularPow, debugObjectDesc)
{
    direction = direction.GetNormalize();

    var DirectionalLight = {};
    if (debugObjectDesc.debugObject)
    {
        var texture = LoadTextureFromFile(gl, debugObjectDesc.texture);
        var billboardObject = CreateBillboardQuadTexture(gl, debugObjectDesc.TargetObjectArray
                , debugObjectDesc.pos.CloneVec3(), OneVec3.CloneVec3(), debugObjectDesc.size, texture);
        billboardObject.camera = debugObjectDesc.targetCamera;

        const colorOnlyShader = CreateBaseColorOnlyShaderFile();

        var segment = CreateArrowSegment(gl, debugObjectDesc.TargetObjectArray, ZeroVec3, ZeroVec3.CloneVec3().Add(direction.CloneVec3().Mul(debugObjectDesc.length)), 1.0
            , 3.0, 1.5, CreateVec4(1.0, 1.0, 1.0, 1.0), colorOnlyShader, CreateVec4(1.0, 1.0, 0.1, 1.0), colorOnlyShader);
        segment.pos = debugObjectDesc.pos.CloneVec3();
        segment.isDisablePipeLineChange = true;

        var newStaticObject = {updateFunc:null, drawFunc:null, segment:segment, billboardObject:billboardObject};
        DirectionalLight.__proto__ = newStaticObject;
        addObject(debugObjectDesc.TargetObjectArray, newStaticObject);
    }

    DirectionalLight.type = "Directional";
    DirectionalLight.direction = direction.GetNormalize();
    DirectionalLight.lightColor = lightColor;
    DirectionalLight.diffuseLightIntensity = diffuseLightIntensity;
    DirectionalLight.specularLightIntensity = specularLightIntensity;
    DirectionalLight.specularPow = specularPow;
    DirectionalLight.setHideDebugInfo = function(isHide)
    {
        if (this.__proto__.hasOwnProperty('segment'))
        {
            this.__proto__.segment.segment.hide = isHide;
            this.__proto__.segment.cone.hide = isHide;
        }

        if (this.__proto__.hasOwnProperty('billboardObject'))
        {
            this.__proto__.billboardObject.hide = isHide;
        }
    };
    DirectionalLight.directionalShadowMap = CreateDirectionalShadowMap(gl, DirectionalLight, debugObjectDesc.pos.CloneVec3());
    DirectionalLight.getCamera = function()
    {
        return this.directionalShadowMap.camera;
    }
    DirectionalLight.getShadowMap = function()
    {
        return this.directionalShadowMap.framebuffer.tbo;
    }
    DirectionalLight.getShadowVP = function()
    {
        return CloneMat4(this.directionalShadowMap.camera.matProjection).Mul(this.directionalShadowMap.camera.matView);;
    }
    DirectionalLight.getShadowV = function()
    {
        return CloneMat4(this.directionalShadowMap.camera.matView);;
    }
    DirectionalLight.getESM_C = function()
    {
        return this.directionalShadowMap.ESM_C;
    }
    DirectionalLight.bindLight = function(gl, pipeLine, materialArray)
    {
        setDirectionalLight(gl, pipeLine, this);

        var camera = this.getCamera();
        if (camera)
        {
            setFloatToUniformLocation(gl, pipeLine, 'LightZNear', camera.near);
            setFloatToUniformLocation(gl, pipeLine, 'LightZFar', camera.far);
        }
        setFloatToUniformLocation(gl, pipeLine, 'ESM_C', this.getESM_C());
        setMatrixToUniformLocation(gl, pipeLine, "ShadowVP", this.getShadowVP());
        setMatrixToUniformLocation(gl, pipeLine, "ShadowV", this.getShadowV());
        setVec3ToUniformLocation(gl, pipeLine, "LightPos", this.directionalShadowMap.camera.pos);
        materialArray.push(CreateMaterialProperty(gl.TEXTURE_2D, this.getShadowMap(), "shadow_object", gl.LINEAR, gl.LINEAR));
    }
    addObject(TargetArray, DirectionalLight);
    return DirectionalLight;
}

var CreatePointLight = function(gl, TargetArray, lightPos, lightColor, maxDistance, diffuseLightIntensity, specularLightIntensity, specularPow, debugObjectDesc)
{
    var PointLight = {};
    if (debugObjectDesc.debugObject)
    {
        var texture = LoadTextureFromFile(gl, debugObjectDesc.texture);
        var billboardObject = CreateBillboardQuadTexture(gl, debugObjectDesc.TargetObjectArray, lightPos.CloneVec3(), OneVec3.CloneVec3(), debugObjectDesc.size, texture);
        billboardObject.camera = debugObjectDesc.targetCamera;

        var updateFunc = function()
        {
            billboardObject.pos = PointLight.pos;
            sphere.pos = PointLight.pos;
            sphere.scale.x = PointLight.maxDistance;
            sphere.scale.y = PointLight.maxDistance;
            sphere.scale.z = PointLight.maxDistance;
        }

        var sphere = CreateSphere(gl, debugObjectDesc.TargetObjectArray, lightPos.CloneVec3(), 1.0, 20, CreateVec3(1.0, 1.0, 1.0), CreateVec4(lightColor.x, lightColor.y, lightColor.z, 0.5), CreateBaseColorOnlyShaderFile(), true);
        sphere.isDisablePipeLineChange = true;
        var newStaticObject = {updateFunc:updateFunc, drawFunc:null, segment:null, billboardObject:billboardObject, sphere:sphere};
        PointLight.__proto__ = newStaticObject;
        addObject(debugObjectDesc.TargetObjectArray, newStaticObject);
    }

    PointLight.type = "Point";
    PointLight.pos = lightPos.CloneVec3();
    PointLight.maxDistance = maxDistance;
    PointLight.lightColor = lightColor;
    PointLight.diffuseLightIntensity = diffuseLightIntensity;
    PointLight.specularLightIntensity = specularLightIntensity;
    PointLight.specularPow = specularPow;
    PointLight.setHideDebugInfo = function(isHide)
    {
        if (this.__proto__.hasOwnProperty('sphere'))
            this.__proto__.sphere.hide = isHide;

        if (this.__proto__.hasOwnProperty('billboardObject'))
            this.__proto__.billboardObject.hide = isHide;
    };
    PointLight.omniShadowMap = CreateOmniDirectionalShadowMap2(gl, PointLight);
    PointLight.getNear = function()
    {
        return this.omniShadowMap.near;
    }
    PointLight.getFar = function()
    {
        return this.omniShadowMap.far;
    }
    PointLight.getShadowMap = function()
    {
        return this.omniShadowMap.texture2DArray;
    }
    PointLight.getESM_C = function()
    {
        return this.omniShadowMap.ESM_C;
    }
    PointLight.bindLight = function(gl, pipeLine, materialArray)
    {
        setPointLight(gl, pipeLine, this);

        setFloatToUniformLocation(gl, pipeLine, 'PointLightESM_C', this.getESM_C());
        setFloatToUniformLocation(gl, pipeLine, 'PointLightZNear', this.getNear());
        setFloatToUniformLocation(gl, pipeLine, 'PointLightZFar', this.getFar());
        materialArray.push(CreateMaterialProperty(gl.TEXTURE_2D_ARRAY, this.getShadowMap(), "shadow_object_point_array", gl.LINEAR, gl.LINEAR));
    }
    addObject(TargetArray, PointLight);
    return PointLight;
}

var CreateSpotLight = function(gl, TargetArray, lightPos, lightDirection, lightColor, maxDistance, penumbraRadian, umbraRadian, diffuseLightIntensity, specularLightIntensity, specularPow, debugObjectDesc)
{
    var SpotLight = {};
    if (debugObjectDesc.debugObject)
    {
        var texture = LoadTextureFromFile(gl, debugObjectDesc.texture);
        var billboardObject = CreateBillboardQuadTexture(gl, debugObjectDesc.TargetObjectArray, lightPos.CloneVec3(), OneVec3.CloneVec3(), debugObjectDesc.size, texture);
        billboardObject.camera = debugObjectDesc.targetCamera;

        var updateFunc = function()
        {
            billboardObject.pos = SpotLight.pos;

            const lightDir = SpotLight.lightDirection.CloneVec3().Neg();
            const dirctionToRot = GetEulerAngleFromVec3(lightDir);
            const spotLightPos = SpotLight.pos.CloneVec3().Add(lightDir.CloneVec3().Mul(-umbraCone.scale.y / 2.0));

            const umbraRadius = Math.tan(SpotLight.umbraRadian) * SpotLight.maxDistance;
            umbraCone.scale.x = umbraRadius;
            umbraCone.scale.z = umbraRadius;
            umbraCone.scale.y = SpotLight.maxDistance;
            umbraCone.pos = spotLightPos
            umbraCone.rot = dirctionToRot;

            const penumbraRadius = Math.tan(SpotLight.penumbraRadian) * SpotLight.maxDistance;
            penumbraCone.scale.x = penumbraRadius;
            penumbraCone.scale.z = penumbraRadius;
            penumbraCone.scale.y = SpotLight.maxDistance;
            penumbraCone.pos = spotLightPos
            penumbraCone.rot = dirctionToRot;
        }

        const colorOnlyShader = CreateBaseColorOnlyShaderFile();

        var umbraCone = CreateCone(gl, debugObjectDesc.TargetObjectArray, lightPos.CloneVec3(), 1.0, 1.0, 20.0, CreateVec3(1.0, 1.0, 1.0), CreateVec4(lightColor.x, lightColor.y, lightColor.z, 1.0), colorOnlyShader, true);
        var penumbraCone = CreateCone(gl, debugObjectDesc.TargetObjectArray, lightPos.CloneVec3(), 1.0, 1.0, 20.0, CreateVec3(1.0, 1.0, 1.0), CreateVec4(lightColor.x, lightColor.y, lightColor.z, 0.1), colorOnlyShader, true);
        umbraCone.isDisablePipeLineChange = true;
        penumbraCone.isDisablePipeLineChange = true;
        var newStaticObject = {updateFunc:updateFunc, drawFunc:null, umbraCone:umbraCone, penumbraCone:penumbraCone, segment:null, billboardObject:billboardObject};
        SpotLight.__proto__ = newStaticObject;
        addObject(debugObjectDesc.TargetObjectArray, newStaticObject);
    }

    SpotLight.type = "Spot";
    SpotLight.pos = lightPos.CloneVec3();
    SpotLight.maxDistance = maxDistance;
    SpotLight.lightDirection = lightDirection.GetNormalize();
    SpotLight.lightColor = lightColor;
    SpotLight.penumbraRadian = penumbraRadian;
    SpotLight.umbraRadian = umbraRadian;
    SpotLight.diffuseLightIntensity = diffuseLightIntensity;
    SpotLight.specularLightIntensity = specularLightIntensity;
    SpotLight.specularPow = specularPow;
    SpotLight.setHideDebugInfo = function(isHide)
    {
        if (this.__proto__.hasOwnProperty('umbraCone'))
            this.__proto__.umbraCone.hide = isHide;

        if (this.__proto__.hasOwnProperty('penumbraCone'))
            this.__proto__.penumbraCone.hide = isHide;

        if (this.__proto__.hasOwnProperty('billboardObject'))
            this.__proto__.billboardObject.hide = isHide;
    };
    SpotLight.omniShadowMap = CreateOmniDirectionalShadowMap2(gl, SpotLight);
    SpotLight.getNear = function()
    {
        return this.omniShadowMap.near;
    }
    SpotLight.getFar = function()
    {
        return this.omniShadowMap.far;
    }
    SpotLight.getShadowMap = function()
    {
        return this.omniShadowMap.texture2DArray;
    }
    SpotLight.getESM_C = function()
    {
        return this.omniShadowMap.ESM_C;
    }
    SpotLight.bindLight = function(gl, pipeLine, materialArray)
    {
        setSpotLight(gl, pipeLine, this);
        setFloatToUniformLocation(gl, pipeLine, 'SpotLightESM_C', this.getESM_C());
        setFloatToUniformLocation(gl, pipeLine, 'SpotLightZNear', this.getNear());
        setFloatToUniformLocation(gl, pipeLine, 'SpotLightZFar', this.getFar());
        materialArray.push(CreateMaterialProperty(gl.TEXTURE_2D_ARRAY, this.getShadowMap(), "shadow_object_spot_array", gl.LINEAR, gl.LINEAR));
    }
    addObject(TargetArray, SpotLight);
    return SpotLight;
}

var setAmbientLight = function(gl, pipeLine, light)
{
    setVec3ToUniformLocation(gl, pipeLine, "AmbientLight.Color", light.ambientColor);
    setVec3ToUniformLocation(gl, pipeLine, "AmbientLight.Intensity", light.ambientIntensity);
}

var setDirectionalLight = function(gl, pipeLine, light)
{
    const structName = 'DirectionalLight[' + light.internalIndex + ']';

    setVec3ToUniformLocation(gl, pipeLine, structName + '.' + 'LightDirection', light.direction);
    setVec3ToUniformLocation(gl, pipeLine, structName + '.' + 'Color', light.lightColor);
    setVec3ToUniformLocation(gl, pipeLine, structName + '.' + 'DiffuseLightIntensity', light.diffuseLightIntensity);
    setVec3ToUniformLocation(gl, pipeLine, structName + '.' + 'SpecularLightIntensity', light.specularLightIntensity);
    setFloatToUniformLocation(gl, pipeLine, structName + '.' + 'SpecularPow', light.specularPow);
}

var setPointLight = function(gl, pipeLine, light)
{
    const structName = 'PointLight[' + light.internalIndex + ']';

    setVec3ToUniformLocation(gl, pipeLine, structName + '.' + 'LightPos', light.pos);
    setVec3ToUniformLocation(gl, pipeLine, structName + '.' + 'Color', light.lightColor);
    setVec3ToUniformLocation(gl, pipeLine, structName + '.' + 'DiffuseLightIntensity', light.diffuseLightIntensity);
    setVec3ToUniformLocation(gl, pipeLine, structName + '.' + 'SpecularLightIntensity', light.specularLightIntensity);
    setFloatToUniformLocation(gl, pipeLine, structName + '.' + 'SpecularPow', light.specularPow);
    setFloatToUniformLocation(gl, pipeLine, structName + '.' + 'MaxDistance', light.maxDistance);
}

var setSpotLight = function(gl, pipeLine, light)
{
    const structName = 'SpotLight[' + light.internalIndex + ']';

    setVec3ToUniformLocation(gl, pipeLine, structName + '.' + 'LightPos', light.pos);
    setVec3ToUniformLocation(gl, pipeLine, structName + '.' + 'Direction', light.lightDirection);
    setVec3ToUniformLocation(gl, pipeLine, structName + '.' + 'Color', light.lightColor);
    setVec3ToUniformLocation(gl, pipeLine, structName + '.' + 'DiffuseLightIntensity', light.diffuseLightIntensity);
    setVec3ToUniformLocation(gl, pipeLine, structName + '.' + 'SpecularLightIntensity', light.specularLightIntensity);
    setFloatToUniformLocation(gl, pipeLine, structName + '.' + 'SpecularPow', light.specularPow);
    setFloatToUniformLocation(gl, pipeLine, structName + '.' + 'MaxDistance', light.maxDistance);
    setFloatToUniformLocation(gl, pipeLine, structName + '.' + 'PenumbraRadian', light.penumbraRadian);
    setFloatToUniformLocation(gl, pipeLine, structName + '.' + 'UmbraRadian', light.umbraRadian);
}