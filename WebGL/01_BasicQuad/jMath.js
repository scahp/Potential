////////////////////////////////////////////////
// jVec3
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
    return this;
}

jVec3.prototype.Add = function(b)
{
    this.x = this.x + b.x;
    this.y = this.y + b.y;
    this.z = this.z + b.z;
    return this;
}

jVec3.prototype.Sub = function(b)
{
    this.x = this.x - b.x;
    this.y = this.y - b.y;
    this.z = this.z - b.z;
    return this;
}

jVec3.prototype.Neg = function()
{
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
}

jVec3.prototype.Mul = function(value)
{
    this.x *= value;
    this.y *= value;
    this.z *= value;
    return this;
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
////////////////////////////////////////////////

////////////////////////////////////////////////
// jVec4
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
    return this;
}

jVec4.prototype.Add = function(out, a, b)
{
    out.x = a.x + b.x;
    out.y = a.y + b.y;
    out.z = a.z + b.z;
    out.w = a.w + b.w;
    return this;
}

jVec4.prototype.Sub = function(out, a, b)
{
    out.x = a.x - b.x;
    out.y = a.y - b.y;
    out.z = a.z - b.z;
    out.w = a.w - b.w;
    return this;
}

jVec4.prototype.Mul = function(value)
{
    this.x *= value; this.y *= value; this.z *= value; this.w *= value;
    return this;
}
////////////////////////////////////////////////
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


////////////////////////////////////////////////
// jMat4

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

var CreatePosMat4 = function(x, y, z)
{
    var newMat = new jMat4();
    newMat.m[0][3] = x;
    newMat.m[1][3] = y;
    newMat.m[2][3] = z;
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

    newMat4.m[0][0] = CZ * CY;
    newMat4.m[0][1] = -SZ * CX + CZ * SY * SX;
    newMat4.m[0][2] = SZ * SX + CZ * SY * CX;
    newMat4.m[0][3] = 0.0;
    newMat4.m[1][0] = SZ * CY;
    newMat4.m[1][1] = CZ * CX + SZ * SY * SX;
    newMat4.m[1][2] = -CZ * SX + SZ * SY * CX;
    newMat4.m[1][3] = 0.0;
    newMat4.m[2][0] = -SY;
    newMat4.m[2][1] = CY * SX;
    newMat4.m[2][2] = CY * CX;
    newMat4.m[2][3] = 0.0;
    newMat4.m[3][0] = 0.0;
    newMat4.m[3][1] = 0.0;
    newMat4.m[3][2] = 0.0;
    newMat4.m[3][3] = 1.0;
    return newMat4;
}

var CreateRotationAxisMat4 = function(pivot, radian)
{
    pivot = pivot.GetNormalize();
    
	var result = new jMat4();
	result.m[0][0] = (1.0 - Math.cos(radian)) * pivot.x * pivot.x + Math.cos(radian);
	result.m[0][1] = (1.0 - Math.cos(radian)) * pivot.x * pivot.y - Math.sin(radian) * pivot.z;
	result.m[0][2] = (1.0 - Math.cos(radian)) * pivot.x * pivot.z + Math.sin(radian) * pivot.y;
	result.m[1][0] = (1.0 - Math.cos(radian)) * pivot.y * pivot.x + Math.sin(radian) * pivot.z;
	result.m[1][1] = (1.0 - Math.cos(radian)) * pivot.y * pivot.y + Math.cos(radian);
	result.m[1][2] = (1.0 - Math.cos(radian)) * pivot.y * pivot.z - Math.sin(radian) * pivot.x;
	result.m[2][0] = (1.0 - Math.cos(radian)) * pivot.z * pivot.x - Math.sin(radian) * pivot.y;
	result.m[2][1] = (1.0 - Math.cos(radian)) * pivot.z * pivot.y + Math.sin(radian) * pivot.x;
    result.m[2][2] = (1.0 - Math.cos(radian)) * pivot.z * pivot.z + Math.cos(radian);    
    return result;
}

var CreateScaleMat4 = function(x, y, z)
{
    var newMat = new jMat4();
    newMat.m[0][0] *= x;
    newMat.m[1][1] *= y;
    newMat.m[2][2] *= z;
    return newMat;
}

var CloneMat4 = function(mat)
{
    var newMat = new jMat4();
    for(var i=0;i<4;++i)
    {
        for(var j=0;j<4;++j)
            newMat.m[i][j] = mat.m[i][j];
    }
    return newMat;
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

jMat4.prototype.Mul = function(b)
{
    var cloneThis = CloneMat4(this);

    this.m[0][0] = cloneThis.m[0][0] * b.m[0][0] + cloneThis.m[0][1] * b.m[1][0] + cloneThis.m[0][2] * b.m[2][0] + cloneThis.m[0][3] * b.m[3][0];
    this.m[0][1] = cloneThis.m[0][0] * b.m[0][1] + cloneThis.m[0][1] * b.m[1][1] + cloneThis.m[0][2] * b.m[2][1] + cloneThis.m[0][3] * b.m[3][1];
    this.m[0][2] = cloneThis.m[0][0] * b.m[0][2] + cloneThis.m[0][1] * b.m[1][2] + cloneThis.m[0][2] * b.m[2][2] + cloneThis.m[0][3] * b.m[3][2];
    this.m[0][3] = cloneThis.m[0][0] * b.m[0][3] + cloneThis.m[0][1] * b.m[1][3] + cloneThis.m[0][2] * b.m[2][3] + cloneThis.m[0][3] * b.m[3][3];

    this.m[1][0] = cloneThis.m[1][0] * b.m[0][0] + cloneThis.m[1][1] * b.m[1][0] + cloneThis.m[1][2] * b.m[2][0] + cloneThis.m[1][3] * b.m[3][0];
    this.m[1][1] = cloneThis.m[1][0] * b.m[0][1] + cloneThis.m[1][1] * b.m[1][1] + cloneThis.m[1][2] * b.m[2][1] + cloneThis.m[1][3] * b.m[3][1];
    this.m[1][2] = cloneThis.m[1][0] * b.m[0][2] + cloneThis.m[1][1] * b.m[1][2] + cloneThis.m[1][2] * b.m[2][2] + cloneThis.m[1][3] * b.m[3][2];
    this.m[1][3] = cloneThis.m[1][0] * b.m[0][3] + cloneThis.m[1][1] * b.m[1][3] + cloneThis.m[1][2] * b.m[2][3] + cloneThis.m[1][3] * b.m[3][3];

    this.m[2][0] = cloneThis.m[2][0] * b.m[0][0] + cloneThis.m[2][1] * b.m[1][0] + cloneThis.m[2][2] * b.m[2][0] + cloneThis.m[2][3] * b.m[3][0];
    this.m[2][1] = cloneThis.m[2][0] * b.m[0][1] + cloneThis.m[2][1] * b.m[1][1] + cloneThis.m[2][2] * b.m[2][1] + cloneThis.m[2][3] * b.m[3][1];
    this.m[2][2] = cloneThis.m[2][0] * b.m[0][2] + cloneThis.m[2][1] * b.m[1][2] + cloneThis.m[2][2] * b.m[2][2] + cloneThis.m[2][3] * b.m[3][2];
    this.m[2][3] = cloneThis.m[2][0] * b.m[0][3] + cloneThis.m[2][1] * b.m[1][3] + cloneThis.m[2][2] * b.m[2][3] + cloneThis.m[2][3] * b.m[3][3];

    this.m[3][0] = cloneThis.m[3][0] * b.m[0][0] + cloneThis.m[3][1] * b.m[1][0] + cloneThis.m[3][2] * b.m[2][0] + cloneThis.m[3][3] * b.m[3][0];
    this.m[3][1] = cloneThis.m[3][0] * b.m[0][1] + cloneThis.m[3][1] * b.m[1][1] + cloneThis.m[3][2] * b.m[2][1] + cloneThis.m[3][3] * b.m[3][1];
    this.m[3][2] = cloneThis.m[3][0] * b.m[0][2] + cloneThis.m[3][1] * b.m[1][2] + cloneThis.m[3][2] * b.m[2][2] + cloneThis.m[3][3] * b.m[3][2];
    this.m[3][3] = cloneThis.m[3][0] * b.m[0][3] + cloneThis.m[3][1] * b.m[1][3] + cloneThis.m[3][2] * b.m[2][3] + cloneThis.m[3][3] * b.m[3][3];
    
    return this;
}

jMat4.prototype.GetMul = function(b)
{
    return CloneMat4(this).Mul(b);
}

jMat4.prototype.Add = function(b)
{
    for(var i=0;i<4;++i)
    {
        for(var k=0;k<4;++k)
            this.m[i][k] += b.m[i][k];
    }    
    return this;
}

jMat4.prototype.Scale = function(value)
{
    for(var i=0;i<4;++i)
    {
        for(var k=0;k<4;++k)
        {
            this.m[i][k] *= value;
        }
    }
    return this;
}

jMat4.prototype.Transpose = function()
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
    return this;
}

///////////////////////////////////////////////////
// Math Util

var CreateViewMatrix = function(eye, target, up)
{
    var targetVec = new jVec3();
    Sub(targetVec, target, eye);
    targetVec = targetVec.GetNormalize();

    var upVec = new jVec3();
    Sub(upVec, up, eye);
    upVec.GetNormalize();

    var rightVec = new jVec3();
    CrossProduct(rightVec, targetVec, upVec);
    rightVec = rightVec.GetNormalize();

    CrossProduct(upVec, rightVec, targetVec);
    upVec = upVec.GetNormalize();

    targetVec.x = -targetVec.x;
    targetVec.y = -targetVec.y;
    targetVec.z = -targetVec.z;

    var InvRot = new jMat4();
    InvRot.m[0][0] = rightVec.x; 
    InvRot.m[0][1] = rightVec.y; 
    InvRot.m[0][2] = rightVec.z;
    InvRot.m[1][0] = upVec.x; 
    InvRot.m[1][1] = upVec.y; 
    InvRot.m[1][2] = upVec.z;
    InvRot.m[2][0] = targetVec.x; 
    InvRot.m[2][1] = targetVec.y; 
    InvRot.m[2][2] = targetVec.z;

    var InvPos = CreatePosMat4(-eye.x, -eye.y, -eye.z);
    
    var viewMat = CloneMat4(InvRot);
    viewMat.Mul(InvPos);
    
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
