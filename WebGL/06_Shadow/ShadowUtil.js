var GenerateVertexAdjacencyInfo = function(vertices, faces, isCreateDebugObject = false, TargetObjectArray = null)
{
    var triangles = [];
    var edges = [];
    var verts = [];
    var VertIndexArray = [];

    var CreateAdjacencyEdgeInfo = function(triangleIndex, v0Index, v1Index, v2Index)
    {
        var addVertex = function(vIndex)
        {
            var vertex = CreateVec3(vertices[vIndex * 3 + 0], vertices[vIndex * 3 + 1], vertices[vIndex * 3 + 2]);

            var find = -1;
            for(var i=0; i<verts.length; i++) 
            {
                if (verts[i].IsNearlyEqual(vertex))
                {
                    find = i;
                    break;
                }
            }

            if (find == -1)
            {
                find = verts.length;
                verts.push(vertex);
            }

            return find;
        }

        v0Index = addVertex(v0Index);
        v1Index = addVertex(v1Index);
        v2Index = addVertex(v2Index);

        if (v0Index == v1Index)
        {
            //alert('[triangleIndex:' + triangleIndex + ']' + 'v0Index == v1Index('+v0Index+')');
            return;
        }
        if (v1Index == v2Index)
        {
            //alert('[triangleIndex:' + triangleIndex + ']'+ 'v1Index == v2Index('+v1Index+')');
            return;
        }
        if (v0Index == v2Index)
        {
            //alert('[triangleIndex:' + triangleIndex + ']' + 'v0Index == v2Index('+v2Index+')');
            return;
        }

        var makeEdgeKey = function(v0Index, v1Index)
        {
            if (v0Index > v1Index)
                return v1Index + ',' + v0Index;

            return v0Index + ',' + v1Index;
        }
        var findEdge = function(v0Index, v1Index)
        {
            return edges[makeEdgeKey(v0Index, v1Index)];
        }
        var addEdge = function(v0Index, v1Index, triangleIndex, indexInTriangle)
        {
            var result = findEdge(v0Index, v1Index);
            if (!result)
                result = edges[makeEdgeKey(v0Index, v1Index)] = {v0Index:v0Index, v1Index:v1Index, triangleIndex:triangleIndex, indexInTriangle:indexInTriangle};
            return result;
        }

        addEdge(v1Index, v0Index, triangleIndex, 0);
        addEdge(v2Index, v1Index, triangleIndex, 1);
        addEdge(v0Index, v2Index, triangleIndex, 2);
        
        var edgeKey0 = makeEdgeKey(v1Index, v0Index);
        var edgeKey1 = makeEdgeKey(v2Index, v1Index);
        var edgeKey2 = makeEdgeKey(v0Index, v2Index);

        var normal = OneVec3.CloneVec3();
        CrossProduct3(normal, verts[v1Index].CloneVec3().Sub(verts[v0Index]), verts[v2Index].CloneVec3().Sub(verts[v0Index]));
        normal = normal.GetNormalize();
        var centerPos = verts[v0Index].CloneVec3().Add(verts[v1Index]).Add(verts[v2Index]).Div(3.0)

        triangles[triangleIndex] = { triangleIndex:triangleIndex, v0Index:v0Index, v1Index:v1Index, v2Index:v2Index, normal:normal, centerPos:centerPos, edgeKey0:edgeKey0, edgeKey1:edgeKey1, edgeKey2:edgeKey2 };
    }

    if (faces)
    {
        const numOfTriangle = (faces.length / 3);
        for(var i=0;i<numOfTriangle;++i)
        {
            const index = i * 3;
            const v0Index = faces[index + 0];
            const v1Index = faces[index + 1];
            const v2Index = faces[index + 2]; 

            CreateAdjacencyEdgeInfo(i, v0Index, v1Index, v2Index);
        }
    }
    else
    {
        const numOfTriangle = vertices.length / 9;     // x, y, z component is stored seperately
        for (var i=0;i<numOfTriangle;++i)
        {
            const index = i * 3;
            const v0Index = index + 0;
            const v1Index = index + 1;
            const v2Index = index + 2;

            CreateAdjacencyEdgeInfo(i, v0Index, v1Index, v2Index);
        }
    }

    var result = [];
    for (var key in edges)
    {
        var v0 = verts[edges[key].v0Index];
        var v1 = verts[edges[key].v1Index];
        result.push(v0.x);
        result.push(v0.y);
        result.push(v0.z);
        result.push(v1.x);
        result.push(v1.y);
        result.push(v1.z);
    }

    var adjacencyInfo = {result:result, triangles:triangles, verts:verts, edges:edges, debugObject:{}, isCreateDebugObject:isCreateDebugObject, isInitialized:false};

    adjacencyInfo.updatedTransformedAdjacencyInfo = function(matWorld, generateTransformedInfo = false)
    {
        if (generateTransformedInfo)
        {
            this.normalVers = [];
            for(var key in this.triangles)
            {
                var triangle = this.triangles[key];
                var transformedNormal = triangle.normal.CloneVec3().Transform(matWorld, true).GetNormalize();
                var transformedCenterPos = triangle.centerPos.CloneVec3().Transform(matWorld);

                triangle.transformedNormal = transformedNormal;
                triangle.transformedCenterPos = transformedCenterPos;
                
                var normalEnd = transformedCenterPos.CloneVec3().Add(transformedNormal.CloneVec3().Mul(2.0));

                this.normalVers.push(transformedCenterPos.x);
                this.normalVers.push(transformedCenterPos.y);
                this.normalVers.push(transformedCenterPos.z);
                this.normalVers.push(normalEnd.x);
                this.normalVers.push(normalEnd.y);
                this.normalVers.push(normalEnd.z);
            }

            this.transformedVerts = [];
            for(var i=0;i<this.verts.length;++i)
            {
                var vert = this.verts[i].CloneVec3();
                this.transformedVerts.push(vert.Transform(matWorld));
            }
        }
    }

    // create adjacency edge info
    adjacencyInfo.addDebugEdgeObject = function(pos, rot, scale)
    {
        const gl = jWebGL.gl;

        var attribEdges = [];
        var elementCount = this.result.length / 3;
        attribEdges.push(createAttribParameter('Pos', 3, this.result, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
        attribEdges.push(createAttribParameter('Color', 4, GenerateColor(CreateVec4(1.0, 0.0, 0.0, 1.0), elementCount), gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));
        var obj = createStaticObject(gl, CreateBaseColorOnlyShaderFile(), attribEdges, null, 0, elementCount, gl.LINES, false, true);
        obj.pos = pos.CloneVec3();
        obj.rot = rot.CloneVec3();
        obj.scale = scale.CloneVec3();
        addObject(TargetObjectArray, obj);
        //obj.hide = true;

        this.debugObject.edge = obj;
    };

    // create adjacency normal info
    adjacencyInfo.addDebugNormalObject = function(matWorld)
    {
        const gl = jWebGL.gl;

        var attribNormal = [];
        var elementCount = this.normalVers.length / 3;
        attribNormal.push(createAttribParameter('Pos', 3, new Float32Array(this.normalVers), gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
        attribNormal.push(createAttribParameter('Color', 4, GenerateColor(CreateVec4(0.0, 1.0, 0.0, 1.0), elementCount), gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));
        var normalObj = createStaticObject(gl, CreateBaseColorOnlyShaderFile(), attribNormal, null, 0, elementCount, gl.LINES, false, true);
        addObject(TargetObjectArray, normalObj);
        //obj.hide = true;
        
        this.debugObject.normal = normalObj;
    }

    adjacencyInfo.updateDebugNormalObject = function()
    {
        const gl = jWebGL.gl;

        const vbo = this.debugObject.normal.attribs[0].vbo;
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);        
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normalVers), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    adjacencyInfo.updateFunc = function(ownerObject)
    {
        this.updatedTransformedAdjacencyInfo(ownerObject.matWorld2);

        if (this.isCreateDebugObject)
        {
            if (this.isInitialized)
            {
                this.debugObject.edge.pos = CreateVec3(ownerObject.pos.x, ownerObject.pos.y, ownerObject.pos.z);
                this.debugObject.edge.rot = CreateVec3(ownerObject.rot.x, ownerObject.rot.y, ownerObject.rot.z);
                this.debugObject.edge.scale = CreateVec3(ownerObject.scale.x, ownerObject.scale.y, ownerObject.scale.z);

                this.updateDebugNormalObject();
            }
            else
            {
                this.addDebugEdgeObject(ownerObject.pos, ownerObject.rot, ownerObject.scale);
                this.addDebugNormalObject(ownerObject.matWorld);
                this.isInitialized = true;
            }
        }
    }

    return adjacencyInfo;
}

var GenerateShadowVolumeInfo = function(adjacencyInfo, isTwoSide, isCreateDebugObject = false, TargetObjectArray = null)
{
    shadowVolume = {debugObject:{}, isCreateDebugObject:isCreateDebugObject, adjacencyInfo:adjacencyInfo, isInitialized:false};

    shadowVolume.updateFunc = function(lightDirection, lightPos, ownerObject)
    {
        const matWorldInv = CloneMat4(ownerObject.matWorld).GetInverse();
        var lightDirWorldInv = null;
        if (lightDirection)
            lightDirWorldInv = lightDirection.CloneVec3().Transform(matWorldInv, true);
        var lightPosWorldInv = null;
        if (lightPos)
            lightPosWorldInv = lightPos.CloneVec3().Transform(matWorldInv);

        var getLightDirection = function(pos)
        {
            if (lightDirWorldInv)
                return lightDirWorldInv;
            
            if (lightPosWorldInv)
                return pos.CloneVec3().Sub(lightPosWorldInv);
            
            alert('lightDirection or lightPos should be not null');
            return null;
        }
        
        this.edges = [];
        this.edgeVerts = [];
        this.quadVerts = [];

        // 에지 검출
        var UpdateEdge = function(edges, edgeKey)
        {
            if (edges[edgeKey])
                delete edges[edgeKey];
            else
                edges[edgeKey] = edgeKey;
        }

        var backfaceToLightDirInTriangle = [];
        for(var key in adjacencyInfo.triangles)
        {
            const triangle = adjacencyInfo.triangles[key];
            var v0 = adjacencyInfo.verts[triangle.v0Index];
            var v1 = adjacencyInfo.verts[triangle.v1Index];
            var v2 = adjacencyInfo.verts[triangle.v2Index];

            var lightDir = getLightDirection(triangle.centerPos);
            const isBackfaceToLight = (GetDotProduct3(triangle.normal, lightDir) > 0.0);
            backfaceToLightDirInTriangle[triangle.triangleIndex] = isBackfaceToLight;

            var needFrontCap = false;
            var needBackCap = false;
            if (isTwoSide)
            {
                needFrontCap = true;
                needBackCap = true;
            }
            else
            {
                if (!isBackfaceToLight)
                    needFrontCap = true;
                else
                    needBackCap = true;
            }

            if (needFrontCap)
            {
                UpdateEdge(this.edges, triangle.edgeKey0);
                UpdateEdge(this.edges, triangle.edgeKey1);
                UpdateEdge(this.edges, triangle.edgeKey2);

                // front cap
                if (isBackfaceToLight)
                {
                    var temp = v2;
                    v2 = v1;
                    v1 = temp;
                }
                this.quadVerts.push(v0.x);   this.quadVerts.push(v0.y);   this.quadVerts.push(v0.z);    this.quadVerts.push(1.0);
                this.quadVerts.push(v1.x);   this.quadVerts.push(v1.y);   this.quadVerts.push(v1.z);    this.quadVerts.push(1.0);
                this.quadVerts.push(v2.x);   this.quadVerts.push(v2.y);   this.quadVerts.push(v2.z);    this.quadVerts.push(1.0);
            }

            if (needBackCap)
            {    
                // back cap
                if (isTwoSide || !isBackfaceToLight)
                {
                    var temp = v2;
                    v2 = v1;
                    v1 = temp;
                }

                this.quadVerts.push(v0.x);   this.quadVerts.push(v0.y);   this.quadVerts.push(v0.z);    this.quadVerts.push(0.0);
                this.quadVerts.push(v1.x);   this.quadVerts.push(v1.y);   this.quadVerts.push(v1.z);    this.quadVerts.push(0.0);
                this.quadVerts.push(v2.x);   this.quadVerts.push(v2.y);   this.quadVerts.push(v2.z);    this.quadVerts.push(0.0);
            }
        }

        for(var key in this.edges)
        {
            const edge = adjacencyInfo.edges[this.edges[key]];
            const v0 = adjacencyInfo.verts[edge.v0Index];
            const v1 = adjacencyInfo.verts[edge.v1Index];

            this.edgeVerts.push(v0.x);
            this.edgeVerts.push(v0.y);
            this.edgeVerts.push(v0.z);
            this.edgeVerts.push(v1.x);
            this.edgeVerts.push(v1.y);
            this.edgeVerts.push(v1.z);
        }
        /////////////////////////////////////////

        // 생성된 Edge로 Quad 생성
        for(var key in this.edges)
        {
            const edge = adjacencyInfo.edges[this.edges[key]];
            const triangle = adjacencyInfo.triangles[edge.triangleIndex];
            var lightDir = getLightDirection(triangle.centerPos);

            var v0 = adjacencyInfo.verts[edge.v0Index];
            var v1 = adjacencyInfo.verts[edge.v1Index];
            var v2 = v0.CloneVec3();
            var v3 = v1.CloneVec3();
            
            // quad should face to triangle normal
            const isBackfaceToLight = backfaceToLightDirInTriangle[triangle.triangleIndex];
            
            if (isBackfaceToLight)            
            {
                {
                    var temp = v0;
                    v0 = v1;
                    v1 = temp;
                }

                {
                    var temp = v2;
                    v2 = v3;
                    v3 = temp;
                }
            }

            this.quadVerts.push(v0.x);   this.quadVerts.push(v0.y);   this.quadVerts.push(v0.z);    this.quadVerts.push(1.0);
            this.quadVerts.push(v1.x);   this.quadVerts.push(v1.y);   this.quadVerts.push(v1.z);    this.quadVerts.push(1.0);
            this.quadVerts.push(v2.x);   this.quadVerts.push(v2.y);   this.quadVerts.push(v2.z);    this.quadVerts.push(0.0);

            this.quadVerts.push(v2.x);   this.quadVerts.push(v2.y);   this.quadVerts.push(v2.z);    this.quadVerts.push(0.0);
            this.quadVerts.push(v1.x);   this.quadVerts.push(v1.y);   this.quadVerts.push(v1.z);    this.quadVerts.push(1.0);
            this.quadVerts.push(v3.x);   this.quadVerts.push(v3.y);   this.quadVerts.push(v3.z);    this.quadVerts.push(0.0);
        }
        /////////////////////////////////////////

        if (this.isInitialized)
        {
            this.updateShadowVolumeObject();
        }
        else
        {
            this.createShadowVolumeObject();
            this.isInitialized = true;
        }

        this.debugObject.quad.pos = ownerObject.pos.CloneVec3();
        this.debugObject.quad.rot = ownerObject.rot.CloneVec3();
        this.debugObject.quad.scale = ownerObject.scale.CloneVec3();
    };

    const createEdgeObj = isCreateDebugObject;
    const createQuadObj = true;

    shadowVolume.createShadowVolumeObject = function()
    {
        const gl = jWebGL.gl;

        if (createEdgeObj)
        {
            var edgeAttrib = [];
            var elementCount = this.edgeVerts.length / 3;
            edgeAttrib.push(createAttribParameter('Pos', 3, new Float32Array(this.edgeVerts), gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
            edgeAttrib.push(createAttribParameter('Color', 4, GenerateColor(CreateVec4(0.0, 0.0, 1.0, 1.0), elementCount), gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));
            var edgeObj = createStaticObject(gl, CreateBaseColorOnlyShaderFile(), edgeAttrib, null, 0, elementCount, gl.LINES, false, true);
            addObject(TargetObjectArray, edgeObj);
            this.debugObject.edge = edgeObj;
        }
        
        if (createQuadObj)
        {
            var quadAttrib = [];
            var elementCount = this.quadVerts.length / 4;
            quadAttrib.push(createAttribParameter('Pos', 4, new Float32Array(this.quadVerts), gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));
            quadAttrib.push(createAttribParameter('Color', 4, GenerateColor(CreateVec4(0.0, 1.0, 0.0, 0.3), elementCount), gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));
            var quadObj = createStaticObject(gl, CreateBaseInfinityFarShaderFile(), quadAttrib, null, 0, elementCount, gl.TRIANGLES, false, true);
            addObject(TargetObjectArray, quadObj);
            this.debugObject.quad = quadObj;
            this.isDisablePipeLineChange = true;
        }
    }

    shadowVolume.updateShadowVolumeObject = function()
    {
        const gl = jWebGL.gl;
        
        if (createEdgeObj)
        {
            const elementCount = this.edgeVerts.length / 3;

            gl.bindBuffer(gl.ARRAY_BUFFER, this.debugObject.edge.attribs[0].vbo);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.edgeVerts), gl.DYNAMIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.debugObject.edge.attribs[1].vbo);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(GenerateColor(CreateVec4(1.0, 0.0, 0.0, 1.0), elementCount)), gl.DYNAMIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            this.debugObject.edge.drawArray = [ {startVert:0, count:elementCount} ];
        }

        if (createQuadObj)
        {
            const elementCount = this.quadVerts.length / 4;

            gl.bindBuffer(gl.ARRAY_BUFFER, this.debugObject.quad.attribs[0].vbo);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.quadVerts), gl.DYNAMIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.debugObject.quad.attribs[1].vbo);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(GenerateColor(CreateVec4(0.0, 1.0, 0.0, 0.3), elementCount)), gl.DYNAMIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            this.debugObject.quad.drawArray = [ {startVert:0, count:elementCount} ];
        }
    }

    return shadowVolume;
}

var CreateShadowVolume = function(ownerObject, vertices, faces, targetObjectArray)
{
    const createDebugObject = false;

    ownerObject.adjacencyInfo = GenerateVertexAdjacencyInfo(vertices, faces, createDebugObject, targetObjectArray);

    var objectArray = [];
    ownerObject.shadowVolume = GenerateShadowVolumeInfo(ownerObject.adjacencyInfo, ownerObject.twoSide, createDebugObject, objectArray);
    ownerObject.shadowVolume.objectArray = objectArray;

    ownerObject.updateFunc = function()
    {
        this.adjacencyInfo.updateFunc(this);
    }
}

var CreateDirectionalShadowMap = function(gl, dirLight, pos)
{
    var framebuffer = CraeteFramebufferRG(gl, shadow_width, shadow_height);
    // var eye = dirLight.direction.CloneVec3().Mul(-100.0);
    // var target = ZeroVec3.CloneVec3();
    var eye = ZeroVec3.CloneVec3();
    var target = dirLight.direction.CloneVec3().Mul(1.0);

    // var rightVec = new jVec3();
    // CrossProduct3(rightVec, target.CloneVec3().Sub(eye).GetNormalize(), CreateVec3(0.0, 1.0, 0.0));
    // rightVec = rightVec.GetNormalize();

    // var upVec = new jVec3();
    // CrossProduct3(upVec, rightVec, target.CloneVec3().Sub(eye).GetNormalize());
    // upVec = upVec.GetNormalize();
    var upVec = new jVec3();
    upVec = CreateVec3(0.0, 0.0, 1.0);

    eye.Add(pos);
    target.Add(pos);
    upVec.Add(pos);

    var camera = CreateCamera(gl, eye, target, upVec, DegreeToRadian(45), 10.0, 600.0, false, false);

    var getDepthMap = function()
    {
        if (this.framebuffer)
            return this.framebuffer.tbo;
        return null;
    }

    camera.addLight(dirLight);

    return {camera:camera, framebuffer:framebuffer, getDepthMap:getDepthMap};
}

var CreateOmniDirectionalShadowMap = function(gl, light)
{
    const depthCubeMap = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, depthCubeMap);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    var framebuffers = [];
    var renderbuffers = [];
    for(var i=0;i<6;++i)
    {
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.R32F
            , shadow_width, shadow_height, 0, gl.RED, gl.FLOAT, null);
    }

    for(var i=0;i<6;++i)
    {
        var depthMapFBO = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, depthMapFBO);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, depthCubeMap, 0);

        var rbo = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, shadow_width, shadow_height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo);

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
        {
            var status_code = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
            alert("failed to create framebuffer, " + i + ", is not complete: " + status_code);
            return null;
        }

        framebuffers.push(depthMapFBO);
        renderbuffers.push(rbo);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    var cameras = [];
    const lightPos = light.pos;

    cameras.push(CreateCamera(gl, lightPos.CloneVec3(), lightPos.CloneVec3().Add(CreateVec3(1.0, 0.0, 0.0)), lightPos.CloneVec3().Add(CreateVec3(0.0, -1.0, 0.0)), DegreeToRadian(45), 10.0, 500.0, false));
    cameras.push(CreateCamera(gl, lightPos.CloneVec3(), lightPos.CloneVec3().Add(CreateVec3(-1.0, 0.0, 0.0)), lightPos.CloneVec3().Add(CreateVec3(0.0, -1.0, 0.0)), DegreeToRadian(45), 10.0, 500.0, false));
    cameras.push(CreateCamera(gl, lightPos.CloneVec3(), lightPos.CloneVec3().Add(CreateVec3(0.0, 1.0, 0.0)), lightPos.CloneVec3().Add(CreateVec3(0.0, 0.0, 1.0)), DegreeToRadian(45), 10.0, 500.0, false));
    cameras.push(CreateCamera(gl, lightPos.CloneVec3(), lightPos.CloneVec3().Add(CreateVec3(0.0, -1.0, 0.0)), lightPos.CloneVec3().Add(CreateVec3(0.0, 0.0, -1.0)), DegreeToRadian(45), 10.0, 500.0, false));
    cameras.push(CreateCamera(gl, lightPos.CloneVec3(), lightPos.CloneVec3().Add(CreateVec3(0.0, 0.0, 1.0)), lightPos.CloneVec3().Add(CreateVec3(0.0, -1.0, 0.0)), DegreeToRadian(45), 10.0, 500.0, false));
    cameras.push(CreateCamera(gl, lightPos.CloneVec3(), lightPos.CloneVec3().Add(CreateVec3(0.0, 0.0, -1.0)), lightPos.CloneVec3().Add(CreateVec3(0.0, -1.0, 0.0)), DegreeToRadian(45), 10.0, 500.0, false));

    for(var i=0;i<cameras.length;++i)
        cameras[i].addLight(light);

    return {depthCubeMap:depthCubeMap, framebuffers:framebuffers, renderbuffers:renderbuffers, cameras:cameras};
}

var CraeteFramebufferRGForOmniDirectionalShadowMap = function(gl, width, height)
{
    const texture2DArray = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture2DArray);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RG32F, width, height, 6, 0, gl.RG, gl.FLOAT, null);

    var framebuffers = [];
    var renderbuffers = [];

    for(var i=0;i<6;++i)
    {
        var depthMapFBO = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, depthMapFBO);
        gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, texture2DArray, 0, i);

        var rbo = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, shadow_width, shadow_height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo);

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
        {
            var status_code = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
            alert("failed to create framebuffer, " + i + ", is not complete: " + status_code);
            return null;
        }

        framebuffers.push(depthMapFBO);
        renderbuffers.push(rbo);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return { framebuffers:framebuffers, renderbuffers:renderbuffers, texture2DArray:texture2DArray };
}

var CreateOmniDirectionalShadowMap2 = function(gl, light)
{
    const texture2DArray = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture2DArray);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RG32F, shadow_width, shadow_height, 6, 0, gl.RG, gl.FLOAT, null);

    var framebuffers = [];
    var renderbuffers = [];

    for(var i=0;i<6;++i)
    {
        var depthMapFBO = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, depthMapFBO);
        gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, texture2DArray, 0, i);

        var rbo = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, shadow_width, shadow_height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo);

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
        {
            var status_code = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
            alert("failed to create framebuffer, " + i + ", is not complete: " + status_code);
            return null;
        }

        framebuffers.push(depthMapFBO);
        renderbuffers.push(rbo);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    ////////////////////////////////////////
    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    for(var i=0;i<6;++i)
        gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, texture2DArray, 0, i);

    var rbo = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, shadow_width, shadow_height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
    {
        var status_code = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        alert("failed to create framebuffer, " + i + ", is not complete: " + status_code);
        return;
    }
    ////////////////////////////////////////

    var cameras = [];
    const lightPos = light.pos;

    const near = 10.0;
    const far = 500.0;

    cameras.push(CreateCamera(gl, lightPos.CloneVec3(), lightPos.CloneVec3().Add(CreateVec3(1.0, 0.0, 0.0)), lightPos.CloneVec3().Add(CreateVec3(0.0, 1.0, 0.0)), DegreeToRadian(45), near, far, false));
    cameras.push(CreateCamera(gl, lightPos.CloneVec3(), lightPos.CloneVec3().Add(CreateVec3(-1.0, 0.0, 0.0)), lightPos.CloneVec3().Add(CreateVec3(0.0, 1.0, 0.0)), DegreeToRadian(45), near, far, false));
    cameras.push(CreateCamera(gl, lightPos.CloneVec3(), lightPos.CloneVec3().Add(CreateVec3(0.0, 1.0, 0.0)), lightPos.CloneVec3().Add(CreateVec3(0.0, 0.0, -1.0)), DegreeToRadian(45), near, far, false));
    cameras.push(CreateCamera(gl, lightPos.CloneVec3(), lightPos.CloneVec3().Add(CreateVec3(0.0, -1.0, 0.0)), lightPos.CloneVec3().Add(CreateVec3(0.0, 0.0, 1.0)), DegreeToRadian(45), near, far, false));
    cameras.push(CreateCamera(gl, lightPos.CloneVec3(), lightPos.CloneVec3().Add(CreateVec3(0.0, 0.0, 1.0)), lightPos.CloneVec3().Add(CreateVec3(0.0, 1.0, 0.0)), DegreeToRadian(45), near, far, false));
    cameras.push(CreateCamera(gl, lightPos.CloneVec3(), lightPos.CloneVec3().Add(CreateVec3(0.0, 0.0, -1.0)), lightPos.CloneVec3().Add(CreateVec3(0.0, 1.0, 0.0)), DegreeToRadian(45), near, far, false));

    for(var i=0;i<cameras.length;++i)
        cameras[i].addLight(light);

    return {texture2DArray:texture2DArray, framebuffers:framebuffers, renderbuffers:renderbuffers, cameras:cameras, near:near, far:far, mrt:{fbo:fbo, rbo:rbo}};
}
