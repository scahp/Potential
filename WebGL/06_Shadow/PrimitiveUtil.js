var createAttribParameter = function(name, count, datas, bufferType, type, normalized, stride, offset)
{
    return { name:name, datas:datas, bufferType:bufferType, count:count, type:type, normalized:normalized, stride:stride, offset:offset };
}

var GetAttribDesc = function(color = false, normal = false, uvs = false, ui = false, wireframe = false, shadowVolume = false)
{
    return {color:color, normal:normal, uvs:uvs, ui:ui, wireframe:wireframe, shadowVolume:shadowVolume};
}

var GetShaderFromAttribDesc = function(outShader, attribDesc)
{
    if (attribDesc.color && attribDesc.normal && attribDesc.uvs)
    {
        return;
    }

    if (attribDesc.color && attribDesc.normal)
    {
        outShader.vs = 'shaders/vs.glsl';
        outShader.fs = 'shaders/fs.glsl';
        return;
    }

    if (attribDesc.normal && attribDesc.uvs)
    {
        alert('attribDesc.normal && attribDesc.uvs');
        return;
    }

    if (attribDesc.color && attribDesc.uvs)
    {
        alert('attribDesc.color && attribDesc.uvs');
        return;
    }

    if (attribDesc.color)
    {
        outShader.vs = 'shaders/color_only_vs.glsl';
        outShader.fs = 'shaders/color_only_fs.glsl';
        return;
    }

    if (attribDesc.normal)
    {
        alert('attribDesc.normal');
        return;
    }

    if (attribDesc.uvs)
    {
        outShader.vs = 'shaders/tex_vs.glsl';
        outShader.fs = 'shaders/tex_fs.glsl';
        return;
    }

    if (attribDesc.ui)
    {
        outShader.vs = 'shaders/tex_ui_vs.glsl';
        outShader.fs = 'shaders/tex_ui_fs.glsl';
        return;
    }
}

var GenerateNormal = function(vertices)
{
    var normals = [];
    for(var i=0;i<vertices.length/3;++i)
    {
        var curIndex = i * 3;
        var normal = CreateVec3(vertices[curIndex], vertices[curIndex+1], vertices[curIndex+2]).GetNormalize();
        normals.push(normal.x); normals.push(normal.y); normals.push(normal.z);
    }

    return normals;
}

var GenerateColor = function(color, count)
{
    var colors = [];
    for(var i=0;i<count;++i)
    {
        colors.push(color.x); colors.push(color.y); colors.push(color.z); colors.push(color.w);
    }
    return colors;
}

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
        var addEdge = function(v0Index, v1Index, triangleIndex)
        {
            var result = findEdge(v0Index, v1Index);
            if (!result)
                result = edges[makeEdgeKey(v0Index, v1Index)] = {v0Index:v0Index, v1Index:v1Index, triangleIndex:triangleIndex};
            return result;
        }

        addEdge(v1Index, v0Index, triangleIndex);
        addEdge(v2Index, v1Index, triangleIndex);
        addEdge(v0Index, v2Index, triangleIndex);
        
        var edgeKey0 = makeEdgeKey(v1Index, v0Index);
        var edgeKey1 = makeEdgeKey(v2Index, v1Index);
        var edgeKey2 = makeEdgeKey(v0Index, v2Index);

        var normal = OneVec3.CloneVec3();
        CrossProduct3(normal, verts[v1Index].CloneVec3().Sub(verts[v0Index]), verts[v2Index].CloneVec3().Sub(verts[v0Index]));
        normal = normal.GetNormalize();
        var centerPos = verts[v0Index].CloneVec3().Add(verts[v1Index]).Add(verts[v2Index]).Div(3.0)
        triangles[triangleIndex] = { v0Index:v0Index, v1Index:v1Index, v2Index:v2Index, normal:normal, centerPos:centerPos, edgeKey0:edgeKey0, edgeKey1:edgeKey1, edgeKey2:edgeKey2 };
    }

    if (faces)
    {
        const numOfTriangle = faces.length / 3;
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
        const numOfTriangle = vertices.length / 3;
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

    adjacencyInfo.updatedTransformedAdjacencyInfo = function(matWorld)
    {
        this.normalVers = [];
        for(var key in this.triangles)
        {
            var triangle = this.triangles[key];
            var transformedNormal = triangle.normal.CloneVec3().Transform(matWorld, true);
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

    // create adjacency edge info
    adjacencyInfo.addDebugEdgeObject = function(pos, rot, scale)
    {
        const gl = jWebGL.gl;

        var attribEdges = [];
        var attribEdgesDesc = GetAttribDesc(CreateVec4(1.0, 0.0, 0.0, 1.0), false, false, false, false)
        var elementCount = this.result.length / 3;
        attribEdges.push(createAttribParameter('Pos', 3, this.result, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
        attribEdges.push(createAttribParameter('Color', 4, GenerateColor(attribEdgesDesc.color, elementCount), gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));
        var obj = createStaticObject(gl, attribEdgesDesc, attribEdges, null, 0, elementCount, gl.LINES);
        obj.pos = pos.CloneVec3();
        obj.rot = rot.CloneVec3();
        obj.scale = scale.CloneVec3();
        if (TargetObjectArray)
            TargetObjectArray.push(obj);
        //obj.hide = true;

        this.debugObject.edge = obj;
    };

    // create adjacency normal info
    adjacencyInfo.addDebugNormalObject = function(matWorld)
    {
        const gl = jWebGL.gl;

        // 한번 만들고 업데이트 하는 방식으로 수정해야 함.
        var attribNormal = [];
        var attribNormalDesc = GetAttribDesc(CreateVec4(0.0, 1.0, 0.0, 1.0), false, false, false, false)
        var elementCount = this.normalVers.length / 3;
        attribNormal.push(createAttribParameter('Pos', 3, new Float32Array(this.normalVers), gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
        attribNormal.push(createAttribParameter('Color', 4, GenerateColor(attribNormalDesc.color, elementCount), gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));
        var normalObj = createStaticObject(gl, attribNormalDesc, attribNormal, null, 0, elementCount, gl.LINES);
        if (TargetObjectArray)
            TargetObjectArray.push(normalObj);
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
        this.updatedTransformedAdjacencyInfo(ownerObject.matWorld);

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

var GenerateShadowVolumeInfo = function(adjacencyInfo, isCreateDebugObject = false, TargetObjectArray = null)
{
    shadowVolume = {debugObject:{}, isCreateDebugObject:isCreateDebugObject, adjacencyInfo:adjacencyInfo, isInitialized:false};

    shadowVolume.updateFunc = function(direction)
    {
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

        const extrudeLength = 200.0;
        for(var key in adjacencyInfo.triangles)
        {
            const triangle = adjacencyInfo.triangles[key];
            const v0 = adjacencyInfo.transformedVerts[triangle.v0Index];
            const v1 = adjacencyInfo.transformedVerts[triangle.v1Index];
            const v2 = adjacencyInfo.transformedVerts[triangle.v2Index];

            if (GetDotProduct3(triangle.transformedNormal, direction) > 0.0)
            {
                UpdateEdge(this.edges, triangle.edgeKey0);
                UpdateEdge(this.edges, triangle.edgeKey1);
                UpdateEdge(this.edges, triangle.edgeKey2);

                // back cap
                var eV0 = v0.CloneVec3().Add(direction.CloneVec3().Mul(extrudeLength));
                var eV1 = v1.CloneVec3().Add(direction.CloneVec3().Mul(extrudeLength));
                var eV2 = v2.CloneVec3().Add(direction.CloneVec3().Mul(extrudeLength));
                this.quadVerts.push(eV0.x);   this.quadVerts.push(eV0.y);   this.quadVerts.push(eV0.z);
                this.quadVerts.push(eV1.x);   this.quadVerts.push(eV1.y);   this.quadVerts.push(eV1.z);
                this.quadVerts.push(eV2.x);   this.quadVerts.push(eV2.y);   this.quadVerts.push(eV2.z);
            }
            else
            {
                // front cap
                this.quadVerts.push(v0.x);   this.quadVerts.push(v0.y);   this.quadVerts.push(v0.z);
                this.quadVerts.push(v1.x);   this.quadVerts.push(v1.y);   this.quadVerts.push(v1.z);
                this.quadVerts.push(v2.x);   this.quadVerts.push(v2.y);   this.quadVerts.push(v2.z);
            }
        }

        for(var key in this.edges)
        {
            const edge = adjacencyInfo.edges[this.edges[key]];
            const v0 = adjacencyInfo.transformedVerts[edge.v0Index];
            const v1 = adjacencyInfo.transformedVerts[edge.v1Index];

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
            var v0 = adjacencyInfo.transformedVerts[edge.v0Index];
            var v1 = adjacencyInfo.transformedVerts[edge.v1Index];
            var v2 = v0.CloneVec3().Add(direction.CloneVec3().Mul(extrudeLength));
            var v3 = v1.CloneVec3().Add(direction.CloneVec3().Mul(extrudeLength));
            
            var result = ZeroVec3.CloneVec3();
            CrossProduct3(result, v1.CloneVec3().Sub(v0), v2.CloneVec3().Sub(v0));

            // quad should face to triangle normal
            if (GetDotProduct3(result, adjacencyInfo.triangles[edge.triangleIndex].normal) <= 0.0)
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
            this.quadVerts.push(v0.x);   this.quadVerts.push(v0.y);   this.quadVerts.push(v0.z);
            this.quadVerts.push(v1.x);   this.quadVerts.push(v1.y);   this.quadVerts.push(v1.z);
            this.quadVerts.push(v2.x);   this.quadVerts.push(v2.y);   this.quadVerts.push(v2.z);

            this.quadVerts.push(v2.x);   this.quadVerts.push(v2.y);   this.quadVerts.push(v2.z);
            this.quadVerts.push(v1.x);   this.quadVerts.push(v1.y);   this.quadVerts.push(v1.z);
            this.quadVerts.push(v3.x);   this.quadVerts.push(v3.y);   this.quadVerts.push(v3.z);
        }
        /////////////////////////////////////////

        if (this.isCreateDebugObject)
        {
            if (this.isInitialized)
            {
                this.updateShadowVolumeObject(direction);
            }
            else
            {
                this.createShadowVolumeObject(direction);
                this.isInitialized = true;
            }
        }            
    };

    const createEdgeObj = false;
    const createQuadObj = true;

    shadowVolume.createShadowVolumeObject = function(direction)
    {
        const gl = jWebGL.gl;

        if (createEdgeObj)
        {
            var edgeAttrib = [];
            var edgeAttribDesc = GetAttribDesc(CreateVec4(0.0, 0.0, 1.0, 1.0), false, false, false, false)
            var elementCount = this.edgeVerts.length / 3;
            edgeAttrib.push(createAttribParameter('Pos', 3, new Float32Array(this.edgeVerts), gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
            edgeAttrib.push(createAttribParameter('Color', 4, GenerateColor(edgeAttribDesc.color, elementCount), gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));
            var edgeObj = createStaticObject(gl, edgeAttribDesc, edgeAttrib, null, 0, elementCount, gl.LINES);
            if (TargetObjectArray)
                TargetObjectArray.push(edgeObj);
            this.debugObject.edge = edgeObj;
        }
        
        if (createQuadObj)
        {
            var quadAttrib = [];
            var quadAttribDesc = GetAttribDesc(CreateVec4(0.0, 1.0, 0.0, 0.3), false, false, false, false)
            var elementCount = this.quadVerts.length / 3;
            quadAttrib.push(createAttribParameter('Pos', 3, new Float32Array(this.quadVerts), gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
            quadAttrib.push(createAttribParameter('Color', 4, GenerateColor(quadAttribDesc.color, elementCount), gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));
            var quadObj = createStaticObject(gl, quadAttribDesc, quadAttrib, null, 0, elementCount, gl.TRIANGLES);
            if (TargetObjectArray)
                TargetObjectArray.push(quadObj);
            this.debugObject.quad = quadObj;
        }
    }

    shadowVolume.updateShadowVolumeObject = function(direction)
    {
        const gl = jWebGL.gl;
        
        if (createEdgeObj)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.debugObject.edge.attribs[0].vbo);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.edgeVerts), gl.DYNAMIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.debugObject.edge.attribs[1].vbo);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(GenerateColor(CreateVec4(1.0, 0.0, 0.0, 1.0), this.edgeVerts.length / 3)), gl.DYNAMIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }

        if (createQuadObj)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.debugObject.quad.attribs[0].vbo);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.quadVerts), gl.DYNAMIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.debugObject.quad.attribs[1].vbo);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(GenerateColor(CreateVec4(0.0, 1.0, 0.0, 0.3), this.quadVerts.length / 3)), gl.DYNAMIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
    }

    return shadowVolume;
}

var CreateShadowVolume = function(ownerObject, vertices, faces, targetObjectArray)
{
    ownerObject.adjacencyInfo = GenerateVertexAdjacencyInfo(vertices, faces, true, targetObjectArray);

    var objectArray = [];
    ownerObject.shadowVolume = GenerateShadowVolumeInfo(ownerObject.adjacencyInfo, true, objectArray);
    ownerObject.shadowVolume.objectArray = objectArray;

    ownerObject.updateFunc = function()
    {
        this.adjacencyInfo.updateFunc(this);
    }
}

var CreateCube = function(gl, TargetObjectArray, pos, size, scale, attribDesc)
{
    var halfSize = size.CloneVec3().Div(2.0);
    var offset = ZeroVec3.CloneVec3();

    var vertices = [
        // z +
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z + (halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z + (halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z + (halfSize.z),  

        // z -
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z + (-halfSize.z), 
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z + (-halfSize.z), 
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z + (-halfSize.z), 

        // x +
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z + (halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z + (halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z + (-halfSize.z), 
        
        // x -
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z + (-halfSize.z), 
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z + (-halfSize.z), 
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z + (halfSize.z),  

        // y +
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (halfSize.z),   

        // y -
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z + (halfSize.z),  
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z + (-halfSize.z), 
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z + (halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z + (halfSize.z),  
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z + (-halfSize.z), 
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z + (-halfSize.z), 
    ];

    var elementCount = vertices.length / 3;

    var attribs = [];
    attribs.push(createAttribParameter('Pos', 3, vertices, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));

    if (attribDesc.color)
        attribs.push(createAttribParameter('Color', 4, GenerateColor(attribDesc.color, elementCount), gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));

    if (attribDesc.normal)
    {
        var normals = [
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,

            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,

            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,

            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,

            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
        ];
        attribs.push(createAttribParameter('Normal', 3, normals, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
    }
    
    var newStaticObject = createStaticObject(gl, attribDesc, attribs, null, 0, elementCount, gl.TRIANGLES);
    
    if (attribDesc.shadowVolume)
        CreateShadowVolume(newStaticObject, vertices, null, TargetObjectArray)

    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateQuad = function(gl, TargetObjectArray, pos, size, scale, attribDesc)
{
    var halfSize = size.CloneVec3().Div(2.0);
    var offset = ZeroVec3.CloneVec3();

    var vertices = [
        offset.x + (halfSize.x),    0.0,   offset.z + (-halfSize.z),
        offset.x + (-halfSize.x),   0.0,   offset.z + (-halfSize.z),
        offset.x + (halfSize.x),    0.0,   offset.z + (halfSize.z), 
        offset.x + (halfSize.x),    0.0,   offset.z + (halfSize.z), 
        offset.x + (-halfSize.x),   0.0,   offset.z + (-halfSize.z),
        offset.x + (-halfSize.x),   0.0,   offset.z + (halfSize.z), 
    ];

    var elementCount = vertices.length / 3;

    var attribs = [];
    attribs.push(createAttribParameter('Pos', 3, vertices, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));

    if (attribDesc.color)
        attribs.push(createAttribParameter('Color', 4, GenerateColor(attribDesc.color, elementCount), gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));

    if (attribDesc.normal)
    {
        var normals = [];
        for(var i=0;i<elementCount;++i)
        {
            normals.push(0.0); normals.push(1.0); normals.push(0.0);
        }
        attribs.push(createAttribParameter('Normal', 3, normals, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
    }

    var newStaticObject = createStaticObject(gl, attribDesc, attribs, null, 0, elementCount, gl.TRIANGLES);
    
    if (attribDesc.shadowVolume)
        CreateShadowVolume(newStaticObject, vertices, null, TargetObjectArray);

    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    newStaticObject.plane = null;
    newStaticObject.setPlane = function(plane)
    {
        if (!plane)
            return;
        
        this.plane = plane.ClonePlane();
        this.rot = GetEulerAngleFromVec3(plane.n);
        this.pos = plane.n.CloneVec3().Mul(plane.d);
    };
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateTriangle = function(gl, TargetObjectArray, pos, size, scale, attribDesc)
{
    var halfSize = size.CloneVec3().Div(2.0);
    var offset = ZeroVec3.CloneVec3();

    var vertices = [
        offset.x + (halfSize.x),    0.0,   offset.z + (-halfSize.z),
        offset.x + (-halfSize.x),   0.0,   offset.z + (-halfSize.z),
        offset.x + (halfSize.x),    0.0,   offset.z + (halfSize.z), 
    ];

    var elementCount = vertices.length / 3;

    var attribs = [];
    attribs.push(createAttribParameter('Pos', 3, vertices, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));

    if (attribDesc.color)
        attribs.push(createAttribParameter('Color', 4, GenerateColor(attribDesc.color, elementCount), gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));

    if (attribDesc.normal)
    {
        var normals = [];
        for(var i=0;i<elementCount;++i)
        {
            normals.push(0.0); normals.push(1.0); normals.push(0.0);
        }
        attribs.push(createAttribParameter('Normal', 3, normals, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
    }

    var newStaticObject = createStaticObject(gl, attribDesc, attribs, null, 0, elementCount, gl.TRIANGLE_STRIP);
    
    if (attribDesc.shadowVolume)
        CreateShadowVolume(newStaticObject, vertices, null, TargetObjectArray);

    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateSphere = function(gl, TargetObjectArray, pos, radius, slice, scale, attribDesc)
{
    var vertices = [];
    var offset = ZeroVec3;

    if (slice % 2)
        ++slice;

    var stepRadian = DegreeToRadian(360.0 / slice);
    var halfSlice = parseInt(slice / 2);
    for(var j=0;j<=halfSlice;++j)
    {
        for(var i=0;i<=slice;++i)
        {
            var x = offset.x + Math.cos(stepRadian * i) * radius * Math.sin(stepRadian * j);
            var y = offset.z + Math.cos(stepRadian * j) * radius;
            var z = offset.y + Math.sin(stepRadian * i) * radius * Math.sin(stepRadian * j);
            vertices.push(x); vertices.push(y); vertices.push(z);
        }
    }

    var elementCount = vertices.length / 3;

    var attribs = [];
    attribs.push(createAttribParameter('Pos', 3, vertices, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));

    if (attribDesc.color)
        attribs.push(createAttribParameter('Color', 4, GenerateColor(attribDesc.color, elementCount), gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));

    if (attribDesc.normal)
        attribs.push(createAttribParameter('Normal', 3, GenerateNormal(vertices), gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));

    var faces = [];
    var iCount = 0;
    var toNextSlice = slice+1;
    for(var j=0;j<halfSlice;++j)
    {
        for(var i=0;i<=slice;++i, iCount += 1)
        {
            faces.push(iCount); faces.push(iCount + 1); faces.push(iCount + toNextSlice);
            faces.push(iCount + toNextSlice); faces.push(iCount + 1); faces.push(iCount + toNextSlice + 1);
        }
    }

    var newStaticObject = createStaticObject(gl, attribDesc, attribs, {faces:faces, bufferType:gl.STATIC_DRAW}, 0, elementCount, (attribDesc.wireframe ? gl.LINES : gl.TRIANGLES));
    
    if (attribDesc.shadowVolume)
        CreateShadowVolume(newStaticObject, vertices, faces, TargetObjectArray);

    // 잘 그려진다면, 스텐실 버퍼에 operation 연산을 사용해서 volume을 그리고, 스텐실 버퍼 값을 이용해 물체를 그린다.

    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    if (TargetObjectArray)
       TargetObjectArray.push(newStaticObject);
    //newStaticObject.hide = true;
    return newStaticObject;
}

var CreateTile = function(gl, TargetObjectArray, pos, numOfCol, numOfRow, size, scale, attribDesc)
{
    var vertices = [];

    var offset = ZeroVec3;

    var startPos = CreateVec3(offset.x, offset.y, offset.z);

    for(var i=0;i<numOfRow;++i)
    {
        for(var j=0;j<numOfCol;++j)
        {
            var curOffset = startPos.CloneVec3()
            curOffset.x += (j - numOfRow / 2.0) * size;
            curOffset.z += (i - numOfCol / 2.0) * size;

            var x = curOffset.x;
            var y = curOffset.y;
            var z = curOffset.z;
            vertices.push(x); vertices.push(y); vertices.push(z);

            x = curOffset.x;
            y = curOffset.y;
            z = curOffset.z + size;
            vertices.push(x); vertices.push(y); vertices.push(z);

            x = curOffset.x + size;
            y = curOffset.y;
            z = curOffset.z + size;
            vertices.push(x); vertices.push(y); vertices.push(z);

            x = curOffset.x;
            y = curOffset.y;
            z = curOffset.z;
            vertices.push(x); vertices.push(y); vertices.push(z);

            x = curOffset.x + size;
            y = curOffset.y
            z = curOffset.z + size;
            vertices.push(x); vertices.push(y); vertices.push(z);

            x = curOffset.x + size;
            y = curOffset.y;
            z = curOffset.z;
            vertices.push(x); vertices.push(y); vertices.push(z);

         }
    }

    var elementCount = vertices.length / 3;

    var attribs = [];
    attribs.push(createAttribParameter('Pos', 3, vertices, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));

    if (attribDesc.color)
        attribs.push(createAttribParameter('Color', 4, GenerateColor(attribDesc.color, elementCount), gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));

    if (attribDesc.normal)
    {
        var normals = [];
        for(var i=0;i<vertices.length;++i)
        {
            normals.push(0.0); normals.push(1.0); normals.push(0.0);
        }
        attribs.push(createAttribParameter('Normal', 3, normals, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
    }

    var newStaticObject = createStaticObject(gl, attribDesc, attribs, null, 0, elementCount, gl.TRIANGLES);
    
    if (attribDesc.shadowVolume)
        CreateShadowVolume(newStaticObject, vertices, null, TargetObjectArray);

    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateSegment = function(gl, TargetObjectArray, pos, start, end, time, attribDesc)
{
    var currentEnd = null;
    if (time < 1.0)
    {
        var t = Clamp(time, 0.0, 1.0);
        currentEnd = end.CloneVec3().Sub(start);
        var length = currentEnd.GetLength();
        currentEnd = currentEnd.GetNormalize().Mul(t * length).Add(start);
    }
    else
    {
        currentEnd = end.CloneVec3();
    }

    var vertices = [
        start.x,            start.y,            start.z,
        currentEnd.x,       currentEnd.y,       currentEnd.z,
    ];

    var elementCount = vertices.length / 3;

    var attribs = [];
    attribs.push(createAttribParameter('Pos', 3, vertices, gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));

    var color = OneVec4.CloneVec4();
    if (attribDesc.color)
    {
        color = attribDesc.color.CloneVec4();
        attribs.push(createAttribParameter('Color', 4, GenerateColor(attribDesc.color, elementCount), gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));
    }

    if (attribDesc.normal)
        attribs.push(createAttribParameter('Normal', 3, GenerateNormal(vertices), gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));

    var newStaticObject = createStaticObject(gl, attribDesc, attribs, null, 0, elementCount, gl.LINES);
    
    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(1.0, 1.0, 1.0);
    var segmentStaticObject = {};
    segmentStaticObject.__proto__ = newStaticObject;
    segmentStaticObject.start = start.CloneVec3();
    segmentStaticObject.end = end.CloneVec3();
    segmentStaticObject.color = color;
    segmentStaticObject.time = time;
    segmentStaticObject.getCurrentEnd = function()
    {
        var t = Clamp(this.time, 0.0, 1.0);
        var end = this.end.CloneVec3().Sub(this.start);
        return end.GetNormalize().Mul(t * end.GetLength()).Add(this.start);
    };
    segmentStaticObject.getDirectionNormalized = function()
    {
        return this.end.CloneVec3().Sub(this.start).GetNormalize();
    };
    if (TargetObjectArray)
        TargetObjectArray.push(segmentStaticObject);
    return segmentStaticObject;
}

var UpdateSegmentTime = function(segment, t)
{
    var gl = segment.gl;

    segment.time = t;
    var end = segment.getCurrentEnd();

    var vertices = [
        segment.start.x,       segment.start.y,       segment.start.z,
        end.x,                 end.y,                 end.z,
    ];

    var colors = [
        segment.color.x, segment.color.y, segment.color.z, segment.color.w,
        segment.color.x, segment.color.y, segment.color.z, segment.color.w,
    ];

    gl.bindBuffer(gl.ARRAY_BUFFER, segment.attribs[0].vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, segment.attribs[1].vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

var CreateCone = function(gl, TargetObjectArray, pos, height, radius, slice, scale, attribDesc)
{
    var halfHeight = height/2.0;
    var topVert = CreateVec3(0.0, halfHeight, 0.0);
    var bottomVert = CreateVec3(0.0, -halfHeight, 0.0);

    if (slice % 2)
        ++slice;

    var vertices = [];
    var stepRadian = DegreeToRadian(360.0 / slice);
    for(var i=1;i<=slice;++i)
    {
        var rad = i * stepRadian;
        var prevRad = rad - stepRadian;

        // Top
        vertices.push(topVert.x);                   vertices.push(topVert.y);       vertices.push(topVert.z);
        vertices.push(Math.cos(rad)*radius);        vertices.push(bottomVert.y);    vertices.push(Math.sin(rad)*radius);
        vertices.push(Math.cos(prevRad)*radius);    vertices.push(bottomVert.y);    vertices.push(Math.sin(prevRad)*radius);

        // Bottom
        vertices.push(bottomVert.x);                vertices.push(bottomVert.y);    vertices.push(bottomVert.z);
        vertices.push(Math.cos(prevRad)*radius);    vertices.push(bottomVert.y);    vertices.push(Math.sin(prevRad)*radius);
        vertices.push(Math.cos(rad)*radius);        vertices.push(bottomVert.y);    vertices.push(Math.sin(rad)*radius);
    }

    var currentVertexCnt = vertices.length/3;
    var drawArray = [ {startVert:0, count:currentVertexCnt} ];

    var secondStartVert = currentVertexCnt;

    var elementCount = vertices.length / 3;
    drawArray.push({startVert:secondStartVert, count:(elementCount-secondStartVert)});

    var attribs = [];
    attribs.push(createAttribParameter('Pos', 3, vertices, gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
    
    var color = OneVec4.CloneVec4();
    if (attribDesc.color)
    {
        color = attribDesc.color.CloneVec4();
        attribs.push(createAttribParameter('Color', 4, GenerateColor(attribDesc.color, elementCount), gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));
    }

    if (attribDesc.normal)
    {
        var normals = [];

        // https://stackoverflow.com/questions/51015286/how-can-i-calculate-the-normal-of-a-cone-face-in-opengl-4-5
        // lenght of the flank of the cone
        var flank_len = Math.sqrt(radius*radius + height*height); 

        // unit vector along the flank of the cone
        var cone_x = radius / flank_len; 
        var cone_y = -height / flank_len;
        
        // Cone Top Normal
        for(var i=1;i<=360;++i)
        {
            var rad = DegreeToRadian(i);
            var x = -cone_y * Math.cos(rad);
            var y = cone_x;
            var z = -cone_y * Math.sin(rad);

            // Top
            normals.push(x); normals.push(y); normals.push(z);
            normals.push(x); normals.push(y); normals.push(z);
            normals.push(x); normals.push(y); normals.push(z);

            // Bottom
            normals.push(0.0); normals.push(-1.0); normals.push(0.0);
            normals.push(0.0); normals.push(-1.0); normals.push(0.0);
            normals.push(0.0); normals.push(-1.0); normals.push(0.0);
        }

        /////////////////////////////////////////////////////

        attribs.push(createAttribParameter('Normal', 3, normals, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
    }

    var newStaticObject = createStaticObject(gl, attribDesc, attribs, null, 0, elementCount, (attribDesc.wireframe ? gl.LINES : gl.TRIANGLES));
    
    if (attribDesc.shadowVolume)
        CreateShadowVolume(newStaticObject, vertices, null, TargetObjectArray);

    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    var coneStaticObject = {};
    coneStaticObject.__proto__ = newStaticObject;
    coneStaticObject.height = height;
    coneStaticObject.radius = radius;
    coneStaticObject.color = color;
    if (TargetObjectArray)
        TargetObjectArray.push(coneStaticObject);
    return coneStaticObject;
}

var CreateCylinder = function(gl, TargetObjectArray, pos, height, radius, slice, scale, attribDesc)
{
    var halfHeight = height/2.0;
    var topVert = CreateVec3(0.0, halfHeight, 0.0);
    var bottomVert = CreateVec3(0.0, -halfHeight, 0.0);

    if (slice % 2)
        ++slice;

    var vertices = [];

    var stepRadian = DegreeToRadian(360.0 / slice);
    var halfSlice = parseInt(slice / 2);
    for(var i=0;i<slice;++i)
    {
        var rad = i * stepRadian;
        var prevRad = rad - stepRadian;

        // Top
        vertices.push(topVert.x);                   vertices.push(topVert.y);       vertices.push(topVert.z);
        vertices.push(Math.cos(rad)*radius);        vertices.push(topVert.y);    vertices.push(Math.sin(rad)*radius);
        vertices.push(Math.cos(prevRad)*radius);    vertices.push(topVert.y);    vertices.push(Math.sin(prevRad)*radius);

        // Mid
        vertices.push(Math.cos(prevRad)*radius);    vertices.push(topVert.y);    vertices.push(Math.sin(prevRad)*radius);
        vertices.push(Math.cos(rad)*radius);        vertices.push(topVert.y);    vertices.push(Math.sin(rad)*radius);
        vertices.push(Math.cos(prevRad)*radius);    vertices.push(bottomVert.y);    vertices.push(Math.sin(prevRad)*radius);

        vertices.push(Math.cos(prevRad)*radius);    vertices.push(bottomVert.y);    vertices.push(Math.sin(prevRad)*radius);
        vertices.push(Math.cos(rad)*radius);        vertices.push(topVert.y);    vertices.push(Math.sin(rad)*radius);
        vertices.push(Math.cos(rad)*radius);        vertices.push(bottomVert.y);    vertices.push(Math.sin(rad)*radius);

        // Bottom
        vertices.push(bottomVert.x);                vertices.push(bottomVert.y);    vertices.push(bottomVert.z);
        vertices.push(Math.cos(rad)*radius);        vertices.push(bottomVert.y);    vertices.push(Math.sin(rad)*radius);
        vertices.push(Math.cos(prevRad)*radius);    vertices.push(bottomVert.y);    vertices.push(Math.sin(prevRad)*radius);
    }

    var currentVertexCnt = vertices.length/3;
    var drawArray = [ {startVert:0, count:currentVertexCnt} ];

    var secondStartVert = currentVertexCnt;

    var elementCount = vertices.length / 3;
    drawArray.push({startVert:secondStartVert, count:(elementCount-secondStartVert)});

    var attribs = [];
    attribs.push(createAttribParameter('Pos', 3, vertices, gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
    
    var color = OneVec4.CloneVec4();
    if (attribDesc.color)
    {
        color = attribDesc.color.CloneVec4();
        attribs.push(createAttribParameter('Color', 4, GenerateColor(attribDesc.color, elementCount), gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));
    }

    if (attribDesc.normal)
    {
        var normals = [];

        // https://stackoverflow.com/questions/51015286/how-can-i-calculate-the-normal-of-a-cone-face-in-opengl-4-5
        // lenght of the flank of the cone
        var flank_len = Math.sqrt(radius*radius + height*height); 

        // unit vector along the flank of the cone
        var cone_x = radius / flank_len; 
        var cone_y = -height / flank_len;
        
        // Cone Top Normal
        for(var i=1;i<slice;++i)
        {
            var rad = i * stepRadian;
            var prevRad = rad - stepRadian;

            // Top
            normals.push(0.0); normals.push(1.0); normals.push(0.0);
            normals.push(0.0); normals.push(1.0); normals.push(0.0);
            normals.push(0.0); normals.push(1.0); normals.push(0.0);

            // Mid
            normals.push(Math.cos(prevRad));    normals.push(0.0);    normals.push(Math.sin(prevRad));
            normals.push(Math.cos(rad));        normals.push(0.0);    normals.push(Math.sin(rad));
            normals.push(Math.cos(prevRad));    normals.push(0.0);    normals.push(Math.sin(prevRad));
    
            normals.push(Math.cos(prevRad));    normals.push(0.0);    normals.push(Math.sin(prevRad));
            normals.push(Math.cos(rad));        normals.push(0.0);    normals.push(Math.sin(rad));
            normals.push(Math.cos(rad));        normals.push(0.0);    normals.push(Math.sin(rad));

            // Bottom
            normals.push(0.0); normals.push(-1.0); normals.push(0.0);
            normals.push(0.0); normals.push(-1.0); normals.push(0.0);
            normals.push(0.0); normals.push(-1.0); normals.push(0.0);
        }

        /////////////////////////////////////////////////////

        attribs.push(createAttribParameter('Normal', 3, normals, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
    }

    var newStaticObject = createStaticObject(gl, attribDesc, attribs, null, 0, elementCount, gl.TRIANGLES);
    
    if (attribDesc.shadowVolume)
        CreateShadowVolume(newStaticObject, vertices, null, TargetObjectArray);

    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    var coneStaticObject = {};
    coneStaticObject.__proto__ = newStaticObject;
    coneStaticObject.height = height;
    coneStaticObject.radius = radius;
    coneStaticObject.color = color;
    if (TargetObjectArray)
        TargetObjectArray.push(coneStaticObject);
    return coneStaticObject;
}

var CreateArrowSegment = function(gl, TargetObjectArray, start, end, time, coneHeight, coneRadius, segmentAttribDesc, coneAttribDesc)
{
    var segment = CreateSegment(gl, TargetObjectArray, ZeroVec3, start, end, time, segmentAttribDesc);
    var cone = CreateCone(gl, TargetObjectArray, ZeroVec3, coneHeight, coneRadius, 100, OneVec3, coneAttribDesc);

    var newStaticObject = {updateFunc:null, drawFunc:null, segment:segment, cone:cone};
    newStaticObject.updateFunc = function()
    {
        var pos = null;
        if (this.pos)
            pos = this.pos.CloneVec3();
        else
            pos = OneVec3.CloneVec3();
            
        this.segment.pos = this.pos;
        this.cone.pos = this.pos.CloneVec3().Add(this.segment.getCurrentEnd());
        this.cone.rot = GetEulerAngleFromVec3(this.segment.getDirectionNormalized());
    };
    newStaticObject.pos = OneVec3.CloneVec3();
    TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateCapsule = function(gl, TargetObjectArray, pos, height, radius, slice, scale, attribDesc)
{
    if (height < 0)
    {
        height = 0.0;
        console.log("capsule height must be more than or equal zero.");
    }

    var halfHeight = height / 2;
    var vertices = [];
    var normals = [];

    if (slice % 2)
        ++slice;

    var stepRadian = DegreeToRadian(360.0 / slice);
    var halfSlice = parseInt(slice / 2);
    for(var j=0;j<=halfSlice;++j)
    {
        var isUpperSphere = (j > parseInt(halfSlice / 2));
        var isLowerSphere = (j < parseInt(halfSlice / 2));

        for(var i=0;i<=slice;++i)
        {
            var x = Math.cos(stepRadian * i) * radius * Math.sin(stepRadian * j);
            var y = Math.cos(stepRadian * j) * radius;
            var z = Math.sin(stepRadian * i) * radius * Math.sin(stepRadian * j);
            var yExt = 0.0;
            if (isUpperSphere)
                yExt = -halfHeight;
            if (isLowerSphere)
               yExt = halfHeight;
            vertices.push(x); vertices.push(y+yExt); vertices.push(z);

            var normal = null;
            if (Math.abs(j) < 1)
                normal = CreateVec3(x, 0.0, z).GetNormalize();
            else
                normal = CreateVec3(x, y, z).GetNormalize();
            normals.push(normal.x); normals.push(normal.y); normals.push(normal.z);
        }
    }

    var elementCount = vertices.length / 3;

    var attribs = [];
    attribs.push(createAttribParameter('Pos', 3, vertices, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));

    if (attribDesc.color)
        attribs.push(createAttribParameter('Color', 4, GenerateColor(attribDesc.color, elementCount), gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));

    if (attribDesc.normal)
        attribs.push(createAttribParameter('Normal', 3, normals, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));

    var faces = [];
    var iCount = 0;
    var toNextSlice = slice+1;
    for(var j=0;j<halfSlice;++j)
    {
        for(var i=0;i<=slice;++i, iCount += 1)
        {
            faces.push(iCount); faces.push(iCount + 1); faces.push(iCount + toNextSlice);
            faces.push(iCount + toNextSlice); faces.push(iCount + 1); faces.push(iCount + toNextSlice + 1);
        }
    }

    var newStaticObject = createStaticObject(gl, attribDesc, attribs, {faces:faces, bufferType:gl.STATIC_DRAW}, 0, elementCount, gl.TRIANGLES);
    
    if (attribDesc.shadowVolume)
        CreateShadowVolume(newStaticObject, vertices, faces, TargetObjectArray);

    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale, scale, scale);
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateGizmo = function(gl, TargetObjectArray, pos, rot, scale)
{
    var length = 5;
    var length2 = length*0.6;
    var vertices = [
        0.0,            0.0,        0.0,       
        0.0,            0.0,        length,    
        0.0,            0.0,        length,    
        length2/2,      0.0,        length2,   
        0.0,            0.0,        length,    
        -length2/2,     0.0,        length2,   

        0.0,            0.0,        0.0,       
        length,         0.0,        0.0,       
        length,         0.0,        0.0,       
        length2,        0.0,        length2/2, 
        length,         0.0,        0.0,       
        length2,        0.0,        -length2/2,

        0.0,            0.0,        0.0,       
        0.0,            length,     0.0,       
        0.0,            length,     0.0,       
        length2/2,      length2,    0.0,       
        0.0,            length,     0.0,       
        -length2/2,     length2,    0.0,       
    ];       

    var colors = [
        0, 0, 1, 1,
        0, 0, 1, 1,
        0, 0, 1, 1,
        0, 0, 1, 1,
        0, 0, 1, 1,
        0, 0, 1, 1,
        1, 0, 0, 1,
        1, 0, 0, 1,
        1, 0, 0, 1,
        1, 0, 0, 1,
        1, 0, 0, 1,
        1, 0, 0, 1,
        0, 1, 0, 1,
        0, 1, 0, 1,
        0, 1, 0, 1,
        0, 1, 0, 1,
        0, 1, 0, 1,
        0, 1, 0, 1,
    ];

    var elementCount = vertices.length / 3;

    var attrib0 = createAttribParameter('Pos', 3, vertices, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var attrib1 = createAttribParameter('Color', 4, colors, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0);
    var newStaticObject = createStaticObject(gl, GetAttribDesc(true, false, false), [attrib0, attrib1], null, 0, elementCount, gl.LINES);

    newStaticObject.pos = pos.CloneVec3();
    newStaticObject.rot = rot.CloneVec3();
    newStaticObject.scale = scale.CloneVec3();
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateCoordinateXZObject = function(gl, TargetObjectArray, camera)
{
    var count = 150;
    var interval = 10;
    var halfCount = count / 2.0;

    var vertices = [];
    var colors = [];

    var x;
    var z;
    for(var i=-halfCount;i<=halfCount;++i)
    {
        x = i * interval;
        for(var k=-halfCount;k<=halfCount;++k)
        {
            z = k * interval;

            vertices.push(x + 0.0);         vertices.push(0.0);         vertices.push(z + interval);    colors.push(0.0); colors.push(0.0); colors.push(1.0); colors.push(0.7);
            vertices.push(x + 0.0);         vertices.push(0.0);         vertices.push(z + -interval);   colors.push(0.0); colors.push(0.0); colors.push(1.0); colors.push(0.7);

            vertices.push(x + interval);    vertices.push(0.0);         vertices.push(z + 0.0);         colors.push(1.0); colors.push(0.0); colors.push(0.0); colors.push(0.7);
            vertices.push(x + -interval);   vertices.push(0.0);         vertices.push(z + 0.0);         colors.push(1.0); colors.push(0.0); colors.push(0.0); colors.push(0.7);
        }
    }

    var elementCount = vertices.length / 3;

    var attrib0 = createAttribParameter('Pos', 3, vertices, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var attrib1 = createAttribParameter('Color', 4, colors, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0);
    var newStaticObject = createStaticObject(gl, GetAttribDesc(true, false, false), [attrib0, attrib1], null, 0, elementCount, gl.LINES);
    newStaticObject.updateFunc = function()
    {
        this.pos.x = Math.floor(camera.pos.x / 10) * 10;
        this.pos.z = Math.floor(camera.pos.z / 10) * 10;
    };

    newStaticObject.pos = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(1.0, 1.0, 1.0);
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateCoordinateYObject = function(gl, TargetObjectArray)
{
    var length = 500;
    var vertices = [
        0.0,        length,       0.0,
        0.0,        -length,      0.0,
    ];

    var colors = [
        0, 1, 0, 1,
        0, 1, 0, 1,
    ];

    var elementCount = vertices.length / 3;

    var attrib0 = createAttribParameter('Pos', 3, vertices, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var attrib1 = createAttribParameter('Color', 4, colors, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0);
    var newStaticObject = createStaticObject(gl, GetAttribDesc(true, null, null, null), [attrib0, attrib1], null, 0, elementCount, gl.LINES);

    newStaticObject.pos = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(1.0, 1.0, 1.0);
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateUIQuad = function(gl, TargetObjectArray, x, y, width, height, texture)
{
    var vertices = [
        0.0, 1.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
    ];

    var elementCount = 2;
    var attrib0 = createAttribParameter('VertPos', 2, vertices, gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 2, 0);
    var newStaticObject = createStaticObject(gl, null, GetAttribDesc(null, null, null, true), [attrib0], 0, elementCount, gl.TRIANGLE_STRIP);

    var uiStaticObject = { UIInfo:CreateVec4(x, y, width, height) };
    uiStaticObject.__proto__ = newStaticObject;
    uiStaticObject.texture = texture;
    uiStaticObject.setRenderProperty = function()
    {
        if (this.__proto__.setRenderProperty)
            this.__proto__.setRenderProperty();

        var pixelSizeLoc = gl.getUniformLocation(this.program, 'PixelSize');
        if (pixelSizeLoc)
        {
            var pixelSize = [1.0 / gl.canvas.width, 1.0 / gl.canvas.height];
            gl.uniform2fv(pixelSizeLoc, pixelSize);
        }
    
        var posLoc = gl.getUniformLocation(this.program, 'Pos');
        if (posLoc)
        {
            var pos = [this.UIInfo.x, this.UIInfo.y];
            gl.uniform2fv(posLoc, pos);
        }
    
        var sizeLoc = gl.getUniformLocation(this.program, 'Size');
        if (sizeLoc)
        {
            var size = [this.UIInfo.z, this.UIInfo.w];
            gl.uniform2fv(sizeLoc, size);
        }
    };

    newStaticObject.pos = CreateVec3(0, 0, 0.0);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(1.0, 1.0, 1.0);
    if (TargetObjectArray)
        TargetObjectArray.push(uiStaticObject);
    return uiStaticObject;
}

var CreateBillboardQuad = function(gl, TargetObjectArray, pos, size, scale, attribDesc)
{
    var quad = CreateQuad(gl, TargetObjectArray, pos, size, scale, attribDesc);
    quad.camera = null;
    quad.updateFunc = function()
    {
        if (this.camera)
        {
            var normalizedCameraDir = this.camera.pos.CloneVec3().Sub(this.pos).GetNormalize();
            var eularAngleOfCameraDir = GetEulerAngleFromVec3(normalizedCameraDir);

            this.rot.y = eularAngleOfCameraDir.y;
            this.rot.z = eularAngleOfCameraDir.z;
        }
        else
        {
            console.log('BillboardQuad is updated without camera');
        }
    }
    return quad;
}

var CreateQuadTexture = function(gl, TargetObjectArray, pos, size, scale, texture)
{
    var halfSize = size.CloneVec3().Div(2.0);
    var offset = ZeroVec3.CloneVec3();

    var vertices = [
        offset.x + (-halfSize.x),  0.0,  offset.y + (halfSize.y),  
        offset.x + (halfSize.x),   0.0,  offset.y + (halfSize.y),  
        offset.x + (-halfSize.x),  0.0,  offset.y + (-halfSize.y), 
        offset.x + (halfSize.x),   0.0,  offset.y + (-halfSize.y), 
    ];

    var elementCount = vertices.length / 3;

    var uvs = [
        0.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0,
    ];

    const attribDesc = GetAttribDesc(false, false, true);

    var attrib0 = createAttribParameter('Pos', 3, vertices, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var attrib1 = createAttribParameter('TexCoord', 2, uvs, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 2, 0);
    var newStaticObject = createStaticObject(gl, attribDesc, [attrib0, attrib1], null, 0, elementCount, gl.TRIANGLE_STRIP);
    
    if (attribDesc.shadowVolume)
        CreateShadowVolume(newStaticObject, vertices, null, TargetObjectArray);

    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    newStaticObject.texture = texture;
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateBillboardQuadTexture = function(gl, TargetObjectArray, pos, size, scale, texture)
{
    var quad = CreateQuadTexture(gl, TargetObjectArray, pos, size, scale, texture);
    quad.camera = null;
    quad.updateFunc = function()
    {
        if (this.camera)
        {
            var normalizedCameraDir = this.camera.pos.CloneVec3().Sub(this.pos).GetNormalize();
            var eularAngleOfCameraDir = GetEulerAngleFromVec3(normalizedCameraDir);

            this.rot.y = eularAngleOfCameraDir.y;
            this.rot.z = eularAngleOfCameraDir.z;
        }
        else
        {
            console.log('BillboardQuad is updated without camera');
        }
    }
    return quad;
}

var CreateAmbientLight = function(ambientColor, ambientIntensity)
{
    return { ambientColor:ambientColor, ambientIntensity:ambientIntensity };
}

var CreateDirectionalLight = function(gl, TargetObjectArray, direction, lightColor, diffuseLightIntensity, specularLightIntensity, specularPow, debugObjectDesc)
{
    direction = direction.GetNormalize();

    var DirectionalLight = {};
    if (debugObjectDesc.debugObject)
    {
        var billboardObject = CreateBillboardQuadTexture(gl, TargetObjectArray, debugObjectDesc.pos.CloneVec3(), OneVec3.CloneVec3(), debugObjectDesc.size, debugObjectDesc.texture);
        billboardObject.camera = debugObjectDesc.targetCamera;

        var segment = CreateArrowSegment(gl, TargetObjectArray, ZeroVec3, ZeroVec3.CloneVec3().Add(direction.CloneVec3().Mul(debugObjectDesc.length)), 1.0
            , 3.0, 1.5, GetAttribDesc(CreateVec4(1.0, 1.0, 1.0, 1.0), false, false, false), GetAttribDesc(CreateVec4(1.0, 1.0, 0.1, 1.0), false, false, false));       
        segment.pos = debugObjectDesc.pos.CloneVec3();

        var newStaticObject = {updateFunc:null, drawFunc:null, segment:segment, billboardObject:billboardObject};
        DirectionalLight.__proto__ = newStaticObject;
        TargetObjectArray.push(newStaticObject);
    }

    DirectionalLight.type = "Directional";
    DirectionalLight.direction = direction.CloneVec3().GetNormalize();
    DirectionalLight.lightColor = lightColor;
    DirectionalLight.diffuseLightIntensity = diffuseLightIntensity;
    DirectionalLight.specularLightIntensity = specularLightIntensity;
    DirectionalLight.specularPow = specularPow;
    return DirectionalLight;
}

var CreatePointLight = function(gl, TargetObjectArray, lightPos, lightColor, maxDistance, diffuseLightIntensity, specularLightIntensity, specularPow, debugObjectDesc)
{
    var PointLight = {};
    if (debugObjectDesc.debugObject)
    {
        var billboardObject = CreateBillboardQuadTexture(gl, TargetObjectArray, lightPos.CloneVec3(), OneVec3.CloneVec3(), debugObjectDesc.size, debugObjectDesc.texture);
        billboardObject.camera = debugObjectDesc.targetCamera;

        var updateFunc = function()
        {
            billboardObject.pos = PointLight.pos;
            sphere.pos = PointLight.pos;
            sphere.scale.x = PointLight.maxDistance;
            sphere.scale.y = PointLight.maxDistance;
            sphere.scale.z = PointLight.maxDistance;
        }

        var sphere = CreateSphere(gl, TargetObjectArray, lightPos.CloneVec3(), 1.0, 20, CreateVec3(1.0, 1.0, 1.0), GetAttribDesc(CreateVec4(lightColor.x, lightColor.y, lightColor.z, 0.5), false, false, false, true));
        var newStaticObject = {updateFunc:updateFunc, drawFunc:null, segment:null, billboardObject:billboardObject, sphere:sphere};
        PointLight.__proto__ = billboardObject;
        TargetObjectArray.push(newStaticObject);
    }

    PointLight.type = "Point";
    PointLight.pos = lightPos.CloneVec3();
    PointLight.maxDistance = maxDistance;
    PointLight.lightColor = lightColor;
    PointLight.diffuseLightIntensity = diffuseLightIntensity;
    PointLight.specularLightIntensity = specularLightIntensity;
    PointLight.specularPow = specularPow;

    return PointLight;
}

var CreateSpotLight = function(gl, TargetObjectArray, lightPos, lightDirection, lightColor, maxDistance, penumbraRadian, umbraRadian, diffuseLightIntensity, specularLightIntensity, specularPow, debugObjectDesc)
{
    var SpotLight = {};
    if (debugObjectDesc.debugObject)
    {
        var billboardObject = CreateBillboardQuadTexture(gl, TargetObjectArray, lightPos.CloneVec3(), OneVec3.CloneVec3(), debugObjectDesc.size, debugObjectDesc.texture);
        billboardObject.camera = debugObjectDesc.targetCamera;

        var updateFunc = function()
        {
            billboardObject.pos = SpotLight.pos;

            var dirctionToRot = GetEulerAngleFromVec3(SpotLight.lightDirection);
            var spotLightPos = SpotLight.pos.CloneVec3().Add(SpotLight.lightDirection.CloneVec3().Neg().Mul(umbraCone.scale.y / 2.0));

            var umbraRadius = Math.tan(SpotLight.umbraRadian) * SpotLight.maxDistance;
            umbraCone.scale.x = umbraRadius;
            umbraCone.scale.z = umbraRadius;
            umbraCone.scale.y = SpotLight.maxDistance;
            umbraCone.pos = spotLightPos
            umbraCone.rot = dirctionToRot;

            var penumbraRadius = Math.tan(SpotLight.penumbraRadian) * SpotLight.maxDistance;
            penumbraCone.scale.x = penumbraRadius;
            penumbraCone.scale.z = penumbraRadius;
            penumbraCone.scale.y = SpotLight.maxDistance;
            penumbraCone.pos = spotLightPos
            penumbraCone.rot = dirctionToRot;
        }

        var umbraCone = CreateCone(gl, TargetObjectArray, lightPos.CloneVec3(), 1.0, 1.0, 20.0, CreateVec3(1.0, 1.0, 1.0), GetAttribDesc(CreateVec4(lightColor.x, lightColor.y, lightColor.z, 1.0), false, false, false, true));
        var penumbraCone = CreateCone(gl, TargetObjectArray, lightPos.CloneVec3(), 1.0, 1.0, 20.0, CreateVec3(1.0, 1.0, 1.0), GetAttribDesc(CreateVec4(lightColor.x, lightColor.y, lightColor.z, 0.1), false, false, false, true));
        var newStaticObject = {updateFunc:updateFunc, czdrawFunc:null, umbraCone:umbraCone, penumbraCone:penumbraCone, segment:null, billboardObject:billboardObject};
        SpotLight.__proto__ = billboardObject;
        TargetObjectArray.push(newStaticObject);
    }

    SpotLight.type = "Spot";
    SpotLight.pos = lightPos.CloneVec3();
    SpotLight.maxDistance = maxDistance;
    SpotLight.lightDirection = lightDirection;
    SpotLight.lightColor = lightColor;
    SpotLight.penumbraRadian = penumbraRadian;
    SpotLight.umbraRadian = umbraRadian;
    SpotLight.diffuseLightIntensity = diffuseLightIntensity;
    SpotLight.specularLightIntensity = specularLightIntensity;
    SpotLight.specularPow = specularPow;

    return SpotLight;
}