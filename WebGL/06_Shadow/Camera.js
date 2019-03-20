var Cameras = [];

var getForwardVector = function(cameraIndex)
{
    var camera = Cameras[cameraIndex];
    var forwardVector = CreateVec3(camera.target.x - camera.pos.x, camera.target.y - camera.pos.y, camera.target.z - camera.pos.z);
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
    out = CrossProduct3(out, forwardVector, upVector);
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

var rotateDefaultUpAxis = function(cameraIndex, radian)
{
    var camera = Cameras[cameraIndex];
    var upVector = CreateVec3(0.0, 1.0, 0.0);

    var matPosA = CreatePosMat4(-camera.pos.x, -camera.pos.y, -camera.pos.z);
    var matRotate = CreateRotationAxisMat4(upVector, radian);
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

var updateCamera = function(gl, cameraIndex)
{
    var camera = Cameras[cameraIndex];
    camera.matView = CreateViewMatrix(camera.pos, camera.target, camera.up);
    //camera.matProjection = CreatePerspectiveMatrix(gl.canvas.width, gl.canvas.height, camera.fovRad, camera.far, camera.near);
    camera.matProjection = CreatePerspectiveMatrixFarAtInfinity(gl.canvas.width, gl.canvas.height, camera.fovRad, camera.near);
    camera.matViewProjection = CloneMat4(camera.matProjection).Mul(camera.matView);
}

var CreateCamera = function(gl, pos, target, fovRad, near, far, createDebugStaticObject)
{
    var t1 = pos.CloneVec3().Sub(target).GetNormalize();
    var t2_right = new jVec3();
    CrossProduct3(t2_right, CreateVec3(0.0, 1.0, 0.0), t1);
    t2_right = t2_right.GetNormalize();
    var t3_up = new jVec3();
    CrossProduct3(t3_up, t1, t2_right);
    t3_up = t3_up.GetNormalize()

    var up = t3_up.CloneVec3().Add(pos);
    var matView = CreateViewMatrix(pos, target, up);
    var matProjection = CreatePerspectiveMatrix(gl.canvas.width
        , gl.canvas.height, fovRad, far, near);
    var matMV = CloneMat4(matProjection).Mul(matView);
    
    var debugStaticObject = [];
    var debugStaticObject2 = [];
    if (createDebugStaticObject)
    {
        for(var i=0;i<12;++i)
            debugStaticObject.push(CreateSegment(gl, TransparentStaticObjectArray, CreateVec3(0.0, 0.0, 0.0), CreateVec3(0.0, 0.0, 0.0), CreateVec3(0.0, 0.0, 0.0), 1.0, CreateVec4(1.0, 1.0, 1.0, 1.0)));

        for(var i=0;i<6;++i)
            debugStaticObject2.push(CreateQuad(gl, TransparentStaticObjectArray, CreateVec3(0.0, 0.0, 0.0), CreateVec3(1.0, 1.0, 1.0), CreateVec3(1.0, 1.0, 1.0), CreateVec4(1.0, 1.0, 1.0, 1.0)));
    }

    var addLight = function(light)
    {
        if (light.type == "Directional")
        {
            light.index = this.lights.directionalLights.length;
            this.lights.directionalLights.push(light);
        }
        else if (light.type == "Point")
        {
            light.index = this.lights.pointLights.length;
            this.lights.pointLights.push(light);
        }
        else if (light.type == "Spot")
        {
            light.index = this.lights.spotLights.length;
            this.lights.spotLights.push(light);
        }
        else
        {
            alert('undefined light type was tried to add');
        }
    }

    var getLightByIndex = function(index)
    {
        if (index >= 0)
        {
            if (this.directionalLights.length > index)
                return this.directionalLights[index];

            index -= this.directionalLights.length;

            if (this.pointLights.length > index)
                return this.pointLights[index];

            index -= this.pointLights.length;

            if (this.spotLights.length > index)
                return this.spotLights[index];
        }

        return null;
    }

    var getNumOfLights = function()
    {
        return this.lights.directionalLights.length + this.lights.pointLights.length + this.lights.spotLights.length;
    }

    var newCamera = {matView:matView, matProjection:matProjection
        , matViewProjection:matMV, pos:pos, target:target, up:up
        , debugStaticObject:debugStaticObject, debugStaticObject2:debugStaticObject2, fovRad:fovRad, near:near, far:far
        , lights:{directionalLights:[], pointLights:[], spotLights:[], getLightByIndex:getLightByIndex}, addLight:addLight
        , ambient:null, index:-1, getNumOfLights:getNumOfLights};
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

    var updateSegment = function(segment, start, end, color)
    {
        var vertices = [
            start.x,               start.y,               start.z,           color.x, color.y, color.z, color.w,
            end.x,                 end.y,                 end.z,             color.x, color.y, color.z, color.w,
        ];

        gl.bindBuffer(gl.ARRAY_BUFFER, segment.vbo);
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

    updateSegment(debgObj[0], origin, far_rt, CreateVec4(1.0, 1.0, 1.0, 1.0));
    updateSegment(debgObj[1], origin, far_lt, CreateVec4(1.0, 1.0, 1.0, 1.0));
    updateSegment(debgObj[2], origin, far_rb, CreateVec4(1.0, 1.0, 1.0, 1.0));
    updateSegment(debgObj[3], origin, far_lb, CreateVec4(1.0, 1.0, 1.0, 1.0));

    updateSegment(debgObj[4], near_lt, near_rt, CreateVec4(1.0, 0.0, 0.0, 1.0));
    updateSegment(debgObj[5], near_lb, near_rb, CreateVec4(1.0, 0.0, 0.0, 1.0));
    updateSegment(debgObj[6], near_lt, near_lb, CreateVec4(1.0, 0.0, 0.0, 1.0));
    updateSegment(debgObj[7], near_rt, near_rb, CreateVec4(1.0, 0.0, 0.0, 1.0));

    updateSegment(debgObj[8],  far_lt, far_rt, CreateVec4(1.0, 0.0, 0.0, 1.0));
    updateSegment(debgObj[9],  far_lb, far_rb, CreateVec4(1.0, 0.0, 0.0, 1.0));
    updateSegment(debgObj[10], far_lt, far_lb, CreateVec4(1.0, 0.0, 0.0, 1.0));
    updateSegment(debgObj[11], far_rt, far_rb, CreateVec4(1.0, 0.0, 0.0, 1.0));

    var debgObj2 = camera.debugStaticObject2;
    if (debgObj2.length <= 0)
        return;

    var updateQuad = function(quad, p1, p2, p3, p4, color)
    {
        var vertices = [
            p1.x,   p1.y,   p1.z,   color.x, color.y, color.z, color.w,
            p2.x,   p2.y,   p2.z,   color.x, color.y, color.z, color.w,
            p3.x,   p3.y,   p3.z,   color.x, color.y, color.z, color.w,
            p4.x,   p4.y,   p4.z,   color.x, color.y, color.z, color.w,
        ];

        gl.bindBuffer(gl.ARRAY_BUFFER, quad.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    updateQuad(debgObj2[0], far_lt,  near_lt,  far_lb,   near_lb, CreateVec4(1.0, 0.0, 0.0, 0.3));
    updateQuad(debgObj2[1], near_rt, far_rt,   near_rb,  far_rb, CreateVec4(0.0, 1.0, 0.0, 0.3));
    updateQuad(debgObj2[2], far_lt,  far_rt,   near_lt,  near_rt, CreateVec4(0.0, 0.0, 1.0, 0.3));
    updateQuad(debgObj2[3], near_lb, near_rb,  far_lb,   far_rb, CreateVec4(1.0, 1.0, 0.0, 0.3));

    updateQuad(debgObj2[4], near_lt, near_rt,  near_lb,  near_rb, CreateVec4(1.0, 1.0, 1.0, 0.3));
    updateQuad(debgObj2[5], far_lt,  far_rt,   far_lb,   far_rb, CreateVec4(1.0, 1.0, 1.0, 0.3));
}