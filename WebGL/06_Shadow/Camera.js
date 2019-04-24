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

    //console.log('(pos : ' + camera.pos.x + ',' + camera.pos.y + ',' + camera.pos.z + ')(' + 'target : ' + camera.target.x + ',' + camera.target.y + ',' + camera.target.z + ')('
    // + 'up : ' + camera.up.x + ',' + camera.up.y + ',' + camera.up.z + ')');
}

var updateCamera = function(gl, cameraIndex)
{
    var camera = Cameras[cameraIndex];
    camera.matView = CreateViewMatrix(camera.pos, camera.target, camera.up);
    
    // Using Far plane at infinity
    if (camera.isPerspectiveMatrix)
    {
        //camera.matProjection = CreatePerspectiveMatrix(gl.canvas.width, gl.canvas.height, camera.fovRad, camera.far, camera.near);
        camera.matProjection = CreatePerspectiveMatrixFarAtInfinity(gl.canvas.width, gl.canvas.height, camera.fovRad, camera.near);
    }
    else
    {
        // todo : this is only for shadowmap tutorial, it should be removed
        //const width = gl.canvas.width;
        //const height = gl.canvas.height;
        const width = 200.0;
        const height = 200.0;
        camera.matProjection = CreateOrthogonalMatrix(width, height, camera.far, camera.near);
    }
}

var CreateCamera = function(gl, pos, target, up, fovRad, near, far, createDebugStaticObject, isPerspectiveMatrix = true)
{
    var toTarget = target.CloneVec3().Sub(pos);
    var toUp = up.CloneVec3().Sub(pos);

    var rightVec = new jVec3();
    CrossProduct3(rightVec, toTarget.GetNormalize(), toUp.GetNormalize());
    CrossProduct3(up, rightVec.GetNormalize(), toTarget.GetNormalize());
    CrossProduct3(target, up.GetNormalize(), rightVec.GetNormalize());

    up.Add(pos);
    target.Add(pos);
    
    var debugStaticObject = [];
    var debugStaticObject2 = [];
    if (createDebugStaticObject)
    {
        const colorOnlyShader = CreateBaseColorOnlyShaderFile();
        const whiteColor = CreateVec3(1.0, 1.0, 1.0, 1.0);
        for(var i=0;i<12;++i)
        {
            var segment = CreateSegment(gl, TransparentStaticObjectArray, ZeroVec3, ZeroVec3, ZeroVec3, 1.0, whiteColor, colorOnlyShader);
            segment.isDisablePipeLineChange = true;
            debugStaticObject.push(segment);
        }

        for(var i=0;i<6;++i)
        {
            var quad = CreateQuad(gl, TransparentStaticObjectArray, ZeroVec3, OneVec3, OneVec3, whiteColor, colorOnlyShader);
            quad.isDisablePipeLineChange = true;
            debugStaticObject2.push(quad);
        }
    }

    var addLight = function(light)
    {
        light.index = this.lights.all.length;
        this.lights.all.push(light);

        if (light.type == "Directional")
        {
            light.internalIndex = this.lights.directionalLights.length;
            this.lights.directionalLights.push(light);
        }
        else if (light.type == "Point")
        {
            light.internalIndex = this.lights.pointLights.length;
            this.lights.pointLights.push(light);
        }
        else if (light.type == "Spot")
        {
            light.internalIndex = this.lights.spotLights.length;
            this.lights.spotLights.push(light);
        }
        else
        {
            alert('undefined light type was tried to add');
        }
    }

    var getLightByIndex = function(index)
    {
        if (index >= 0 && this.all.length > index)
            return this.all[index];
        return null;
    }

    var getNumOfLights = function()
    {
        return this.lights.all.length;
    }

    var checkIsInFrustom = function(pos, radius)
    {
        for(var i=0;i<this.frustumPlanes.length;++i)
        {
            if (!frustumPlanes[i])
                continue;

            var r = GetDotProduct3(pos, frustumPlanes[i].n) - frustumPlanes[i].d + radius;    
            if (r < 0.0)
                return false;
        }

        return true;
    }

    var checkIsInFrustomWithDirection = function(pos, radius, dir)
    {
        for(var i=0;i<this.frustumPlanes.length;++i)
        {
            const plane = frustumPlanes[i];
            if (!plane)
                continue;

            var r = GetDotProduct3(pos, plane.n) - plane.d + radius;    
            if (r < 0.0)
            {
                if (GetDotProduct3(dir, plane.n) <= 0)
                    return false;
            }
        }

        return true;
    }

    var frustumPlanes = [null, null, null, null, null, null];

    var newCamera = {matView:null, matProjection:null, pos:pos, target:target, up:up
        , debugStaticObject:debugStaticObject, debugStaticObject2:debugStaticObject2, fovRad:fovRad, near:near, far:far
        , lights:{all:[], directionalLights:[], pointLights:[], spotLights:[], getLightByIndex:getLightByIndex}, addLight:addLight
        , ambient:null, UseAmbient:true, index:Cameras.length, getNumOfLights:getNumOfLights, checkIsInFrustom:checkIsInFrustom
        , frustumPlanes:frustumPlanes, checkIsInFrustomWithDirection:checkIsInFrustomWithDirection, isPerspectiveMatrix:isPerspectiveMatrix};
    addObject(Cameras, newCamera);
    return newCamera;
}

var updateCameraFrustum = function(gl, camera)
{
    var fovRad = camera.fovRad;
    var near = camera.near;
    var far = camera.far;

    var targetVec = camera.target.CloneVec3().Sub(camera.pos).GetNormalize();
    var length = Math.tan(camera.fovRad) * far;
    var rightVec = getRightVector(camera.index).Mul(length);
    var upVec = getUpVector(camera.index).Mul(length);

    var rightUp = targetVec.CloneVec3().Mul(far).Add(rightVec).Add(upVec).GetNormalize();
    var leftUp = targetVec.CloneVec3().Mul(far).Sub(rightVec).Add(upVec).GetNormalize();
    var rightDown = targetVec.CloneVec3().Mul(far).Add(rightVec).Sub(upVec).GetNormalize();
    var leftDown = targetVec.CloneVec3().Mul(far).Sub(rightVec).Sub(upVec).GetNormalize();

    var origin = camera.pos.CloneVec3();
    var far_lt = origin.CloneVec3().Add(leftUp.CloneVec3().Mul(far));
    var far_rt = origin.CloneVec3().Add(rightUp.CloneVec3().Mul(far));
    var far_lb = origin.CloneVec3().Add(leftDown.CloneVec3().Mul(far));
    var far_rb = origin.CloneVec3().Add(rightDown.CloneVec3().Mul(far));

    var near_lt = origin.CloneVec3().Add(leftUp.CloneVec3().Mul(near));
    var near_rt = origin.CloneVec3().Add(rightUp.CloneVec3().Mul(near));
    var near_lb = origin.CloneVec3().Add(leftDown.CloneVec3().Mul(near));
    var near_rb = origin.CloneVec3().Add(rightDown.CloneVec3().Mul(near));

    var createPlaneFromThreePoints = function(p1, p2, p3)
    {
        var f1 = p2.CloneVec3().Sub(p1);
        var f2 = p3.CloneVec3().Sub(p1);
        var n = new jVec3();
        CrossProduct3(n, f1, f2);
        n = n.GetNormalize();
        var l = GetDotProduct3(p2.CloneVec3(), n);
        return CreatePlane(n.x, n.y, n.z, l);
    }

    camera.frustumPlanes[0] = createPlaneFromThreePoints(near_lb, far_lb, near_lt);       // left
    camera.frustumPlanes[1] = createPlaneFromThreePoints(near_rt, far_rt, near_rb);       // right
    camera.frustumPlanes[2] = createPlaneFromThreePoints(near_lt, far_lt, near_rt);       // top
    camera.frustumPlanes[3] = createPlaneFromThreePoints(near_rb, far_rb, near_lb);       // bottom
    camera.frustumPlanes[4] = createPlaneFromThreePoints(near_lb, near_lt, near_rb);      // near
    camera.frustumPlanes[5] = createPlaneFromThreePoints(far_rb, far_rt, far_lb);         // far

    var debgObj = camera.debugStaticObject;
    if (debgObj.length > 0)
    {
        var updateSegment = function(segment, start, end, color)
        {
            segment.start = start;
            segment.end = end;
            segment.color = color;
            var end = segment.getCurrentEnd();
    
            var vertices = [
                segment.start.x,    segment.start.y,    segment.start.z,
                end.x,              end.y,              end.z,
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
        }

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
    }

    var debgObj2 = camera.debugStaticObject2;
    if (debgObj2.length > 0)
    {
        var updateQuad = function(quad, p1, p2, p3, p4, color)
        {
            var vertices = [
                p1.x,   p1.y,   p1.z,
                p2.x,   p2.y,   p2.z,
                p3.x,   p3.y,   p3.z,
                p3.x,   p3.y,   p3.z,
                p2.x,   p2.y,   p2.z,
                p4.x,   p4.y,   p4.z,
            ];

            var colors = [
                color.x, color.y, color.z, color.w,
                color.x, color.y, color.z, color.w,
                color.x, color.y, color.z, color.w,
                color.x, color.y, color.z, color.w,
                color.x, color.y, color.z, color.w,
                color.x, color.y, color.z, color.w,
                color.x, color.y, color.z, color.w,
            ];

            gl.bindBuffer(gl.ARRAY_BUFFER, quad.attribs[0].vbo);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, quad.attribs[1].vbo);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }

        updateQuad(debgObj2[0], far_lt,  near_lt,  far_lb,   near_lb, CreateVec4(1.0, 0.0, 0.0, 0.3));
        updateQuad(debgObj2[1], near_rt, far_rt,   near_rb,  far_rb, CreateVec4(0.0, 1.0, 0.0, 0.3));
        updateQuad(debgObj2[2], far_lt,  far_rt,   near_lt,  near_rt, CreateVec4(0.0, 0.0, 1.0, 0.3));
        updateQuad(debgObj2[3], near_lb, near_rb,  far_lb,   far_rb, CreateVec4(1.0, 1.0, 0.0, 0.3));
        updateQuad(debgObj2[4], near_lt, near_rt,  near_lb,  near_rb, CreateVec4(1.0, 1.0, 1.0, 0.3));
        updateQuad(debgObj2[5], far_lt,  far_rt,   far_lb,   far_rb, CreateVec4(1.0, 1.0, 1.0, 0.3));
    }
}