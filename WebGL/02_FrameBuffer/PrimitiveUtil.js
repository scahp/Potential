var CreateRectangle = function(gl, TargetObjectArray, pos, offset, size, scale, color)
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
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateQuad = function(gl, TargetObjectArray, pos, offset, size, scale, color)
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
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateTriangle = function(gl, TargetObjectArray, pos, offset, size, scale, color)
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
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateSphere = function(gl, TargetObjectArray, pos, offset, radius, scale, color)
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
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateTile = function(gl, TargetObjectArray, pos, offset, numOfCol, numOfRow, size, scale, color)
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
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject);
    return newStaticObject;
}

var CreateLine = function(gl, TargetObjectArray, pos, offset, length, scale, color)
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
    if (TargetObjectArray)
        TargetObjectArray.push(newStaticObject); 
    return newStaticObject;
}

var CreateGizmo = function(gl, TargetObjectArray, pos, rot, scale)
{
    var length = 5;
    var length2 = length*0.6;
    var vertices = [
        0.0,            0.0,        0.0,            0, 0, 1, 1,
        0.0,            0.0,        length,        0, 0, 1, 1,
        0.0,            0.0,        length,        0, 0, 1, 1,
        length2/2,      0.0,        length2,       0, 0, 1, 1,
        0.0,            0.0,        length,        0, 0, 1, 1,
        -length2/2,     0.0,        length2,       0, 0, 1, 1,

        0.0,            0.0,        0.0,            1, 0, 0, 1,
        length,         0.0,        0.0,            1, 0, 0, 1,
        length,         0.0,        0.0,            1, 0, 0, 1,
        length2,        0.0,        length2/2,      1, 0, 0, 1,
        length,         0.0,        0.0,            1, 0, 0, 1,
        length2,        0.0,        -length2/2,     1, 0, 0, 1,

        0.0,            0.0,        0.0,            0, 1, 0, 1,
        0.0,            length,     0.0,            0, 1, 0, 1,
        0.0,            length,     0.0,            0, 1, 0, 1,
        length2/2,      length2,    0.0,            0, 1, 0, 1,
        0.0,            length,     0.0,            0, 1, 0, 1,
        -length2/2,     length2,    0.0,            0, 1, 0, 1,
    ];       

    var elementCount = 7;

    var attrib0 = createAttribParameter('Pos', 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, 0);
    var attrib1 = createAttribParameter('Color', 4, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, Float32Array.BYTES_PER_ELEMENT * 3);
    var newStaticObject = createStaticObject(gl, vertices, null, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1], 0, gl.STATIC_DRAW, vertices.length / elementCount, gl.LINES);

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

    var x;
    var z;
    for(var i=-halfCount;i<=halfCount;++i)
    {
        x = i * interval;
        for(var k=-halfCount;k<=halfCount;++k)
        {
            z = k * interval;

            vertices.push(x + 0.0);         vertices.push(0.0);         vertices.push(z + interval);  vertices.push(0.0); vertices.push(0.0); vertices.push(1.0); vertices.push(0.7);
            vertices.push(x + 0.0);         vertices.push(0.0);         vertices.push(z + -interval); vertices.push(0.0); vertices.push(0.0); vertices.push(1.0); vertices.push(0.7);

            vertices.push(x + interval);      vertices.push(0.0);         vertices.push(z + 0.0);     vertices.push(1.0); vertices.push(0.0); vertices.push(0.0); vertices.push(0.7);
            vertices.push(x + -interval);     vertices.push(0.0);         vertices.push(z + 0.0);     vertices.push(1.0); vertices.push(0.0); vertices.push(0.0); vertices.push(0.7);
        }
    }

    var elementCount = 7;

    var attrib0 = createAttribParameter('Pos', 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, 0);
    var attrib1 = createAttribParameter('Color', 4, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, Float32Array.BYTES_PER_ELEMENT * 3);
    var newStaticObject = createStaticObject(gl, vertices, null, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1], 0, gl.STATIC_DRAW, vertices.length / elementCount, gl.LINES);
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
        0.0,        length,       0.0,           0, 1, 0, 1,
        0.0,        -length,      0.0,           0, 1, 0, 1,
    ];

    var elementCount = 7;

    var attrib0 = createAttribParameter('Pos', 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, 0);
    var attrib1 = createAttribParameter('Color', 4, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, Float32Array.BYTES_PER_ELEMENT * 3);
    var newStaticObject = createStaticObject(gl, vertices, null, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1], 0, gl.STATIC_DRAW, vertices.length / elementCount, gl.LINES);

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
    var attrib0 = createAttribParameter('VertPos', 2, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, 0);
    var newStaticObject = createStaticObject(gl, vertices, null, 'shaders/tex_ui_vs.glsl', 'shaders/tex_ui_fs.glsl', [attrib0], 0, gl.DYNAMIC_DRAW, vertices.length / elementCount, gl.TRIANGLE_STRIP);

    var uiStaticObject = { UIInfo:CreateVec4(x, y, width, height) };
    uiStaticObject.__proto__ = newStaticObject;
    uiStaticObject.texture = texture;
    uiStaticObject.setRenderProperty = function()
    {
        if (__proto__.setRenderProperty)
            __proto__.setRenderProperty();

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

        if (this.texture)
        {
            var tex_object = gl.getUniformLocation(this.program, 'tex_object');
            if (tex_object)
                gl.uniform1i(tex_object, 0);
    
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        }
    };

    newStaticObject.pos = CreateVec3(0, 0, 0.0);
    newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    newStaticObject.scale = CreateVec3(1.0, 1.0, 1.0);
    if (TargetObjectArray)
        TargetObjectArray.push(uiStaticObject);
    return uiStaticObject;
}
