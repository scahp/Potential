var createAttribParameter = function(name, count, datas, bufferType, type, normalized, stride, offset)
{
    return { name:name, datas:datas, bufferType:bufferType, count:count, type:type, normalized:normalized, stride:stride, offset:offset };
}

var GetAttribDesc = function(color, normal, uvs, ui)
{
    return {color:color, normal:normal, uvs:uvs, ui:ui};
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

var CreateCube = function(gl, TargetObjectArray, pos, size, scale, attribDesc)
{
    var halfSize = size.Clone().Div(2.0);
    var offset = ZeroVec3.Clone();

    var vertices = [
        // z +
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z  + (halfSize.z),  

        // z -
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (-halfSize.z), 
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (-halfSize.z), 
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z  + (-halfSize.z), 

        // x +
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z  + (halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z  + (halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z  + (-halfSize.z), 
        
        // x -
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (-halfSize.z), 
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (-halfSize.z), 
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (halfSize.z),  

        // y +
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (halfSize.z),   

        // y -
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z  + (halfSize.z),  
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (-halfSize.z), 
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z  + (halfSize.z),  
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (-halfSize.z), 
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z  + (-halfSize.z), 
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
    
    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateQuad = function(gl, TargetObjectArray, pos, size, scale, attribDesc)
{
    var halfSize = size.Clone().Div(2.0);
    var offset = ZeroVec3.Clone();

    var vertices = [
        offset.x + (-halfSize.x),   0.0,   offset.y + (halfSize.y), 
        offset.x + (halfSize.x),    0.0,   offset.y + (halfSize.y), 
        offset.x + (-halfSize.x),   0.0,   offset.y + (-halfSize.y),
        offset.x + (halfSize.x),    0.0,   offset.y + (-halfSize.y),
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
    
    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    newStaticObject.plane = null;
    newStaticObject.setPlane = function(plane)
    {
        if (!plane)
            return;
        
        this.plane = plane.Clone();
        this.rot = GetEulerAngleFromVec3(plane.n);
        this.pos = plane.n.Clone().Mul(plane.d);
    };
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateTriangle = function(gl, TargetObjectArray, pos, size, scale, attribDesc)
{
    var halfSize = size.Clone().Div(2.0);
    var offset = ZeroVec3.Clone();

    var vertices = [
        offset.x + (-halfSize.x),   0.0,   offset.y + (halfSize.y), 
        offset.x + (halfSize.x),    0.0,   offset.y + (halfSize.y), 
        offset.x + (-halfSize.x),   0.0,   offset.y + (-halfSize.y),
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
    
    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateSphere = function(gl, TargetObjectArray, pos, radius, attribDesc)
{
    var vertices = [];
    var offset = ZeroVec3;

    vertices.push(offset.x); vertices.push(offset.y); vertices.push(offset.z);

    for(var j=-9;j<=9;++j)
    {
        for(var i=0;i<=36;++i)
        {
            var x = offset.x + Math.cos(DegreeToRadian(i * 10)) * Math.cos(DegreeToRadian(j * 10));
            var y = offset.y + Math.sin(DegreeToRadian(i * 10)) * Math.cos(DegreeToRadian(j * 10));
            var z = offset.z + Math.sin(DegreeToRadian(j * 10));
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
    for(var j=0;j<9*2;++j)
    {
        for(var i=0;i<=36;++i, iCount += 1)
        {
            faces.push(iCount); faces.push(iCount + 37); faces.push(iCount + 1);
            faces.push(iCount + 1); faces.push(iCount + 37); faces.push(iCount + 37 + 1);
        }
    }

    var newStaticObject = createStaticObject(gl, attribDesc, attribs, {faces:faces, bufferType:gl.STATIC_DRAW}, 0, elementCount, gl.TRIANGLES);
    
    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(radius, radius, radius);
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
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
            var curOffset = startPos.Clone()
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
        currentEnd = end.Clone().Sub(start);
        var length = currentEnd.GetLength();
        currentEnd = currentEnd.GetNormalize().Mul(t * length).Add(start);
    }
    else
    {
        currentEnd = end.Clone();
    }

    var vertices = [
        start.x,            start.y,            start.z,
        currentEnd.x,       currentEnd.y,       currentEnd.z,
    ];

    var elementCount = vertices.length / 3;

    var attribs = [];
    attribs.push(createAttribParameter('Pos', 3, vertices, gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0));

    var color = OneVec4.Clone();
    if (attribDesc.color)
    {
        color = attribDesc.color.Clone();
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
    segmentStaticObject.start = start.Clone();
    segmentStaticObject.end = end.Clone();
    segmentStaticObject.color = color;
    segmentStaticObject.time = time;
    segmentStaticObject.getCurrentEnd = function()
    {
        var t = Clamp(this.time, 0.0, 1.0);
        var end = this.end.Clone().Sub(this.start);
        return end.GetNormalize().Mul(t * end.GetLength()).Add(this.start);
    };
    segmentStaticObject.getDirectionNormalized = function()
    {
        return this.end.Clone().Sub(this.start).GetNormalize();
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

var CreateCone = function(gl, TargetObjectArray, pos, height, radius, scale, attribDesc)
{
    var halfHeight = height/2.0;
    var topVert = CreateVec3(0.0, halfHeight, 0.0);
    var bottomVert = CreateVec3(0.0, -halfHeight, 0.0);

    var vertices = [];

    for(var i=1;i<=360;++i)
    {
        var rad = DegreeToRadian(i);
        var prevRad = DegreeToRadian(i-1);

        // Top
        vertices.push(topVert.x);                   vertices.push(topVert.y);       vertices.push(topVert.z);
        vertices.push(Math.cos(rad)*radius);        vertices.push(bottomVert.y);    vertices.push(Math.sin(rad)*radius);
        vertices.push(Math.cos(prevRad)*radius);    vertices.push(bottomVert.y);    vertices.push(Math.sin(prevRad)*radius);

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
    
    var color = OneVec4.Clone();
    if (attribDesc.color)
    {
        color = attribDesc.color.Clone();
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

    var newStaticObject = createStaticObject(gl, attribDesc, attribs, null, 0, elementCount, gl.TRIANGLES);
    
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

var CreateCylinder = function(gl, TargetObjectArray, pos, height, radius, scale, attribDesc)
{
    var halfHeight = height/2.0;
    var topVert = CreateVec3(0.0, halfHeight, 0.0);
    var bottomVert = CreateVec3(0.0, -halfHeight, 0.0);

    var vertices = [];

    for(var i=1;i<=360;++i)
    {
        var rad = DegreeToRadian(i);
        var prevRad = DegreeToRadian(i-1);

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
    
    var color = OneVec4.Clone();
    if (attribDesc.color)
    {
        color = attribDesc.color.Clone();
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
            var prevRad = DegreeToRadian(i-1);

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
    var cone = CreateCone(gl, TargetObjectArray, ZeroVec3, coneHeight, coneRadius, OneVec3, coneAttribDesc);

    var newStaticObject = {updateFunc:null, drawFunc:null, segment:segment, cone:cone};
    newStaticObject.updateFunc = function()
    {
        var pos = null;
        if (this.pos)
            pos = this.pos.Clone();
        else
            pos = OneVec3.Clone();
            
        this.segment.pos = this.pos;
        this.cone.pos = this.pos.Clone().Add(this.segment.getCurrentEnd());
        this.cone.rot = GetEulerAngleFromVec3(this.segment.getDirectionNormalized());
    };
    newStaticObject.pos = ZeroVec3.Clone();
    TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateCapsule = function(gl, TargetObjectArray, pos, height, radius, scale, attribDesc)
{
    if (height < 0)
    {
        height = 0.0;
        console.log("capsule height must be more than or equal zero.");
    }

    var halfHeight = height / 2;
    var vertices = [];
    var normals = [];

    vertices.push(0.0); vertices.push(0.0); vertices.push(0.0);
    normals.push(0.0); normals.push(1.0); normals.push(0.0);

    var slice = 9;
    for(var j=-slice;j<=slice;++j)
    {
        var isUpperSphere = (j > 0);
        var isLowerSphere = (j < 0);

        for(var i=0;i<=36;++i)
        {
            var x = Math.cos(DegreeToRadian(i * 10)) * radius * Math.cos(DegreeToRadian(j * 10));
            var y = Math.sin(DegreeToRadian(j * 10)) * radius;
            var z = Math.sin(DegreeToRadian(i * 10)) * radius * Math.cos(DegreeToRadian(j * 10));
            var yExt = 0.0;
            if (isUpperSphere)
                yExt = halfHeight;
            if (isLowerSphere)
                yExt = -halfHeight;
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
    for(var j=0;j<slice*2;++j)
    {
        for(var i=0;i<=36;++i, iCount += 1)
        {
            faces.push(iCount); faces.push(iCount + 37); faces.push(iCount + 1);
            faces.push(iCount + 1); faces.push(iCount + 37); faces.push(iCount + 37 + 1);
        }
    }

    var newStaticObject = createStaticObject(gl, attribDesc, attribs, {faces:faces, bufferType:gl.STATIC_DRAW}, 0, elementCount, gl.TRIANGLES);
    
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

    newStaticObject.pos = pos.Clone();
    newStaticObject.rot = rot.Clone();
    newStaticObject.scale = scale.Clone();
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
            var normalizedCameraDir = this.camera.pos.Clone().Sub(this.pos).GetNormalize();
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
    var halfSize = size.Clone().Div(2.0);
    var offset = ZeroVec3.Clone();

    var vertices = [
        offset.x + (-halfSize.x),  0.0,  offset.y + (halfSize.y),  
        offset.x + (halfSize.x),   0.0,  offset.y + (halfSize.y),  
        offset.x + (-halfSize.x),  0.0,  offset.y + (-halfSize.y), 
        offset.x + (halfSize.x),   0.0,  offset.y + (-halfSize.y), 
    ];

    var elementCount = vertices.length / 3;

    var uvs = [
        0.0, 1.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
    ];

    var attrib0 = createAttribParameter('Pos', 3, vertices, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var attrib1 = createAttribParameter('TexCoord', 2, uvs, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 2, 0);
    var newStaticObject = createStaticObject(gl, GetAttribDesc(false, false, true), [attrib0, attrib1], null, 0, elementCount, gl.TRIANGLE_STRIP);
    
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
            var normalizedCameraDir = this.camera.pos.Clone().Sub(this.pos).GetNormalize();
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

var CreateDirectionalLight = function(gl, direction, lightColor, diffuseLightIntensity, specularLightIntensity, specularPow, debugObjectDesc)
{
    direction = direction.GetNormalize();

    var DirectionalLight = {};
    if (debugObjectDesc.debugObject)
    {
        var billboardObject = CreateBillboardQuadTexture(gl, StaticObjectArray, debugObjectDesc.pos.Clone(), OneVec3.Clone(), debugObjectDesc.size, debugObjectDesc.texture);
        billboardObject.camera = debugObjectDesc.targetCamera;

        var segment = CreateArrowSegment(gl, StaticObjectArray, ZeroVec3, ZeroVec3.Clone().Add(direction.Clone().Mul(debugObjectDesc.length)), 1.0
            , 3.0, 1.5, GetAttribDesc(CreateVec4(1.0, 1.0, 1.0, 1.0), false, false, false), GetAttribDesc(CreateVec4(1.0, 1.0, 0.1, 1.0), false, false, false));       
        segment.pos = debugObjectDesc.pos.Clone();

        var newStaticObject = {updateFunc:null, drawFunc:null, segment:segment, billboardObject:billboardObject};
        DirectionalLight.__proto__ = newStaticObject;
    }

    DirectionalLight.direction = direction.Clone().GetNormalize();
    DirectionalLight.lightColor = lightColor;
    DirectionalLight.diffuseLightIntensity = diffuseLightIntensity;
    DirectionalLight.specularLightIntensity = specularLightIntensity;
    DirectionalLight.specularPow = specularPow;
    return DirectionalLight;
}