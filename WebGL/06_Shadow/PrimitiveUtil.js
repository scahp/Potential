var createAttribParameter = function(name, count, datas, bufferType, type, normalized, stride, offset)
{
    return { name:name, datas:datas, bufferType:bufferType, count:count, type:type, normalized:normalized, stride:stride, offset:offset };
}

var CreateCubeMapShaderFile = function()
{
    const vs = "shaders/shadowmap/vs_cubemap.glsl";
    const fs = "shaders/shadowmap/fs_cubemap.glsl";

    return {vs:vs, fs:fs};
}

var CreateShadowMapShaderFile = function()
{
    const vs = "shaders/shadowmap/vs_shadowMap.glsl";
    const fs = "shaders/shadowmap/fs_shadowMap.glsl";

    return {vs:vs, fs:fs};
}

var CreateOmniDirectionalShadowMapShaderFile = function()
{
    const vs = "shaders/shadowmap/vs_omniDirectionalShadowMap.glsl";
    const fs = "shaders/shadowmap/fs_omniDirectionalShadowMap.glsl";

    return {vs:vs, fs:fs};
}

var CreateBaseInfinityFarShaderFile = function()
{
    const vs = "shaders/shadowvolume/vs_infinityFar.glsl";
    const fs = "shaders/shadowvolume/fs_infinityFar.glsl";

    return {vs:vs, fs:fs};
}

var CreateBaseShadowVolumeShaderFile = function()
{
    const vs = "shaders/shadowvolume/vs.glsl";
    const fs = "shaders/shadowvolume/fs.glsl";

    return {vs:vs, fs:fs};
}

var CreateBaseShadowMapShaderFile = function()
{
    const vs = "shaders/shadowmap/vs.glsl";
    const fs = "shaders/shadowmap/fs.glsl";

    return {vs:vs, fs:fs};
}

var CreateBaseShadowVolumeAmbientOnlyShaderFile = function()
{
    const vs = "shaders/shadowvolume/vs.glsl";
    const fs = "shaders/shadowvolume/fs_ambientonly.glsl";

    return {vs:vs, fs:fs};
}

var CreateBaseColorOnlyShaderFile = function()
{
    const vs = 'shaders/color_only_vs.glsl';
    const fs = 'shaders/color_only_fs.glsl';

    return {vs:vs, fs:fs};
}

var CreateBaseTextureShaderFile = function()
{
    const vs = 'shaders/tex_vs.glsl';
    const fs = 'shaders/tex_fs.glsl';

    return {vs:vs, fs:fs};
}

var CreateBaseUIShaderFile = function()
{
    const vs = 'shaders/tex_ui_vs.glsl';
    const fs = 'shaders/tex_ui_fs.glsl';

    return {vs:vs, fs:fs};
}

var GetShaderFromAttribDesc = function(outShader, attribDesc)
{
    if (attribDesc.cubeMapTest)
    {
        outShader.vs = "shaders/shadowmap/vs_cubemap.glsl";
        outShader.fs = "shaders/shadowmap/fs_cubemap.glsl";
        return;
    }

    if (attribDesc.shadowMap)
    {
        outShader.vs = "shaders/shadowmap/vs_shadowMap.glsl";
        outShader.fs = "shaders/shadowmap/fs_shadowMap.glsl";
        return;
    }

    if (attribDesc.omniDirectionalShadowMap)
    {
        outShader.vs = "shaders/shadowmap/vs_omniDirectionalShadowMap.glsl";
        outShader.fs = "shaders/shadowmap/fs_omniDirectionalShadowMap.glsl";
        return;
    }

    if (attribDesc.color && attribDesc.normal && attribDesc.uvs)
    {
        return;
    }

    if (attribDesc.infinityFar)
    {
        outShader.vs = "shaders/shadowvolume/vs_infinityFar.glsl";
        outShader.fs = "shaders/shadowvolume/fs_infinityFar.glsl";
        return;
    }

    if (attribDesc.color && attribDesc.normal)
    {
        if (attribDesc.shadowVolume)
        {
            outShader.vs = 'shaders/shadowvolume/vs.glsl';
            outShader.fs = 'shaders/shadowvolume/fs.glsl';
        }
        else
        {
            outShader.vs = 'shaders/shadowmap/vs.glsl';
            outShader.fs = 'shaders/shadowmap/fs.glsl';
        }
        if (attribDesc.ambientOnly)
            outShader.fs = outShader.fs.replace(".glsl", "_ambientonly.glsl");
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

var CreateCube = function(gl, TargetObjectArray, pos, size, scale, color, shaderInfo)
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
    attribs.push(createAttribParameter('Color', 4, GenerateColor(color, elementCount), gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));

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
    
    var newStaticObject = createStaticObject(gl, shaderInfo, attribs, null, 0, elementCount, gl.TRIANGLES);
    CreateShadowVolume(newStaticObject, vertices, null, TargetObjectArray)

    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    addObject(TargetObjectArray, newStaticObject);
    return newStaticObject;
}

var CreateQuad = function(gl, TargetObjectArray, pos, size, scale, color, shaderInfo)
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
    attribs.push(createAttribParameter('Color', 4, GenerateColor(color, elementCount), gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));
    {
        var normals = [];
        for(var i=0;i<elementCount;++i)
        {
            normals.push(0.0); normals.push(1.0); normals.push(0.0);
        }
        attribs.push(createAttribParameter('Normal', 3, normals, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
    }

    var newStaticObject = createStaticObject(gl, shaderInfo, attribs, null, 0, elementCount, gl.TRIANGLES, true);
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
    addObject(TargetObjectArray, newStaticObject);
    return newStaticObject;
}

var CreateTriangle = function(gl, TargetObjectArray, pos, size, scale, color, shaderInfo)
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
    attribs.push(createAttribParameter('Color', 4, GenerateColor(color, elementCount), gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));
    {
        var normals = [];
        for(var i=0;i<elementCount;++i)
        {
            normals.push(0.0); normals.push(1.0); normals.push(0.0);
        }
        attribs.push(createAttribParameter('Normal', 3, normals, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
    }

    var newStaticObject = createStaticObject(gl, shaderInfo, attribs, null, 0, elementCount, gl.TRIANGLES, true);
    CreateShadowVolume(newStaticObject, vertices, null, TargetObjectArray);

    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    addObject(TargetObjectArray, newStaticObject);
    return newStaticObject;
}

var CreateSphere = function(gl, TargetObjectArray, pos, radius, slice, scale, color, shaderInfo, wireframe = false)
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
    attribs.push(createAttribParameter('Color', 4, GenerateColor(color, elementCount), gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));
    attribs.push(createAttribParameter('Normal', 3, GenerateNormal(vertices), gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));

    var faces = [];
    var iCount = 0;
    var toNextSlice = slice+1;
    for(var j=0;j<=halfSlice;++j)
    {
        for(var i=0;i<(slice-1);++i, iCount += 1)
        {
            faces.push(iCount); faces.push(iCount + 1); faces.push(iCount + toNextSlice);
            faces.push(iCount + toNextSlice); faces.push(iCount + 1); faces.push(iCount + toNextSlice + 1);
        }
    }

    var newStaticObject = createStaticObject(gl, shaderInfo, attribs, {faces:faces, bufferType:gl.STATIC_DRAW}, 0, elementCount, (wireframe ? gl.LINES : gl.TRIANGLES));
    CreateShadowVolume(newStaticObject, vertices, faces, TargetObjectArray);

    // 잘 그려진다면, 스텐실 버퍼에 operation 연산을 사용해서 volume을 그리고, 스텐실 버퍼 값을 이용해 물체를 그린다.

    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    addObject(TargetObjectArray, newStaticObject);
    //newStaticObject.hide = true;
    return newStaticObject;
}

var CreateTile = function(gl, TargetObjectArray, pos, numOfCol, numOfRow, size, scale, color, shaderInfo)
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
    attribs.push(createAttribParameter('Color', 4, GenerateColor(color, elementCount), gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));

    {
        var normals = [];
        for(var i=0;i<vertices.length;++i)
        {
            normals.push(0.0); normals.push(1.0); normals.push(0.0);
        }
        attribs.push(createAttribParameter('Normal', 3, normals, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
    }

    var newStaticObject = createStaticObject(gl, shaderInfo, attribs, null, 0, elementCount, gl.TRIANGLES, true);
    CreateShadowVolume(newStaticObject, vertices, null, TargetObjectArray);

    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    addObject(TargetObjectArray, newStaticObject);
    return newStaticObject;
}

var CreateSegment = function(gl, TargetObjectArray, pos, start, end, time, color, shaderInfo)
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
    attribs.push(createAttribParameter('Color', 4, GenerateColor(color, elementCount), gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));
    attribs.push(createAttribParameter('Normal', 3, GenerateNormal(vertices), gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));

    var newStaticObject = createStaticObject(gl, shaderInfo, attribs, null, 0, elementCount, gl.LINES);
    
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
    addObject(TargetObjectArray, segmentStaticObject);
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

var CreateCone = function(gl, TargetObjectArray, pos, height, radius, slice, scale, color, shaderInfo, wireframe = false)
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

    var elementCount = vertices.length / 3;

    var attribs = [];
    attribs.push(createAttribParameter('Pos', 3, vertices, gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
    attribs.push(createAttribParameter('Color', 4, GenerateColor(color, elementCount), gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));

    {
        var normals = [];

        // https://stackoverflow.com/questions/51015286/how-can-i-calculate-the-normal-of-a-cone-face-in-opengl-4-5
        // lenght of the flank of the cone
        var flank_len = Math.sqrt(radius*radius + height*height); 

        // unit vector along the flank of the cone
        var cone_x = radius / flank_len; 
        var cone_y = -height / flank_len;
        
        // Cone Top Normal
        for(var i=1;i<=slice;++i)
        {
            var rad = i * stepRadian;
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

    var newStaticObject = createStaticObject(gl, shaderInfo, attribs, null, 0, elementCount, (wireframe ? gl.LINES : gl.TRIANGLES));
    CreateShadowVolume(newStaticObject, vertices, null, TargetObjectArray);

    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    var coneStaticObject = {};
    coneStaticObject.__proto__ = newStaticObject;
    coneStaticObject.height = height;
    coneStaticObject.radius = radius;
    coneStaticObject.color = color;
    addObject(TargetObjectArray, coneStaticObject);
    return coneStaticObject;
}

var CreateCylinder = function(gl, TargetObjectArray, pos, height, radius, slice, scale, color, shaderInfo, wireframe = false)
{
    var halfHeight = height/2.0;
    var topVert = CreateVec3(0.0, halfHeight, 0.0);
    var bottomVert = CreateVec3(0.0, -halfHeight, 0.0);

    if (slice % 2)
        ++slice;

    var vertices = [];

    var stepRadian = DegreeToRadian(360.0 / slice);
    for(var i=0;i<slice;++i)
    {
        var rad = i * stepRadian;
        var prevRad = rad - stepRadian;

        // Top
        vertices.push(topVert.x);                   vertices.push(topVert.y);       vertices.push(topVert.z);
        vertices.push(Math.cos(rad)*radius);        vertices.push(topVert.y);       vertices.push(Math.sin(rad)*radius);
        vertices.push(Math.cos(prevRad)*radius);    vertices.push(topVert.y);       vertices.push(Math.sin(prevRad)*radius);

        // Mid
        vertices.push(Math.cos(prevRad)*radius);    vertices.push(topVert.y);       vertices.push(Math.sin(prevRad)*radius);
        vertices.push(Math.cos(rad)*radius);        vertices.push(topVert.y);       vertices.push(Math.sin(rad)*radius);
        vertices.push(Math.cos(prevRad)*radius);    vertices.push(bottomVert.y);    vertices.push(Math.sin(prevRad)*radius);

        vertices.push(Math.cos(prevRad)*radius);    vertices.push(bottomVert.y);    vertices.push(Math.sin(prevRad)*radius);
        vertices.push(Math.cos(rad)*radius);        vertices.push(topVert.y);       vertices.push(Math.sin(rad)*radius);
        vertices.push(Math.cos(rad)*radius);        vertices.push(bottomVert.y);    vertices.push(Math.sin(rad)*radius);

        // Bottom
        vertices.push(bottomVert.x);                vertices.push(bottomVert.y);    vertices.push(bottomVert.z);
        vertices.push(Math.cos(prevRad)*radius);    vertices.push(bottomVert.y);    vertices.push(Math.sin(prevRad)*radius);
        vertices.push(Math.cos(rad)*radius);        vertices.push(bottomVert.y);    vertices.push(Math.sin(rad)*radius);
    }

    var elementCount = vertices.length / 3;

    var attribs = [];
    attribs.push(createAttribParameter('Pos', 3, vertices, gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
    attribs.push(createAttribParameter('Color', 4, GenerateColor(color, elementCount), gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));
    {
        var normals = [];

        // https://stackoverflow.com/questions/51015286/how-can-i-calculate-the-normal-of-a-cone-face-in-opengl-4-5
        // lenght of the flank of the cone
        var flank_len = Math.sqrt(radius*radius + height*height); 

        // unit vector along the flank of the cone
        var cone_x = radius / flank_len; 
        var cone_y = -height / flank_len;
        
        // Cone Top Normal
        for(var i=0;i<slice;++i)
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

        attribs.push(createAttribParameter('Normal', 3, normals, gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
    }

    var newStaticObject = createStaticObject(gl, shaderInfo, attribs, null, 0, elementCount, (wireframe ? gl.LINES : gl.TRIANGLES));
    CreateShadowVolume(newStaticObject, vertices, null, TargetObjectArray);

    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    var cylinderStaticObject = {};
    cylinderStaticObject.__proto__ = newStaticObject;
    cylinderStaticObject.height = height;
    cylinderStaticObject.radius = radius;
    cylinderStaticObject.color = color;
    addObject(TargetObjectArray, cylinderStaticObject);
    return cylinderStaticObject;
}

var CreateArrowSegment = function(gl, TargetObjectArray, start, end, time, coneHeight, coneRadius, segmentColor, segmentShaderInfo, coneColor, coneShaderInfo)
{
    var segment = CreateSegment(gl, TargetObjectArray, ZeroVec3, start, end, time, segmentColor, segmentShaderInfo, false);
    segment.isDisablePipeLineChange = true;
    
    var cone = CreateCone(gl, TargetObjectArray, ZeroVec3, coneHeight, coneRadius, 100, OneVec3, coneColor, coneShaderInfo, false);
    cone.isDisablePipeLineChange = true;

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
    addObject(TargetObjectArray, newStaticObject);
    return newStaticObject;
}

var CreateCapsule = function(gl, TargetObjectArray, pos, height, radius, slice, scale, color, shaderInfo)
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
            if (!isUpperSphere && !isLowerSphere)
                normal = CreateVec3(x, 0.0, z).GetNormalize();
            else
                normal = CreateVec3(x, y, z).GetNormalize();
            normals.push(normal.x); normals.push(normal.y); normals.push(normal.z);
        }
    }

    var elementCount = vertices.length / 3;

    var attribs = [];
    attribs.push(createAttribParameter('Pos', 3, vertices, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));
    attribs.push(createAttribParameter('Color', 4, GenerateColor(color, elementCount), gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0));
    attribs.push(createAttribParameter('Normal', 3, normals, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));

    var faces = [];
    var iCount = 0;
    var toNextSlice = slice+1;
    for(var j=0;j<=halfSlice;++j)
    {
        for(var i=0;i<(slice-1);++i, iCount += 1)
        {
            faces.push(iCount); faces.push(iCount + 1); faces.push(iCount + toNextSlice);
            faces.push(iCount + toNextSlice); faces.push(iCount + 1); faces.push(iCount + toNextSlice + 1);
        }
    }

    var newStaticObject = createStaticObject(gl, shaderInfo, attribs, {faces:faces, bufferType:gl.STATIC_DRAW}, 0, elementCount, gl.TRIANGLES);
    CreateShadowVolume(newStaticObject, vertices, faces, TargetObjectArray);

    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale, scale, scale);
    addObject(TargetObjectArray, newStaticObject);
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
    var newStaticObject = createStaticObject(gl, CreateBaseColorOnlyShaderFile(), [attrib0, attrib1], null, 0, elementCount, gl.LINES);

    newStaticObject.pos = pos.CloneVec3();
    newStaticObject.rot = rot.CloneVec3();
    newStaticObject.scale = scale.CloneVec3();
    addObject(TargetObjectArray, newStaticObject);
    newStaticObject.isDisablePipeLineChange = true;
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

            vertices.push(x + 0.0);         vertices.push(0.0);         vertices.push(z + interval);    colors.push(0.0); colors.push(0.0); colors.push(1.0); colors.push(0.3);
            vertices.push(x + 0.0);         vertices.push(0.0);         vertices.push(z + -interval);   colors.push(0.0); colors.push(0.0); colors.push(1.0); colors.push(0.3);

            vertices.push(x + interval);    vertices.push(0.0);         vertices.push(z + 0.0);         colors.push(1.0); colors.push(0.0); colors.push(0.0); colors.push(0.3);
            vertices.push(x + -interval);   vertices.push(0.0);         vertices.push(z + 0.0);         colors.push(1.0); colors.push(0.0); colors.push(0.0); colors.push(0.3);
        }
    }

    var elementCount = vertices.length / 3;

    var attrib0 = createAttribParameter('Pos', 3, vertices, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var attrib1 = createAttribParameter('Color', 4, colors, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0);
    var newStaticObject = createStaticObject(gl, CreateBaseColorOnlyShaderFile(), [attrib0, attrib1], null, 0, elementCount, gl.LINES, false, true);
    newStaticObject.updateFunc = function()
    {
        this.pos.x = Math.floor(camera.pos.x / 10) * 10;
        this.pos.z = Math.floor(camera.pos.z / 10) * 10;
    };

    newStaticObject.pos = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(1.0, 1.0, 1.0);
    addObject(TargetObjectArray, newStaticObject);
    newStaticObject.isDisablePipeLineChange = true;
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
    var newStaticObject = createStaticObject(gl, CreateBaseColorOnlyShaderFile(), [attrib0, attrib1], null, 0, elementCount, gl.LINES, false, true);

    newStaticObject.pos = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(1.0, 1.0, 1.0);
    addObject(TargetObjectArray, newStaticObject);
    newStaticObject.isDisablePipeLineChange = true;
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

    var elementCount = vertices.length / 2;
    var attrib0 = createAttribParameter('VertPos', 2, vertices, gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 2, 0);
    var newStaticObject = createStaticObject(gl, CreateBaseUIShaderFile(), [attrib0], null, 0, elementCount, gl.TRIANGLE_STRIP);

    var uiStaticObject = { UIInfo:CreateVec4(x, y, width, height) };
    uiStaticObject.__proto__ = newStaticObject;
    uiStaticObject.isDisablePipeLineChange = true;
    uiStaticObject.setRenderProperty = function()
    {
        if (this.__proto__.setRenderProperty)
            this.__proto__.setRenderProperty();

        var program = this.pipeLineInfo.pipeLine;

        var pixelSizeLoc = gl.getUniformLocation(program, 'PixelSize');
        if (pixelSizeLoc)
        {
            var pixelSize = [1.0 / gl.canvas.width, 1.0 / gl.canvas.height];
            gl.uniform2fv(pixelSizeLoc, pixelSize);
        }
    
        var posLoc = gl.getUniformLocation(program, 'Pos');
        if (posLoc)
        {
            var pos = [this.UIInfo.x, this.UIInfo.y];
            gl.uniform2fv(posLoc, pos);
        }
    
        var sizeLoc = gl.getUniformLocation(program, 'Size');
        if (sizeLoc)
        {
            var size = [this.UIInfo.z, this.UIInfo.w];
            gl.uniform2fv(sizeLoc, size);
        }
    };

    newStaticObject.texture = texture;
    newStaticObject.pos = CreateVec3(0, 0, 0.0);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(1.0, 1.0, 1.0);
    addObject(TargetObjectArray, uiStaticObject);
    return uiStaticObject;
}

var CreateBillboardQuad = function(gl, TargetObjectArray, pos, size, scale, color, shaderInfo, camera = null)
{
    var quad = CreateQuad(gl, TargetObjectArray, pos, size, scale, color, shaderInfo);
    quad.camera = camera;
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

    var attrib0 = createAttribParameter('Pos', 3, vertices, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var attrib1 = createAttribParameter('TexCoord', 2, uvs, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 2, 0);
    var newStaticObject = createStaticObject(gl, CreateBaseTextureShaderFile(), [attrib0, attrib1], null, 0, elementCount, gl.TRIANGLE_STRIP);
    newStaticObject.isDisablePipeLineChange = true;
    
    CreateShadowVolume(newStaticObject, vertices, null, TargetObjectArray);

    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    newStaticObject.texture = texture;
    addObject(TargetObjectArray, newStaticObject);
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

