var CreateRectangle = function(gl, pos, offset, size, scale, color)
{
    var halfSize = size.Div(2.0);

    var vertices = [
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (halfSize.z),     color.x, color.y, color.z, color.w,
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (halfSize.z),     color.x, color.y, color.z, color.w,
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (halfSize.z),    color.x, color.y, color.z, color.w,
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z  + (halfSize.z),    color.x, color.y, color.z, color.w,

        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (-halfSize.z),    color.x, color.y, color.z, color.w,
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (-halfSize.z),    color.x, color.y, color.z, color.w,
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (-halfSize.z),   color.x, color.y, color.z, color.w,
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z  + (-halfSize.z),   color.x, color.y, color.z, color.w,

        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (-halfSize.z),    color.x, color.y, color.z, color.w,
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (halfSize.z),     color.x, color.y, color.z, color.w,
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (-halfSize.z),   color.x, color.y, color.z, color.w,
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (halfSize.z),    color.x, color.y, color.z, color.w,

        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (halfSize.z),     color.x, color.y, color.z, color.w,
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (-halfSize.z),    color.x, color.y, color.z, color.w,
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z  + (halfSize.z),    color.x, color.y, color.z, color.w,
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z  + (-halfSize.z),   color.x, color.y, color.z, color.w,

        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (-halfSize.z),    color.x, color.y, color.z, color.w,
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (-halfSize.z),    color.x, color.y, color.z, color.w,
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),     offset.z + (halfSize.z),     color.x, color.y, color.z, color.w,
        offset.x + (halfSize.x),   offset.y + (halfSize.y),     offset.z + (halfSize.z),     color.x, color.y, color.z, color.w,

        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (halfSize.z),    color.x, color.y, color.z, color.w,
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z  + (halfSize.z),    color.x, color.y, color.z, color.w,
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),    offset.z  + (-halfSize.z),   color.x, color.y, color.z, color.w,
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),    offset.z  + (-halfSize.z),   color.x, color.y, color.z, color.w,
    ];

    var elementCount = 7;

    var attrib0 = createAttribParameter('Pos', 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, 0);
    var attrib1 = createAttribParameter('Color', 4, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, Float32Array.BYTES_PER_ELEMENT * 3);
    var newStaticObject = createStaticObject(gl, vertices, null, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1], 0, gl.STATIC_DRAW, vertices.length / elementCount, gl.TRIANGLE_STRIP);
    
    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    StaticObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateQuad = function(gl, pos, offset, size, scale, color)
{
    var halfSize = size.Div(2.0);

    var vertices = [
        offset.x + (-halfSize.x),  offset.y + (halfSize.y),    offset.z,   color.x, color.y, color.z, color.w,
        offset.x + (halfSize.x),   offset.y + (halfSize.y),    offset.z,   color.x, color.y, color.z, color.w,
        offset.x + (-halfSize.x),  offset.y + (-halfSize.y),   offset.z,   color.x, color.y, color.z, color.w,
        offset.x + (halfSize.x),   offset.y + (-halfSize.y),   offset.z,   color.x, color.y, color.z, color.w,
    ];

    var elementCount = 7;

    var attrib0 = createAttribParameter('Pos', 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, 0);
    var attrib1 = createAttribParameter('Color', 4, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, Float32Array.BYTES_PER_ELEMENT * 3);
    var newStaticObject = createStaticObject(gl, vertices, null, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1], 0, gl.STATIC_DRAW, vertices.length / elementCount, gl.TRIANGLE_STRIP);
    
    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    StaticObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateTriangle = function(gl, pos, offset, size, scale, color)
{
    var halfSize = size.Div(2.0);

    var vertices = [
        offset.x + (-halfSize.x),   offset.y + (halfSize.y),    offset.z,   color.x, color.y, color.z, color.w,
        offset.x + (halfSize.x),    offset.y + (halfSize.y),    offset.z,   color.x, color.y, color.z, color.w,
        offset.x + (-halfSize.x),   offset.y + (-halfSize.y),   offset.z,   color.x, color.y, color.z, color.w,
    ];

    var elementCount = 7;

    var attrib0 = createAttribParameter('Pos', 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, 0);
    var attrib1 = createAttribParameter('Color', 4, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, Float32Array.BYTES_PER_ELEMENT * 3);
    var newStaticObject = createStaticObject(gl, vertices, null, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1], 0, gl.STATIC_DRAW, vertices.length / elementCount, gl.TRIANGLE_STRIP);
    
    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    StaticObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateSphere = function(gl, pos, offset, radius, scale, color)
{
    var vertices = [];

    vertices.push(offset.x); vertices.push(offset.y); vertices.push(offset.z); vertices.push(color.x); vertices.push(color.y); vertices.push(color.z); vertices.push(color.w);

    for(var j=-9;j<=9;++j)
    {
        for(var i=0;i<=36;++i)
        {
            var x = offset.x + Math.cos(DegreeToRadian(i * 10)) * radius * Math.cos(DegreeToRadian(j * 10));
            var y = offset.y + Math.sin(DegreeToRadian(i * 10)) * radius * Math.cos(DegreeToRadian(j * 10));
            var z = offset.z + Math.sin(DegreeToRadian(j * 10)) * radius;
            vertices.push(x); vertices.push(y); vertices.push(z); vertices.push(color.x); vertices.push(color.y); vertices.push(color.z); vertices.push(color.w);
        }
    }

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

    var elementCount = 7;

    var attrib0 = createAttribParameter('Pos', 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, 0);
    var attrib1 = createAttribParameter('Color', 4, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, Float32Array.BYTES_PER_ELEMENT * 3);
    var newStaticObject = createStaticObject(gl, vertices, faces, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1], 0, gl.STATIC_DRAW, vertices.length / elementCount, gl.TRIANGLES);
    
    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    StaticObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateTile = function(gl, pos, offset, numOfCol, numOfRow, size, scale, color)
{
    var vertices = [];

    var halfSize = size / 2.0;

    var startPos = CreateVec3(offset.x, offset.y, offset.z);

    for(var i=0;i<numOfRow;++i)
    {
        for(var j=0;j<numOfCol;++j)
        {
            var curOffset = startPos.CloneVec3()
            curOffset.x += j * size;
            curOffset.z += i * size;

            var x = curOffset.x;
            var y = curOffset.y;
            var z = curOffset.z;
            vertices.push(x); vertices.push(y); vertices.push(z); vertices.push(color.x); vertices.push(color.y); vertices.push(color.z); vertices.push(color.w);

            x = curOffset.x;
            y = curOffset.y;
            z = curOffset.z + size;
            vertices.push(x); vertices.push(y); vertices.push(z); vertices.push(color.x); vertices.push(color.y); vertices.push(color.z); vertices.push(color.w);

            x = curOffset.x + size;
            y = curOffset.y;
            z = curOffset.z + size;
            vertices.push(x); vertices.push(y); vertices.push(z); vertices.push(color.x); vertices.push(color.y); vertices.push(color.z); vertices.push(color.w);

            x = curOffset.x;
            y = curOffset.y;
            z = curOffset.z;
            vertices.push(x); vertices.push(y); vertices.push(z); vertices.push(color.x); vertices.push(color.y); vertices.push(color.z); vertices.push(color.w);

            x = curOffset.x + size;
            y = curOffset.y
            z = curOffset.z + size;
            vertices.push(x); vertices.push(y); vertices.push(z); vertices.push(color.x); vertices.push(color.y); vertices.push(color.z); vertices.push(color.w);

            x = curOffset.x + size;
            y = curOffset.y;
            z = curOffset.z;
            vertices.push(x); vertices.push(y); vertices.push(z); vertices.push(color.x); vertices.push(color.y); vertices.push(color.z); vertices.push(color.w);

         }
    }

    var elementCount = 7;

    var attrib0 = createAttribParameter('Pos', 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, 0);
    var attrib1 = createAttribParameter('Color', 4, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, Float32Array.BYTES_PER_ELEMENT * 3);
    var newStaticObject = createStaticObject(gl, vertices, null, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1], 0, gl.STATIC_DRAW, vertices.length / elementCount, gl.TRIANGLES);
    
    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
    StaticObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateLine = function(gl, pos, offset, length, scale, color)
{
    var vertices = [
        offset.x,   offset.y,    offset.z,              color.x, color.y, color.z, color.w,
        offset.x,   offset.y,    offset.z + length,     color.x, color.y, color.z, color.w,
    ];

    var elementCount = 7;

    var attrib0 = createAttribParameter('Pos', 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, 0);
    var attrib1 = createAttribParameter('Color', 4, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, Float32Array.BYTES_PER_ELEMENT * 3);
    var newStaticObject = createStaticObject(gl, vertices, null, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1], 0, gl.DYNAMIC_DRAW, vertices.length / elementCount, gl.LINES);
    
    newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(scale, scale, scale);
    StaticObjectArray.push(newStaticObject); 
    return newStaticObject;
}
