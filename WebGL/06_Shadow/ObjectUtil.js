var CreateMaterialProperty = function(textureType, texture, locationName, filterMin = null, filterMag = null)
{
    return { textureType:textureType, texture:texture, locationName:locationName, filter:{mag:filterMag, min:filterMin} };
}

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

        setFloatToUniformLocation(gl, pipeline, 'PCF_Size_Directional', pcf_size_directional);
        setFloatToUniformLocation(gl, pipeline, 'PCF_Size_OmniDirectional', pcf_size_omnidirectional);
    }

    var setMaterialProperty = function(materialArray)
    {
        if (!materialArray)
            return;

        const pipeline = this.pipeLineInfo.pipeLine;

        for(var i=0;i<materialArray.length;++i)
        {
            const material = materialArray[i];
            setIntToUniformLocation(gl, pipeline, material.locationName, i);
            gl.activeTexture(gl.TEXTURE0 + i);
            var textureType = gl.TEXTURE_2D;
            if (material.texture)
            {
                gl.bindTexture(material.textureType, material.texture);
                if (material.textureType)
                    textureType = material.textureType;
            }
            else
            {
                gl.bindTexture(gl.TEXTURE_2D, nullTexture);
            }

            if (material.filter.mag)
                gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, material.filter.mag);
            else
               gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            if (material.filter.min)
                gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, material.filter.min);
            else
               gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

            gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        }
    }

    var drawFunc = function(camera, pipeLineHashCode, lightIndex = -1)
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

        var materialArray = [];
        materialArray.push(CreateMaterialProperty(gl.TEXTURE_2D, this.texture, "tex_object"));
        materialArray.push(CreateMaterialProperty(gl.TEXTURE_2D_ARRAY, this.textureArray, "tex_object_array"));
    
        if (camera)
        {
            if (this.setCameraProperty)
                this.setCameraProperty(camera);

            var useAmbientLight = 0;
            if (camera.UseAmbient && camera.ambient)
            {
                setAmbientLight(gl, pipeLine, camera.ambient);
                useAmbientLight = 1;
            }
            setIntToUniformLocation(gl, pipeLine, "UseAmbientLight", useAmbientLight);

            var numOfDirectionalLight = 0;
            var numOfPointLight = 0;
            var numOfSpotLight = 0;

            // if light index were valid, each light should be used one in a render pass.
            if (lightIndex == -1)
            {
                if (camera.lights)
                {
                    numOfDirectionalLight = camera.lights.directionalLights.length;
                    numOfPointLight = camera.lights.pointLights.length;
                    numOfSpotLight = camera.lights.spotLights.length;

                    for(var i=0;i<camera.lights.all.length;++i)
                        camera.lights.all[i].bindLight(gl, pipeLine, materialArray);
                }
            }
            else
            {
                const light = camera.lights.getLightByIndex(lightIndex);
                if (light)
                {
                    light.bindLight(gl, pipeLine, materialArray);
                    if (light.type == "Directional")
                        numOfDirectionalLight = 1;
                    else if (light.type == "Point")
                        numOfPointLight = 1;
                    else if (light.type == "Spot")
                        numOfSpotLight = 1;
                }
            }

            setIntToUniformLocation(gl, pipeLine, 'NumOfDirectionalLight', numOfDirectionalLight);
            setIntToUniformLocation(gl, pipeLine, 'NumOfPointLight', numOfPointLight);
            setIntToUniformLocation(gl, pipeLine, 'NumOfSpotLight', numOfSpotLight);
        }

        if (this.setMaterialProperty)
            this.setMaterialProperty(materialArray);

        if (this.setMaterialProperty)
            this.setMaterialProperty(materialArray);

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
        , collided:false, hide:false, twoSide:isTwoside, setPipeLine:setPipeLine, isDisablePipeLineChange:isDisablePipeLineChange
        , setMaterialProperty:setMaterialProperty};
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
