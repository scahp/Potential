var createAttribParameter = function(name, count, datas, bufferType, type, normalized, stride, offset)
{
    return { name:name, datas:datas, bufferType:bufferType, count:count, type:type, normalized:normalized, stride:stride, offset:offset };
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

var CreateCube = function(gl, TargetObjectArray, pos, size, scale, color)
{
    var halfSize = size.CloneVec3().Div(2.0);
    var offset = ZeroVec3.CloneVec3();

    var vertices = [
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z  + (halfSize.z),  
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (-halfSize.z), 
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z  + (-halfSize.z), 
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (-halfSize.z), 
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z  + (halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z  + (-halfSize.z), 
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (-halfSize.z),  
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (halfSize.z),   
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (halfSize.z),  
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z  + (halfSize.z),  
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (-halfSize.z), 
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z  + (-halfSize.z), 
    ];

    var elementCount = vertices.length / 3;

    var colors = GenerateColor(color, elementCount);
    var normals = GenerateNormal(vertices);

    var attrib0 = createAttribParameter('Pos', 3, vertices, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var attrib1 = createAttribParameter('Color', 4, colors, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0);
    var attrib2 = createAttribParameter('Normal', 3, normals, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var newStaticObject = createStaticObject(gl, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1, attrib2], null, 0, elementCount, gl.TRIANGLE_STRIP);
    
    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateQuad = function(gl, TargetObjectArray, pos, size, scale, color)
{
    var halfSize = size.CloneVec3().Div(2.0);
    var offset = ZeroVec3.CloneVec3();

    var vertices = [
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),  0.0,
        offset.x + (halfSize.x),   offset.y + (halfSize.y),  0.0,
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y), 0.0,
        offset.x + (halfSize.x),   offset.y + (-halfSize.y), 0.0,
    ];

    var elementCount = vertices.length / 3;

    var colors = GenerateColor(color, elementCount);

    var normals = [];
    for(var i=0;i<elementCount;++i)
    {
        normals.push(0.0); normals.push(0.0); normals.push(1.0);
    }

    var attrib0 = createAttribParameter('Pos', 3, vertices, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var attrib1 = createAttribParameter('Color', 4, colors, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0);
    var attrib2 = createAttribParameter('Normal', 3, normals, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var newStaticObject = createStaticObject(gl, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1, attrib2], null, 0, elementCount, gl.TRIANGLE_STRIP);
    
    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateTriangle = function(gl, TargetObjectArray, pos, size, scale, color)
{
    var halfSize = size.CloneVec3().Div(2.0);
    var offset = ZeroVec3.CloneVec3();

    var vertices = [
        offset.x + (-halfSize.x),   offset.y + (halfSize.y),  0.0,
        offset.x + (halfSize.x),    offset.y + (halfSize.y),  0.0,
        offset.x + (-halfSize.x),   offset.y + (-halfSize.y), 0.0,
    ];

    var elementCount = vertices.length / 3;

    var colors = GenerateColor(color, elementCount);
    
    var normals = [];
    for(var i=0;i<elementCount;++i)
    {
        normals.push(0.0); normals.push(0.0); normals.push(1.0);
    }

    var attrib0 = createAttribParameter('Pos', 3, vertices, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var attrib1 = createAttribParameter('Color', 4, colors, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0);
    var attrib2 = createAttribParameter('Normal', 3, normals, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var newStaticObject = createStaticObject(gl, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1, attrib2], null, 0, elementCount, gl.TRIANGLE_STRIP);
    
    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateSphere = function(gl, TargetObjectArray, pos, radius, scale, color)
{
    var vertices = [];
    var offset = ZeroVec3;

    vertices.push(offset.x); vertices.push(offset.y); vertices.push(offset.z);

    for(var j=-9;j<=9;++j)
    {
        for(var i=0;i<=36;++i)
        {
            var x = offset.x + Math.cos(DegreeToRadian(i * 10)) * radius * Math.cos(DegreeToRadian(j * 10));
            var y = offset.y + Math.sin(DegreeToRadian(i * 10)) * radius * Math.cos(DegreeToRadian(j * 10));
            var z = offset.z + Math.sin(DegreeToRadian(j * 10)) * radius;
            vertices.push(x); vertices.push(y); vertices.push(z);
        }
    }

    var elementCount = vertices.length / 3;
    var colors = GenerateColor(color, elementCount);
    var normals = GenerateNormal(vertices);

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

    var attrib0 = createAttribParameter('Pos', 3, vertices, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var attrib1 = createAttribParameter('Color', 4, colors, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0);
    var attrib2 = createAttribParameter('Normal', 3, normals, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var newStaticObject = createStaticObject(gl, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1, attrib2], {faces:faces, bufferType:gl.STATIC_DRAW}, 0, elementCount, gl.TRIANGLES);
    
    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateTile = function(gl, TargetObjectArray, pos, numOfCol, numOfRow, size, scale, color)
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

    var colors = GenerateColor(color, elementCount);
    var normals = GenerateNormal(vertices);

    var attrib0 = createAttribParameter('Pos', 3, vertices, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var attrib1 = createAttribParameter('Color', 4, colors, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0);
    var attrib2 = createAttribParameter('Normal', 3, normals, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var newStaticObject = createStaticObject(gl, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1, attrib2], null, 0, elementCount, gl.TRIANGLES);
    
    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateSegment = function(gl, TargetObjectArray, pos, start, end, time, color)
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
    var colors = GenerateColor(color, elementCount);

    var attrib0 = createAttribParameter('Pos', 3, vertices, gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var attrib1 = createAttribParameter('Color', 4, colors, gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0);
    var newStaticObject = createStaticObject(gl, 'shaders/color_only_vs.glsl', 'shaders/color_only_fs.glsl', [attrib0, attrib1], null, 0, elementCount, gl.LINES);
    
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

var CreateCone = function(gl, TargetObjectArray, pos, height, radius, scale, color)
{
    var halfHeight = height/2.0;
    var topVert = CreateVec3(0.0, height, 0.0);

    var vertices = [
        topVert.x,    topVert.y,    topVert.z,
    ];

    for(var i=0;i<360;++i)
    {
        var rad = RadianToDegree(i);
        vertices.push(Math.cos(rad)*radius);    vertices.push(0.0);    vertices.push(Math.sin(rad)*radius);
    }

    var currentVertexCnt = vertices.length/3;
    var drawArray = [ {startVert:0, count:currentVertexCnt} ];

    var secondStartVert = currentVertexCnt;

    vertices.push(0.0); vertices.push(0.0); vertices.push(0.0);     // bottomVert
    for(var i=0;i<360;++i)
    {
        var rad = RadianToDegree(i);
        vertices.push(Math.cos(rad)*radius);    vertices.push(0.0);    vertices.push(Math.sin(rad)*radius);
    }

    var elementCount = vertices.length / 3;
    drawArray.push({startVert:secondStartVert, count:(elementCount-secondStartVert)});

    var colors = GenerateColor(color, elementCount);
    //var normals = GenerateNormal(vertices);

    var normals = [];
    var firstDrawArray = drawArray[0];
    var fisrtVec3 = CreateVec3(vertices[firstDrawArray.startVert], height, vertices[firstDrawArray.startVert+2]);
    normals.push(0.0); normals.push(1.0); normals.push(0.0);
    for(var i=firstDrawArray.startVert+1;i<firstDrawArray.count;++i)
    {
        var curIndex = i * 3;
        var normal = CreateVec3(vertices[curIndex], vertices[curIndex+1], vertices[curIndex+2]).Add(fisrtVec3).GetNormalize();
        normals.push(normal.x); normals.push(normal.y); normals.push(normal.z);
    }

    var secondDrawArray = drawArray[1];
    for(var i=0;i<secondDrawArray.count;++i)
    {
        normals.push(0.0); normals.push(-1.0); normals.push(0.0);
    }

    var attrib0 = createAttribParameter('Pos', 3, vertices, gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var attrib1 = createAttribParameter('Color', 4, colors, gl.DYNAMIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0);
    var attrib2 = createAttribParameter('Normal', 3, normals, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var newStaticObject = createStaticObject(gl, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1, attrib2], null, 0, elementCount, gl.TRIANGLE_FAN);
    
    newStaticObject.drawArray = drawArray;
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

var CreateArrowSegment = function(gl, TargetObjectArray, start, end, time, coneHeight, coneRadius, segmentColor, coneColor)
{
    var segment = CreateSegment(gl, TargetObjectArray, ZeroVec3, start, end, time, segmentColor);
    var cone = CreateCone(gl, TargetObjectArray, ZeroVec3, coneHeight, coneRadius, OneVec3, coneColor);

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

var CreateCapsule = function(gl, TargetObjectArray, pos, height, radius, scale, color)
{
    if (height < 0)
    {
        height = 0.0;
        console.log("capsule height must be more than or equal zero.");
    }

    var halfHeight = height / 2;
    var vertices = [];

    vertices.push(0.0); vertices.push(0.0); vertices.push(0.0);

    var slice = 9;
    for(var j=-slice;j<=slice;++j)
    {
        var isUpperSphere = (j >= 0);

        for(var i=0;i<=36;++i)
        {
            var x = Math.cos(DegreeToRadian(i * 10)) * radius * Math.cos(DegreeToRadian(j * 10));
            var y = Math.sin(DegreeToRadian(j * 10)) * radius;
            var z = Math.sin(DegreeToRadian(i * 10)) * radius * Math.cos(DegreeToRadian(j * 10));
            if (isUpperSphere)
                y += halfHeight;
            else
                y -= halfHeight;
            vertices.push(x); vertices.push(y); vertices.push(z);
        }
    }

    var elementCount = vertices.length / 3;
    var colors = GenerateColor(color, elementCount);
    var normals = GenerateNormal(vertices);

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

    var attrib0 = createAttribParameter('Pos', 3, vertices, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var attrib1 = createAttribParameter('Color', 4, colors, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0);
    var attrib2 = createAttribParameter('Normal', 3, normals, gl.STATIC_DRAW, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var newStaticObject = createStaticObject(gl, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1, attrib2], {faces:faces, bufferType:gl.STATIC_DRAW}, 0, elementCount, gl.TRIANGLES);
    
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
    var newStaticObject = createStaticObject(gl, 'shaders/color_only_vs.glsl', 'shaders/color_only_fs.glsl', [attrib0, attrib1], null, 0, elementCount, gl.LINES);

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
    var newStaticObject = createStaticObject(gl, 'shaders/color_only_vs.glsl', 'shaders/color_only_fs.glsl', [attrib0, attrib1], null, 0, elementCount, gl.LINES);
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
    var newStaticObject = createStaticObject(gl, 'shaders/color_only_vs.glsl', 'shaders/color_only_fs.glsl', [attrib0, attrib1], null, 0, elementCount, gl.LINES);

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
    var newStaticObject = createStaticObject(gl, null, 'shaders/tex_ui_vs.glsl', 'shaders/tex_ui_fs.glsl', [attrib0], 0, elementCount, gl.TRIANGLE_STRIP);

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

var CreateBillboardQuad = function(gl, TargetObjectArray, pos, size, scale, color)
{
    var quad = CreateQuad(gl, TargetObjectArray, pos, size, scale, color);
    quad.camera = null;
    quad.updateFunc = function()
    {
        if (this.camera)
        {
            var normalizedCameraDir = this.camera.pos.CloneVec3().Sub(this.pos).GetNormalize();
            var eularAngleOfCameraDir = GetEulerAngleFromVec3(normalizedCameraDir);

            var degreeOf90 = DegreeToRadian(90);        // Offset rotation for this billboard to face the camera.

            this.rot.y = eularAngleOfCameraDir.y + degreeOf90;
            this.rot.x = -(eularAngleOfCameraDir.z + degreeOf90);       // Because Quad is directing to Z+ Axis. X axis rotation is needed to lie this billboard on xz plane.
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
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),  0.0,
        offset.x + (halfSize.x),   offset.y + (halfSize.y),  0.0,
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y), 0.0,
        offset.x + (halfSize.x),   offset.y + (-halfSize.y), 0.0,
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
    var newStaticObject = createStaticObject(gl, 'shaders/tex_vs.glsl', 'shaders/tex_fs.glsl', [attrib0, attrib1], null, 0, elementCount, gl.TRIANGLE_STRIP);
    
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

            var degreeOf90 = DegreeToRadian(90);        // Offset rotation for this billboard to face the camera.

            this.rot.y = eularAngleOfCameraDir.y + degreeOf90;
            this.rot.x = -(eularAngleOfCameraDir.z + degreeOf90);       // Because Quad is directing to Z+ Axis. X axis rotation is needed to lie this billboard on xz plane.
        }
        else
        {
            console.log('BillboardQuad is updated without camera');
        }
    }
    return quad;
}