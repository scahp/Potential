var jVec3 = function()
{
    this.x = 0.0;
    this.y = 0.0;
    this.z = 0.0;
}

var CreateVec3 = function(x, y, z)
{
    var newVec = new jVec3();
    newVec.x = x;
    newVec.y = y;
    newVec.z = z;
    return newVec;
}

jVec3.prototype.Transform = function(matrix)
{
    var x = matrix.m[0][0] * this.x + matrix.m[0][1] * this.y + matrix.m[0][2] * this.z + matrix.m[0][3];
    var y = matrix.m[1][0] * this.x + matrix.m[1][1] * this.y + matrix.m[1][2] * this.z + matrix.m[1][3];
    var z = matrix.m[2][0] * this.x + matrix.m[2][1] * this.y + matrix.m[2][2] * this.z + matrix.m[2][3];
    var w = matrix.m[3][0] * this.x + matrix.m[3][1] * this.y + matrix.m[3][2] * this.z + matrix.m[3][3];
    
    this.x = x / w; this.y = y / w; this.z = z / w;
}

var Add = function(out, a, b)
{
    out.x = a.x + b.x;
    out.y = a.y + b.y;
    out.z = a.z + b.z;
    return out;
}

var Sub = function(out, a, b)
{
    out.x = a.x - b.x;
    out.y = a.y - b.y;
    out.z = a.z - b.z;
    return out;
}

var Multi = function(value)
{
    this.x *= value; this.y *= value; this.z *= value;
    return out;
}

var CrossProduct = function(out, a, b)
{
    out.x = a.y * b.z - b.y * a.z;
    out.y = a.z * b.x - b.z * a.x;
    out.z = a.x * b.y - b.x * a.y;
    return out;
}

var DotProduct = function(out, a, b)
{
    out = a.x * b.x + a.y * b.y + a.z * b.z;
    return out;
}

jVec3.prototype.GetLength = function()
{
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
}

jVec3.prototype.GetNormalize = function()
{
    var length = this.GetLength();
    if (Math.abs(length) > 0.000001)
        return CreateVec3(this.x / length, this.y / length, this.z / length);
    return CreateVec3(0.0, 0.0, 0.0);
}

var jVec4 = function()
{
    this.x = 0.0;
    this.y = 0.0;
    this.z = 0.0;
    this.w = 1.0;
}

var CreateVec4 = function(x, y, z, w)
{
    var newVec = new jVec4();
    newVec.x = x;
    newVec.y = y;
    newVec.z = z;
    newVec.w = w;
    return newVec;
}

jVec4.prototype.Transform = function(matrix)
{
    var x = b.m[0][0] * this.x + b.m[0][1] * this.y + b.m[0][2] * this.z + b.m[0][3] * this.w;
    var y = b.m[1][0] * this.x + b.m[1][1] * this.y + b.m[1][2] * this.z + b.m[1][3] * this.w;
    var z = b.m[2][0] * this.x + b.m[2][1] * this.y + b.m[2][2] * this.z + b.m[2][3] * this.w;
    var w = b.m[3][0] * this.x + b.m[3][1] * this.y + b.m[3][2] * this.z + b.m[3][3] * this.w;
    
    this.x = x; this.y = y; this.z = z; this.w = w;
}

jVec4.prototype.Add = function(out, a, b)
{
    out.x = a.x + b.x;
    out.y = a.y + b.y;
    out.z = a.z + b.z;
    out.w = a.w + b.w;
}

jVec4.prototype.Sub = function(out, a, b)
{
    out.x = a.x - b.x;
    out.y = a.y - b.y;
    out.z = a.z - b.z;
    out.w = a.w - b.w;
}

jVec4.prototype.Multi = function(value)
{
    this.x *= value; this.y *= value; this.z *= value; this.w *= value;
}

var jMat4 = function()
{
    var mm = new Array(4);
    for(var i=0;i<4;++i)
    {
        mm[i] = new Array(4);
        for(var j=0;j<4;++j)
        {
            if (i == j)
                mm[i][j] = 1.0;
            else
                mm[i][j] = 0.0;
        }
    }
    this.m = mm;
}

var CreatePosMat4 = function(x, y, z, w)
{
    var newMat = new jMat4();
    newMat.m[0][3] = x;
    newMat.m[1][3] = y;
    newMat.m[2][3] = z;
    newMat.m[3][3] = w;
    return newMat;
}

var CreateRotMat4 = function(x, y, z)
{
    var newMat4 = new jMat4();
    var SX = Math.sin(x);
    var CX = Math.cos(x);
    var SY = Math.sin(y);
    var CY = Math.cos(y);
    var SZ = Math.sin(z);
    var CZ = Math.cos(z);

    newMat4.m[0][0] = CY * CZ;
    newMat4.m[0][1] = -SZ;
    newMat4.m[0][2] = SY * CZ;
    newMat4.m[0][3] = 0.0;
    newMat4.m[1][0] = CX * CY * SZ + SX * SY;
    newMat4.m[1][1] = CX * CZ;
    newMat4.m[1][2] = CX * SY * SZ - SX * CY;
    newMat4.m[1][3] = 0.0;
    newMat4.m[2][0] = SX * CY * SZ - CX * SY;
    newMat4.m[2][1] = SX * CZ;
    newMat4.m[2][2] = SX * SY * SZ + CX * CY;
    newMat4.m[2][3] = 0.0;
    newMat4.m[3][0] = 0.0;
    newMat4.m[3][1] = 0.0;
    newMat4.m[3][2] = 0.0;
    newMat4.m[3][3] = 1.0;

    return newMat4;
}

var CreateScaleMat4 = function(x, y, z)
{
    var newMat = new jMat4();
    newMat.m[0][0] *= x;
    newMat.m[1][1] *= y;
    newMat.m[2][2] *= z;
    return newMat;
}

var multi = function(out, a, b)
{
    out.m[0][0] = a.m[0][0] * b.m[0][0] + a.m[0][1] * b.m[1][0] + a.m[0][2] * b.m[2][0] + a.m[0][3] * b.m[3][0];
    out.m[0][1] = a.m[0][0] * b.m[0][1] + a.m[0][1] * b.m[1][1] + a.m[0][2] * b.m[2][1] + a.m[0][3] * b.m[3][1];
    out.m[0][2] = a.m[0][0] * b.m[0][2] + a.m[0][1] * b.m[1][2] + a.m[0][2] * b.m[2][2] + a.m[0][3] * b.m[3][2];
    out.m[0][3] = a.m[0][0] * b.m[0][3] + a.m[0][1] * b.m[1][3] + a.m[0][2] * b.m[2][3] + a.m[0][3] * b.m[3][3];

    out.m[1][0] = a.m[1][0] * b.m[0][0] + a.m[1][1] * b.m[1][0] + a.m[1][2] * b.m[2][0] + a.m[1][3] * b.m[3][0];
    out.m[1][1] = a.m[1][0] * b.m[0][1] + a.m[1][1] * b.m[1][1] + a.m[1][2] * b.m[2][1] + a.m[1][3] * b.m[3][1];
    out.m[1][2] = a.m[1][0] * b.m[0][2] + a.m[1][1] * b.m[1][2] + a.m[1][2] * b.m[2][2] + a.m[1][3] * b.m[3][2];
    out.m[1][3] = a.m[1][0] * b.m[0][3] + a.m[1][1] * b.m[1][3] + a.m[1][2] * b.m[2][3] + a.m[1][3] * b.m[3][3];

    out.m[2][0] = a.m[2][0] * b.m[0][0] + a.m[2][1] * b.m[1][0] + a.m[2][2] * b.m[2][0] + a.m[2][3] * b.m[3][0];
    out.m[2][1] = a.m[2][0] * b.m[0][1] + a.m[2][1] * b.m[1][1] + a.m[2][2] * b.m[2][1] + a.m[2][3] * b.m[3][1];
    out.m[2][2] = a.m[2][0] * b.m[0][2] + a.m[2][1] * b.m[1][2] + a.m[2][2] * b.m[2][2] + a.m[2][3] * b.m[3][2];
    out.m[2][3] = a.m[2][0] * b.m[0][3] + a.m[2][1] * b.m[1][3] + a.m[2][2] * b.m[2][3] + a.m[2][3] * b.m[3][3];

    out.m[3][0] = a.m[3][0] * b.m[0][0] + a.m[3][1] * b.m[1][0] + a.m[3][2] * b.m[2][0] + a.m[3][3] * b.m[3][0];
    out.m[3][1] = a.m[3][0] * b.m[0][1] + a.m[3][1] * b.m[1][1] + a.m[3][2] * b.m[2][1] + a.m[3][3] * b.m[3][1];
    out.m[3][2] = a.m[3][0] * b.m[0][2] + a.m[3][1] * b.m[1][2] + a.m[3][2] * b.m[2][2] + a.m[3][3] * b.m[3][2];
    out.m[3][3] = a.m[3][0] * b.m[0][3] + a.m[3][1] * b.m[1][3] + a.m[3][2] * b.m[2][3] + a.m[3][3] * b.m[3][3];
}

var CreateMat4 = function(pos, rot, scale)
{
    var newMat = new jMat4();
    jMath4.multi(newMat, CreateScaleMat4(), CreateRotMat4(rot));
    newMat.m[0][3] = pos.x;
    newMat.m[1][3] = pos.y;
    newMat.m[2][3] = pos.z;
    return newMat;
}

jMat4.prototype.add = function(out, a, b)
{
    for(var i=0;i<4;++i)
    {
        for(var k=0;k<4;++k)
        {
            out.m[i][k] = a.m[i][k] + b.m[i][k];
        }
    }
}

jMat4.prototype.scale = function(out, a, value)
{
    for(var i=0;i<4;++i)
    {
        for(var k=0;k<4;++k)
        {
            out.m[i][k] = a.m[i][k] * value;
        }
    }
}

jMat4.prototype.transpose = function()
{
    for(var i=0;i<4;++i)
    {
        for(var k=i+1;k<4;++k)
        {
            if (i != k)
            {
                var temp = this.m[i][k];
                this.m[i][k] = this.m[k][i];
                this.m[k][i] = temp;
            }
        }
    }
}

var CreateViewMatrix = function(eye, target, up)
{
    var targetVec = new jVec3();
    Sub(targetVec, target, eye);
    targetVec = targetVec.GetNormalize();
    var rightVec = new jVec3();
    CrossProduct(rightVec, targetVec, up);
    rightVec = rightVec.GetNormalize();
    CrossProduct(up, rightVec, targetVec);
    up = up.GetNormalize();

    targetVec.x = -targetVec.x;
    targetVec.y = -targetVec.y;
    targetVec.z = -targetVec.z;

    var InvRot = new jMat4();
    InvRot.m[0][0] = rightVec.x; 
    InvRot.m[1][0] = rightVec.y; 
    InvRot.m[2][0] = rightVec.z;
    InvRot.m[0][1] = up.x; 
    InvRot.m[1][1] = up.y; 
    InvRot.m[2][1] = up.z;
    InvRot.m[0][2] = targetVec.x; 
    InvRot.m[1][2] = targetVec.y; 
    InvRot.m[2][2] = targetVec.z;

    var InvPos = CreatePosMat4(-eye.x, -eye.y, -eye.z, 1.0);
    
    var viewMat = new jMat4();
    multi(viewMat, InvRot, InvPos);
    
    return viewMat;
}

var CreatePerspectiveMatrix = function(width, height, fovRadian, far, near)
{
	var F = 1.0 / Math.tan(fovRadian);

    var projMat = new jMat4();
    projMat.m[0][0] = F*(height/width); projMat.m[0][1] = 0.0;      projMat.m[0][2] = 0.0;                      projMat.m[0][3] = 0.0;
    projMat.m[1][0] = 0.0;              projMat.m[1][1] = F;        projMat.m[1][2] = 0.0;                      projMat.m[1][3] = 0.0;
    projMat.m[2][0] = 0.0;              projMat.m[2][1] = 0.0;      projMat.m[2][2] = -(far+near) / (far-near); projMat.m[2][3] = -(2.0*near*far)/(far-near);
    projMat.m[3][0] = 0.0;              projMat.m[3][1] = 0.0;      projMat.m[3][2] = -1.0;                     projMat.m[3][3] = 0.0;
    return projMat;
}

var DegreeToRadian = function(deg)
{
    return deg * Math.PI / 180.0;
}

var RadianToDegree = function(rad)
{
    return rad * 180.0 / Math.PI;
}
