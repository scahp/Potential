var jWebGL;
var KeyState = [];
var Clicks = [];
var Cameras = [];

var getForwardVector = function(cameraIndex)
{
    var camera = Cameras[cameraIndex];
    var forwardVector = CreateVec3(camera.target.x - camera.pos.x, camera.target.y - camera.pos.y, camera.target.z - camera.pos.z);
    forwardVector.x = -forwardVector.x;
    forwardVector.y = -forwardVector.y;
    forwardVector.z = -forwardVector.z;
    return forwardVector.GetNormalize();
}

var getUpVector = function(cameraIndex)
{
    var camera = Cameras[cameraIndex];
    var upVector = CreateVec3(camera.up.x - camera.pos.x, camera.up.y - camera.pos.y, camera.up.z - camera.pos.z);
    return upVector.GetNormalize();
}

var getRightVector = function(cameraIndex)
{
    var camera = Cameras[cameraIndex];
    var forwardVector = getForwardVector(cameraIndex);
    var upVector = getUpVector(cameraIndex);
    var out = CreateVec3(0.0, 0.0, 0.0);
    out = CrossProduct3(out, upVector, forwardVector);
    return out.GetNormalize();
}

var rotateFowardAxis = function(cameraIndex, radian)
{
    var camera = Cameras[cameraIndex];
    var forwardVector = getForwardVector(cameraIndex);
    
    var matPosA = CreatePosMat4(-camera.pos.x, -camera.pos.y, -camera.pos.z);
    var matRotate = CreateRotationAxisMat4(forwardVector, radian);
    var matPosB = CreatePosMat4(camera.pos.x, camera.pos.y, camera.pos.z);
    
    var mat = CloneMat4(matPosB).Mul(matRotate).Mul(matPosA);
    camera.target.Transform(mat);
    camera.up.Transform(mat);
    camera.pos.Transform(mat);
}

var rotateUpAxis = function(cameraIndex, radian)
{
    var camera = Cameras[cameraIndex];
    var upVector = getUpVector(cameraIndex);

    var matPosA = CreatePosMat4(-camera.pos.x, -camera.pos.y, -camera.pos.z);
    var matRotate = CreateRotationAxisMat4(upVector, radian);
    var matPosB = CreatePosMat4(camera.pos.x, camera.pos.y, camera.pos.z);

    var mat = CloneMat4(matPosB).Mul(matRotate).Mul(matPosA);
    camera.target.Transform(mat);
    camera.up.Transform(mat);
    camera.pos.Transform(mat);
}

var rotateRightAxis = function(cameraIndex, radian)
{
    var camera = Cameras[cameraIndex];
    var rightVector = getRightVector(cameraIndex);

    var matPosA = CreatePosMat4(-camera.pos.x, -camera.pos.y, -camera.pos.z);
    var matRotate = CreateRotationAxisMat4(rightVector, radian);
    var matPosB = CreatePosMat4(camera.pos.x, camera.pos.y, camera.pos.z);

    var mat = CloneMat4(matPosB).Mul(matRotate).Mul(matPosA);
    camera.target.Transform(mat);
    camera.up.Transform(mat);
    camera.pos.Transform(mat);
}

var forward = function(value, cameraIndex)
{
    var camera = Cameras[cameraIndex];
    var f = getForwardVector(cameraIndex);

    f.Mul(value);

    camera.pos.Add(f);
    camera.target.Add(f);
    camera.up.Add(f);
}

var moveShift = function(value, cameraIndex)
{
    var camera = Cameras[cameraIndex];
    var rightVec = getRightVector(cameraIndex);
    rightVec.Mul(value);

    camera.pos.Add(rightVec);
    camera.target.Add(rightVec);
    camera.up.Add(rightVec);

    console.log('(pos : ' + camera.pos.x + ',' + camera.pos.y + ',' + camera.pos.z + ')(' + 'target : ' + camera.target.x + ',' + camera.target.y + ',' + camera.target.z + ')('
     + 'up : ' + camera.up.x + ',' + camera.up.y + ',' + camera.up.z + ')');
}

var createStaticObject = function(gl, vertices, faces, vsCode, fsCode, attribParameters, cameraIndex, bufferType, vertexCount, primitiveType)
{
    var vbo = gl.createBuffer();
    var program = CreateProgram(gl, vsCode, fsCode);

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), bufferType);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var attribs = [];
    for(var i=0;i<attribParameters.length;++i)
    {
        var attr = attribParameters[i];

        var loc = gl.getAttribLocation(program, attr.name);
        attribs[i] = { name:attr.name
            , loc:loc
            , count:attr.count
            , type:attr.type
            , normalized:attr.normalized
            , stride:attr.stride
            , offset:attr.offset };
    }

    var ebo = null;
    var elementCount = 0;
    if (faces)
    {
        ebo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int32Array(faces), bufferType);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        elementCount = faces.length;
    }

    var matWorld = new jMat4();
    var pos = CreateVec3(0.0, 0.0, 0.0);
    var rot = CreateVec3(0.0, 0.0, 0.0);
    var scale = CreateVec3(1.0, 1.0, 1.0);
    return {vbo:vbo, ebo:ebo, program:program, attribs:attribs, matWorld:matWorld, cameraIndex:cameraIndex, pos:pos
        , rot:rot, scale:scale, vertexCount:vertexCount, elementCount:elementCount, primitiveType:primitiveType};
}

var createAttribParameter = function(name, count, type, normalized, stride, offset)
{
    return { name:name, count:count, type:type, normalized:normalized, stride:stride, offset:offset };
}

var bindAttribPointer = function(gl, StaticObject)
{
    gl.bindBuffer(gl.ARRAY_BUFFER, StaticObject.vbo);
    for(var i=0;i<StaticObject.attribs.length;++i)
    {
        var attrib = StaticObject.attribs[i];
        gl.vertexAttribPointer(attrib.loc,
            attrib.count,
            attrib.type,
            attrib.normalized,
            attrib.stride,
            attrib.offset);

        gl.enableVertexAttribArray(attrib.loc);
    }
}

var rotation = 0.0;

var drawStaticObject = function(gl, StaticObject, cameraIndex, texture)
{
    bindAttribPointer(gl, StaticObject);
    gl.useProgram(StaticObject.program);

    ////////////////////////////////////////////
    // Update StaticObject Transforms
    var matPos = CreatePosMat4(StaticObject.pos.x, StaticObject.pos.y, StaticObject.pos.z);
    var matRot = CreateRotMat4(StaticObject.rot.x, StaticObject.rot.y, StaticObject.rot.z);
    var matScale = CreateScaleMat4(StaticObject.scale.x, StaticObject.scale.y, StaticObject.scale.z);
    StaticObject.matWorld = CloneMat4(matPos).Mul(matRot).Mul(matScale);

    var matMVP = CloneMat4(Cameras[cameraIndex].matViewProjection).Mul(StaticObject.matWorld);

    matMVP.Transpose();
    var mpvArray = matMVP.m[0].concat(matMVP.m[1],matMVP.m[2],matMVP.m[3]);
    
    var mvpLoc = gl.getUniformLocation(StaticObject.program, 'MVP');
    gl.uniformMatrix4fv(mvpLoc, false, new Float32Array(mpvArray));
    ////////////////////////////////////////////

    if (texture)
    {
        var tex_object = gl.getUniformLocation(StaticObject.program, 'tex_object');
        if (tex_object)
            gl.uniform1i(tex_object, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
    }

    if (StaticObject.ebo)
    {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, StaticObject.ebo);
        gl.drawElements(StaticObject.primitiveType, StaticObject.elementCount, gl.UNSIGNED_INT, 0);
    }
    else
    {
        gl.drawArrays(StaticObject.primitiveType, 0, StaticObject.vertexCount);    
    }
}

var StaticObjectArray = [];

////////////////////////////////////////////////////////////////
var updateCamera = function(gl, cameraIndex)
{
    var camera = Cameras[cameraIndex];
    camera.matView = CreateViewMatrix(camera.pos, camera.target, camera.up);
    camera.matProjection = CreatePerspectiveMatrix(gl.canvas.width, gl.canvas.height, camera.fovRad, camera.far, camera.near);
    camera.matViewProjection = CloneMat4(camera.matProjection).Mul(camera.matView);
}

var CreateCamera = function(gl, pos, target, fovRad, near, far, createDebugStaticObject)
{
    var t1 = pos.CloneVec3().Sub(target);
    var t2_right = new jVec3();
    CrossProduct3(t2_right, CreateVec3(0.0, 1.0, 0.0), t1);
    var t3_up = new jVec3();
    CrossProduct3(t3_up, t1, t2_right);

    var up = t3_up.CloneVec3().Add(pos);
    var matView = CreateViewMatrix(pos, target, up);
    var matProjection = CreatePerspectiveMatrix(gl.canvas.width
        , gl.canvas.height, fovRad, far, near);
    var matMV = CloneMat4(matProjection).Mul(matView);
    
    var debugStaticObject = [];
    if (createDebugStaticObject)
    {
        for(var i=0;i<12;++i)
            debugStaticObject.push(CreateLine(gl, CreateVec3(0.0, 0.0, 0.0), CreateVec3(0.0, 0.0, 0.0), 1.0, 1.0, CreateVec4(1.0, 1.0, 1.0, 1.0)));
    }

    var newCamera = {matView:matView, matProjection:matProjection
        , matViewProjection:matMV, pos:pos, target:target, up:up
        , debugStaticObject:debugStaticObject, fovRad:fovRad, near:near, far,far};
    Cameras.push(newCamera);
    return newCamera;
}

var updateCameraFrustum = function(gl, cameraIndex)
{
    var camera = Cameras[cameraIndex];
    var debgObj = camera.debugStaticObject;
    if (debgObj.length <= 0)
        return;

    var fovRad = camera.fovRad;
    var near = camera.near;
    var far = camera.far;

    var targetVec = camera.target.CloneVec3().Sub(camera.pos).GetNormalize();
    var length = Math.tan(camera.fovRad) * far;
    var rightVec = getRightVector(cameraIndex).Mul(length);
    var upVec = getUpVector(cameraIndex).Mul(length);

    var rightUp = targetVec.CloneVec3().Mul(far).Add(rightVec).Add(upVec).GetNormalize();
    var leftUp = targetVec.CloneVec3().Mul(far).Sub(rightVec).Add(upVec).GetNormalize();
    var rightDown = targetVec.CloneVec3().Mul(far).Add(rightVec).Sub(upVec).GetNormalize();
    var leftDown = targetVec.CloneVec3().Mul(far).Sub(rightVec).Sub(upVec).GetNormalize();

    var updateLine = function(line, start, end, color)
    {
        var vertices = [
            start.x,               start.y,               start.z,           color.x, color.y, color.z, color.w,
            end.x,                 end.y,                 end.z,             color.x, color.y, color.z, color.w,
        ];

        gl.bindBuffer(gl.ARRAY_BUFFER, line.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    var origin = camera.pos.CloneVec3();
    var far_lt = origin.CloneVec3().Add(leftUp.CloneVec3().Mul(far));
    var far_rt = origin.CloneVec3().Add(rightUp.CloneVec3().Mul(far));
    var far_lb = origin.CloneVec3().Add(leftDown.CloneVec3().Mul(far));
    var far_rb = origin.CloneVec3().Add(rightDown.CloneVec3().Mul(far));

    var near_lt = origin.CloneVec3().Add(leftUp.CloneVec3().Mul(near));
    var near_rt = origin.CloneVec3().Add(rightUp.CloneVec3().Mul(near));
    var near_lb = origin.CloneVec3().Add(leftDown.CloneVec3().Mul(near));
    var near_rb = origin.CloneVec3().Add(rightDown.CloneVec3().Mul(near));

    updateLine(debgObj[0], origin, far_rt, CreateVec4(1.0, 1.0, 1.0, 1.0));
    updateLine(debgObj[1], origin, far_lt, CreateVec4(1.0, 1.0, 1.0, 1.0));
    updateLine(debgObj[2], origin, far_rb, CreateVec4(1.0, 1.0, 1.0, 1.0));
    updateLine(debgObj[3], origin, far_lb, CreateVec4(1.0, 1.0, 1.0, 1.0));

    updateLine(debgObj[4], near_lt, near_rt, CreateVec4(1.0, 1.0, 1.0, 1.0));
    updateLine(debgObj[5], near_lb, near_rb, CreateVec4(1.0, 1.0, 1.0, 1.0));
    updateLine(debgObj[6], near_lt, near_lb, CreateVec4(1.0, 1.0, 1.0, 1.0));
    updateLine(debgObj[7], near_rt, near_rb, CreateVec4(1.0, 1.0, 1.0, 1.0));

    updateLine(debgObj[8], far_lt, far_rt, CreateVec4(1.0, 1.0, 1.0, 1.0));
    updateLine(debgObj[9], far_lb, far_rb, CreateVec4(1.0, 1.0, 1.0, 1.0));
    updateLine(debgObj[10], far_lt, far_lb, CreateVec4(1.0, 1.0, 1.0, 1.0));
    updateLine(debgObj[11], far_rt, far_rb, CreateVec4(1.0, 1.0, 1.0, 1.0));
}
/////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////
var CraeteFramebuffer = function(gl, width, height)
{
    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    var tbo = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tbo);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tbo, 0);

    var rbo = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
    {
        alert('failed to create framebuffer');
        return null;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return {fbo:fbo, tbo:tbo, dbo:rbo};
}
/////////////////////////////////////////////////////////////

var Init = function()
{
    console.log('init function start');

    var canvas = document.getElementById('webgl-surface');
    var gl = canvas.getContext('webgl');
    if (!gl)
    {
        console.log('webgl not supported');
        gl = canvas.getContext('experimental-webgl');
    }

    if (!gl)
    {
        alert('Your browser does not support webgl');
    }

    var ext = gl.getExtension('OES_element_index_uint');        // To use gl.UNSIGNED_INT

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    jWebGL = new jWebGL(gl);
    jWebGL.Init();
}

var jWebGL = function(gl)
{
    this.gl = gl;
}

jWebGL.prototype.Init = function()
{
    var gl = this.gl;
    window.addEventListener('resize', this.OnResizeWindow.bind(this));

    this.OnResizeWindow();

    gl.enable(gl.DEPTH_TEST);

    var matPos = CreatePosMat4(10.0, 20.0, 30.0);
    var matRot = CreateRotMat4(
        DegreeToRadian(10)
        , DegreeToRadian(20)
        , DegreeToRadian(30));
    var matScale = CreateScaleMat4(1, 2, 3);

    ///////////////////////////////////////////////////////////////////////////
    var elementCount = 7;

    var cameraGizmoObject;
    // {
    //     var length = -5;
    //     var length2 = length*0.6;
    //     var vertices = [
    //         0.0,            0.0,        0.0,            1, 0, 0, 1,
    //         0.0,            0.0,        -length,        1, 0, 0, 1,
    //         0.0,            0.0,        -length,        0, 1, 0, 1,
    //         length2,        0.0,        -length2,       0, 1, 0, 1,
    //         0.0,            0.0,        -length,        0, 0, 1, 1,
    //         -length2,       0.0,        -length2,       0, 0, 1, 1,
    //     ];

    //     var attrib0 = createAttribParameter('Pos', 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, 0);
    //     var attrib1 = createAttribParameter('Color', 4, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, Float32Array.BYTES_PER_ELEMENT * 3);
    //     var newStaticObject = createStaticObject(gl, vertices, null, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1], 0, gl.DYNAMIC_DRAW, vertices.length / elementCount, gl.LINES);

    //     newStaticObject.pos = CreateVec3(0.0, 0.0, 0.0);
    //     newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
    //     newStaticObject.scale = CreateVec3(1.0, 1.0, 1.0);
    //     cameraGizmoObject = newStaticObject;
    //     StaticObjectArray.push(newStaticObject);
    // }
    // ///////////////////////////////////////////////////////////////////////////

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

        var attrib0 = createAttribParameter('Pos', 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, 0);
        var attrib1 = createAttribParameter('Color', 4, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, Float32Array.BYTES_PER_ELEMENT * 3);
        var newStaticObject = createStaticObject(gl, vertices, null, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1], 0, gl.STATIC_DRAW, vertices.length / elementCount, gl.LINES);

        newStaticObject.pos = CreateVec3(0.0, 0.0, 0.0);
        newStaticObject.rot = CreateVec3(0.0, 0.0, DegreeToRadian(rotation));
        newStaticObject.scale = CreateVec3(1.0, 1.0, 1.0);
        StaticObjectArray.push(newStaticObject);
    }


    var CoordinateObject;
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

                vertices.push(x + 0.0);         vertices.push(0.0);         vertices.push(z + interval);  vertices.push(0.0); vertices.push(0.0); vertices.push(1.0); vertices.push(0.5);
                vertices.push(x + 0.0);         vertices.push(0.0);         vertices.push(z + -interval); vertices.push(0.0); vertices.push(0.0); vertices.push(1.0); vertices.push(0.5);

                vertices.push(x + interval);      vertices.push(0.0);         vertices.push(z + 0.0);     vertices.push(1.0); vertices.push(0.0); vertices.push(0.0); vertices.push(0.5);
                vertices.push(x + -interval);     vertices.push(0.0);         vertices.push(z + 0.0);     vertices.push(1.0); vertices.push(0.0); vertices.push(0.0); vertices.push(0.5);
            }
        }

        var attrib0 = createAttribParameter('Pos', 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, 0);
        var attrib1 = createAttribParameter('Color', 4, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, Float32Array.BYTES_PER_ELEMENT * 3);
        var newStaticObject = createStaticObject(gl, vertices, null, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1], 0, gl.STATIC_DRAW, vertices.length / elementCount, gl.LINES);

        newStaticObject.pos = CreateVec3(0.0, 0.0, 0.0);
        newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
        newStaticObject.scale = CreateVec3(1.0, 1.0, 1.0);
        CoordinateObject = newStaticObject;
        StaticObjectArray.push(newStaticObject);
    }
    
    {
        var length = 500;
        var vertices = [
            0.0,        length,       0.0,           0, 1, 0, 1,
            0.0,        -length,      0.0,           0, 1, 0, 1,
        ];

        var attrib0 = createAttribParameter('Pos', 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, 0);
        var attrib1 = createAttribParameter('Color', 4, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, Float32Array.BYTES_PER_ELEMENT * 3);
        var newStaticObject = createStaticObject(gl, vertices, null, 'shaders/vs.glsl', 'shaders/fs.glsl', [attrib0, attrib1], 0, gl.STATIC_DRAW, vertices.length / elementCount, gl.LINES);

        newStaticObject.pos = CreateVec3(0.0, 0.0, 0.0);
        newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
        newStaticObject.scale = CreateVec3(1.0, 1.0, 1.0);
        StaticObjectArray.push(newStaticObject);
    }

    var CreateTemp = function(gl, pos, offset, size, scale)
    {
        var halfSize = size.Div(2.0);

        var vertices = [
            offset.x + (-halfSize.x),  offset.y + (halfSize.y),    offset.z,   0.0, 1.0,
            offset.x + (halfSize.x),   offset.y + (halfSize.y),    offset.z,   1.0, 1.0,
            offset.x + (-halfSize.x),  offset.y + (-halfSize.y),   offset.z,   0.0, 0.0,
            offset.x + (halfSize.x),   offset.y + (-halfSize.y),   offset.z,   1.0, 0.0,
        ];

        var elementCount = 5;

        var attrib0 = createAttribParameter('Pos', 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, 0);
        var attrib1 = createAttribParameter('TexCoord', 2, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * elementCount, Float32Array.BYTES_PER_ELEMENT * 3);
        var newStaticObject = createStaticObject(gl, vertices, null, 'shaders/tex_vs.glsl', 'shaders/tex_fs.glsl'
        , [attrib0, attrib1], 0, gl.STATIC_DRAW, vertices.length / elementCount, gl.TRIANGLE_STRIP);
        
        newStaticObject.pos = CreateVec3(pos.x, pos.y, pos.z);
        newStaticObject.rot = CreateVec3(0.0, 0.0, 0.0);
        newStaticObject.scale = CreateVec3(scale.x, scale.y, scale.z);
        return newStaticObject;
    }

    var textureObject = CreateTemp(gl, CreateVec3(0, 50, 0), CreateVec3(0, 0, 0), CreateVec3(1, 1, 1), CreateVec3(50, 50, 50));

    var colorObject = CreateRectangle(gl, CreateVec3(0, 50, -100), CreateVec3(0, 0, 0), CreateVec3(1, 1, 1)
            , CreateVec3(25, 25, 25), CreateVec4(1, 1, 1, 1));
    var colorObject2 = CreateRectangle(gl, CreateVec3(0, 50, -100), CreateVec3(0, 0, 0), CreateVec3(1, 1, 1)
            , CreateVec3(25, 25, 25), CreateVec4(1, 0, 0, 1));

    var processKeyEvents = function()
    {
        if (KeyState['a']) moveShift(-1, 0);
        if (KeyState['d']) moveShift(1, 0);
        if (KeyState['1']) rotateFowardAxis(0, -0.1);
        if (KeyState['2']) rotateFowardAxis(0, 0.1);
        if (KeyState['3']) rotateUpAxis(0, -0.1);
        if (KeyState['4']) rotateUpAxis(0, 0.1);
        if (KeyState['5']) rotateRightAxis(0, -0.1);
        if (KeyState['6']) rotateRightAxis(0, 0.1);
        if (KeyState['w']) forward(-1, 0);
        if (KeyState['s']) forward(1, 0);
    }

    CreateCamera(gl, CreateVec3(50.0, 70.0, 46.0), CreateVec3(0.0, 50.0, -50.0)
    , DegreeToRadian(45), 1.0, 500.0, false);
    
    CreateCamera(gl, CreateVec3(0, 50, 0), CreateVec3(0.0, 50.0, -1.0)
    , DegreeToRadian(40), 5.0, 200.0, true);

    updateCamera(gl, 0);

    var framebuffer = CraeteFramebuffer(gl, 512, 512);

    var t = this;
    var targetObj = Cameras[0];

    var loop = function()
    {
        processKeyEvents();

        t.Update();

        colorObject.rot.x += 0.01;
        colorObject.rot.y += 0.02;
        colorObject.rot.z += 0.015;

        colorObject.pos.x = Math.sin(rotation * 0.01) * 100;
        colorObject.pos.y = Math.cos(rotation * 0.02) * 20 + 50;
        rotation += 1;

        colorObject2.rot.y += 0.01;
        colorObject2.pos.x = Math.sin(rotation * 0.01) * 20
        colorObject2.pos.y = Math.sin(rotation * 0.01) * 100 + 50

        var prePass = function()
        {
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.fbo);
            gl.viewport(0, 0, 512, 512);
            t.Render(1);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        };

        prePass();

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        t.Render(0);
        drawStaticObject(gl, textureObject, 0, framebuffer.tbo);
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

jWebGL.prototype.Update = function()
{
    var gl = this.gl;

    // if (CoordinateObject)
    // {
    //     CoordinateObject.pos.x = Math.floor(Cameras[0].pos.x / 10) * 10;
    //     CoordinateObject.pos.z = Math.floor(Cameras[0].pos.z / 10) * 10;
    // }

    // if (cameraGizmoObject)
    // {
    //     var len = -5.0;

    //     var camera = Cameras[0];
    //     var f = getForwardVector(0);
    //     f.Mul(len);
    //     var right = getRightVector(0);

    //     var vertices = [
    //         f.x + camera.pos.x,               f.y + camera.pos.y,               f.z + camera.pos.z,           1, 0, 0, 1,
    //         f.x + camera.target.x,            f.y + camera.target.y,            f.z + camera.target.z,        1, 0, 0, 1,
    //         f.x + camera.pos.x,               f.y + camera.pos.y,               f.z + camera.pos.z,           0, 1, 0, 1,
    //         f.x + camera.up.x,                f.y + camera.up.y,                f.z + camera.up.z,            0, 1, 0, 1,
    //         f.x + camera.pos.x,               f.y + camera.pos.y,               f.z + camera.pos.z,           0, 0, 1, 1,
    //         f.x + camera.pos.x + right.x,     f.y + camera.pos.y + right.y,     f.z + camera.pos.z + right.z, 0, 0, 1, 1,
    //     ];

    //     gl.bindBuffer(gl.ARRAY_BUFFER, cameraGizmoObject.vbo);
    //     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    //     gl.bindBuffer(gl.ARRAY_BUFFER, null);
    // }

    for(var i=0;i<Cameras.length;++i)
    {
        updateCamera(gl, i);
        updateCameraFrustum(gl, i);
    }
}

jWebGL.prototype.Render = function(cameraIndex)
{
    var gl = this.gl;

    gl.clearColor(0.5, 0.5, 0.5, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for(var i = 0;i<StaticObjectArray.length;++i)
        drawStaticObject(gl, StaticObjectArray[i], cameraIndex, null);
}

jWebGL.prototype.OnResizeWindow = function()
{
    var gl = this.gl;

    var offsetX = 0;
    var offsetY = 0;

    if (window.innerWidth > window.innerHeight)
    {
        gl.canvas.height = window.innerHeight;
        gl.canvas.width = window.innerHeight;

        gl.canvas.style.left = (window.innerWidth - window.innerHeight) / 2;
    }
    else
    {
        gl.canvas.width = window.innerWidth;
        gl.canvas.height = window.innerWidth;
        
        gl.canvas.style.top = (window.innerHeight - window.innerWidth) / 2;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}


var OnKeyDown = function(e)
{
    console.log('KeyDown : ' + e.key);
    KeyState[e.key] = 1;
}

var OnKeyUp = function(e)
{
    console.log('KeyUp : ' + e.key);
    KeyState[e.key] = 0;
}

var OnMouseMove = function(e)
{
    console.log('MouseMove : (' + e.movementX + ', ' + e.movementY + ')');

    if (Clicks[0])
    {
        rotateUpAxis(0, e.movementX * -0.01);
        rotateRightAxis(0, e.movementY * -0.01);
    }
}

var OnClick = function(e)
{
    console.log('Click : ' + e.button);
}

var OnMouseButtonUp = function(e)
{
    console.log('MouseButtonUp : ' + e.button);
    Clicks[0] = 0;
}

var OnMouseButtonDown = function(e)
{
    console.log('MouseButtonDown : ' + e.button);
    Clicks[0] = 1;
}

var OnTouchStart = function(e)
{
    alert('OnTouchStart');
    console.log('TouchStart : ' + e.button);
    Clicks[0] = 0;
}

var OnTouchEnd = function(e)
{
    console.log('TouchEnd : ' + e.button);
    Clicks[0] = 1;
}

var OnTouchMove = function(e)
{
    console.log('TouchMove : (' + e.movementX + ', ' + e.movementY + ')');

    if (Clicks[0])
    {
        Cameras[0].rot.y += e.movementX * 0.01;
        Cameras[0].rot.x += e.movementY * 0.01;
    }
}