var createStaticObject = function(gl, shaderInfo, attribParameters, faceInfo, cameraIndex, vertexCount, primitiveType, isTwoside = false, isDisablePipeLineChange = false)
{
    const pipeLineInfo = LoadPipeline(shaderInfo);

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
        var matVP = CloneMat4(camera.matProjection).Mul(camera.matView);

        const pipeline = this.pipeLineInfo.pipeLine;

        setMatrixToUniformLocation(gl, pipeline, "MVP", matMVP);
        setMatrixToUniformLocation(gl, pipeline, "MV", matMV);
        setMatrixToUniformLocation(gl, pipeline, "M", matM);
        setMatrixToUniformLocation(gl, pipeline, "VP", matVP);
        if (this.matShadowVP)
        {
            var t = CreateVec3(0.0, 0.0, 0.0).Transform(this.matShadowV);

            setMatrixToUniformLocation(gl, pipeline, "ShadowVP", CloneMat4(this.matShadowVP));
        }
        if (this.matShadowV)
            setMatrixToUniformLocation(gl, pipeline, "ShadowV", CloneMat4(this.matShadowV));
        setVec3ToUniformLocation(gl, pipeline, "Eye", camera.pos);
        setIntToUniformLocation(gl, pipeline, "Collided", this.collided);

        var pixelSizeLoc = gl.getUniformLocation(pipeline, 'ShadowMapSize');
        if (pixelSizeLoc)
        {
            var pixelSize = [1.0 / shadow_width, 1.0 / shadow_height];
            gl.uniform2fv(pixelSizeLoc, pixelSize);
        }
    }

    var setRenderProperty = function()
    {
        for(var i=0;i<this.attribs.length;++i)
        {
            var attrib = this.attribs[i];
            
            if (attrib.loc == -1)
                continue;//alert('attrib.loc is -1');
            gl.bindBuffer(gl.ARRAY_BUFFER, attrib.vbo);
            gl.vertexAttribPointer(attrib.loc,
                attrib.count,
                attrib.type,
                attrib.normalized,
                attrib.stride,
                attrib.offset);    
            gl.enableVertexAttribArray(attrib.loc);
        }

        const pipeline = this.pipeLineInfo.pipeLine;
        setIntToUniformLocation(gl, pipeline, 'shadow_object_array', 0);

        gl.activeTexture(gl.TEXTURE0);
        if (this.texture)
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        if (this.textureCubeMap)
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.textureCubeMap);
        if (this.texture2DArray)
            gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.texture2DArray);
        
        if (this.textureShadowMap)
        {
            gl.activeTexture(gl.TEXTURE1);
            setIntToUniformLocation(gl, pipeline, 'shadow_object', 1);
            gl.bindTexture(gl.TEXTURE_2D, this.textureShadowMap);
        }

        setFloatToUniformLocation(gl, pipeline, 'PCF_Size_Directional', pcf_size_directional);
        setFloatToUniformLocation(gl, pipeline, 'PCF_Size_OmniDirectional', pcf_size_omnidirectional);
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

        const pipeLine = this.pipeLineInfo.pipeLine;

        gl.useProgram(pipeLine);
    
        if (this.setRenderProperty)
            this.setRenderProperty();
    
        if (this.setCameraProperty)
            this.setCameraProperty(camera);
    
        var useAmbientLight = 0;
        if (camera.ambient)
        {
            setAmbientLight(gl, pipeLine, camera.ambient);
            useAmbientLight = 1;
        }
        setIntToUniformLocation(gl, pipeLine, "UseAmbientLight", useAmbientLight);

        var numOfDirectionalLight = 0;
        var numOfPointLight = 0;
        var numOfSpotLight = 0;

        // Each light should be used one in a render pass.
        const light = camera.lights.getLightByIndex(lightIndex);
        if (light)
        {
            if (light.type == "Directional")
            {
                setDirectionalLight(gl, pipeLine, light);
                numOfDirectionalLight = 1;

                var camera = light.getCamera();
                if (camera)
                {
                    setFloatToUniformLocation(gl, pipeLine, 'LightZNear', camera.near);
                    setFloatToUniformLocation(gl, pipeLine, 'LightZFar', camera.far);
                }
            }
            else if (light.type == "Point")
            {
                setPointLight(gl, pipeLine, light);
                numOfPointLight = 1;

                setFloatToUniformLocation(gl, pipeLine, 'PointLightZNear', light.getNear());
                setFloatToUniformLocation(gl, pipeLine, 'PointLightZFar', light.getFar());
            }
            else if (light.type == "Spot")
            {
                setSpotLight(gl, pipeLine, light);
                numOfSpotLight = 1;

                setFloatToUniformLocation(gl, pipeLine, 'SpotLightZNear', light.getNear());
                setFloatToUniformLocation(gl, pipeLine, 'SpotLightZFar', light.getFar());
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

        setIntToUniformLocation(gl, pipeLine, 'NumOfDirectionalLight', numOfDirectionalLight);
        setIntToUniformLocation(gl, pipeLine, 'NumOfPointLight', numOfPointLight);
        setIntToUniformLocation(gl, pipeLine, 'NumOfSpotLight', numOfSpotLight);

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

        for(var i=0;i<this.attribs.length;++i)
        {
            var attrib = this.attribs[i];
            
            if (attrib.loc == -1)
                continue;//alert('attrib.loc is -1');
            gl.bindBuffer(gl.ARRAY_BUFFER, attrib.vbo);
            gl.disableVertexAttribArray(attrib.loc);
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

var addObject = function(TargetObjectArray, obj)
{
    if (TargetObjectArray && obj)
    {
        obj.ownerObjectArray = TargetObjectArray;
        TargetObjectArray.push(obj);
    }
}

var removeObject = function(obj)
{
    if (obj && obj.ownerObjectArray)
    {
        const index = obj.ownerObjectArray.findIndex(function(item) {return item === obj})
        if (index > -1)
        {
            obj.ownerObjectArray.splice(index, 1);
            obj = null;
        }
    }
}
