function AddEvent(object, type, callback)
{
    if (!object || typeof(object) == 'undefined')
        return;

    if (object.addEventListener)
    {
        object.addEventListener(type, callback, false);
    }
    else if (object.attachEvent)
    {
        object.attachEvent('on' + type, callback);
    }
    else
    {
        object['on' + type] = callback;
    }
}

function RemoveEvent(object, type, callback)
{
    if (!object || typeof(object) == 'undefined')
        return;

    if (object.removeEventListener)
    {
        object.removeEventListener(type, callback, false);
    }
    else if (object.detachEvent)
    {
        object.detachEvent('on' + type, callback);
    }
    else
    {
        object['on' + type] = callback;
    }
}

function LoadTextResource(url, asynchronous, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', url, asynchronous);
    xmlHttp.onload = function(e)
    {
        if (xmlHttp.status >= 200 && xmlHttp.status < 300)
        {
            callback(xmlHttp.responseText);
        }
        else
        {
            callback(new Error(xmlHttp.statusText));
        }
    }

    xmlHttp.onerror = callback;
    xmlHttp.send();
}

var commonCode = null;
var shadowCode = null;
function CreateProgram(gl, vsFilename, fgFilename)
{
    var vsCode;
    var fsCode;

    if (!commonCode)
    {
        LoadTextResource("shaders/common.glsl", false, function(result)
        {
            commonCode = result;
        });
    }

    if (!shadowCode)
    {
        LoadTextResource("shaders/shadow.glsl", false, function(result)
        {
            shadowCode = result;
        });
    }

    LoadTextResource(vsFilename, false, function(result)
    {
        vsCode = result;
        vsCode = vsCode.replace('#include "shadow.glsl"', shadowCode);
        vsCode = vsCode.replace('#include "common.glsl"', commonCode);
    });

    LoadTextResource(fgFilename, false, function(result)
    {
        fsCode = result;
        fsCode = fsCode.replace('#include "shadow.glsl"', shadowCode);
        fsCode = fsCode.replace('#include "common.glsl"', commonCode);
    });

    if (!vsCode || !fsCode)
    {
        alert('Error : empty shader text');
        return 'Error : empty shader text';
    }

    var vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsCode);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS))
    {
        alert('vs compile failed ' + gl.getShaderInfoLog(vs));
        return gl.getShaderInfoLog(vs);
    }

    var fg = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fg, fsCode);
    gl.compileShader(fg);
    if (!gl.getShaderParameter(fg, gl.COMPILE_STATUS))
    {
        alert('fs compile failed' + gl.getShaderInfoLog(fg));
        return gl.getShaderInfoLog(fg);
    }

    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fg);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        alert('program link failed ' + gl.getProgramInfoLog(program));
        return gl.getProgramInfoLog(program);
    }

    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS))
    {
        alert('program validate failed ' + getProgramInfoLog(program));
        return gl.getProgramInfoLog(program);
    }

    return program;
}

String.prototype.hashCode = function(string)
{
    var hash = 0;
    if (this.length == 0) return hash;
    for (i = 0; i < this.length; i++) 
    {
        char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

var LoadTextureFromFile = function(gl, filename)
{
    var texture = gl.createTexture();
    var image = new Image();
    image.src = filename;
    image.addEventListener('load', function() {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    });
    return texture;
}

var CraeteFramebuffer = function(gl, width, height)
{
    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    var tbo = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tbo);
    //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, width, height, 0, gl.RED, gl.FLOAT, null);
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

var setMatrixToUniformLocation = function(gl, pipeline, locationName, matrix)
{
    var matrixArray = matrix.m[0].concat(matrix.m[1],matrix.m[2],matrix.m[3]);
    var matrixLoc = gl.getUniformLocation(pipeline, locationName);
    if (matrixLoc)
        gl.uniformMatrix4fv(matrixLoc, true, new Float32Array(matrixArray));
}

var setVec3ToUniformLocation = function(gl, pipeline, locationName, value)
{
    var loc = gl.getUniformLocation(pipeline, locationName);
    if (loc)
        gl.uniform3fv(loc, [value.x, value.y, value.z]);
}

var setIntToUniformLocation = function(gl, pipeline, locationName, value)
{
    var loc = gl.getUniformLocation(pipeline, locationName);
    if (loc)
        gl.uniform1i(loc, value);
}

var setFloatToUniformLocation = function(gl, pipeline, locationName, value)
{
    var loc = gl.getUniformLocation(pipeline, locationName);
    if (loc)
        gl.uniform1f(loc, value);
}