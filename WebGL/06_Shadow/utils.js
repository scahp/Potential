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
function CreateProgram(gl, shaderInfo)
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

    LoadTextResource(shaderInfo.vs, false, function(result)
    {
        vsCode = result;
        vsCode = vsCode.replace('#preprocessor', shaderInfo.vsPreprocessor);
        vsCode = vsCode.replace('#include "shadow.glsl"', shadowCode);
        vsCode = vsCode.replace('#include "common.glsl"', commonCode);
    });

    LoadTextResource(shaderInfo.fs, false, function(result)
    {
        fsCode = result;
        fsCode = fsCode.replace('#preprocessor', shaderInfo.fsPreprocessor);
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
        alert('vs compile failed ' + '(' + shaderInfo.vs + ')' + gl.getShaderInfoLog(vs));
        return gl.getShaderInfoLog(vs);
    }

    var fg = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fg, fsCode);
    gl.compileShader(fg);
    if (!gl.getShaderParameter(fg, gl.COMPILE_STATUS))
    {
        alert('fs compile failed ' + '(' + shaderInfo.fs + ')'  + gl.getShaderInfoLog(fg));
        return gl.getShaderInfoLog(fg);
    }

    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fg);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        alert('program link failed ' + '(' + shaderInfo.vs + ', ' + shaderInfo.fs + ')' + gl.getProgramInfoLog(program));
        return gl.getProgramInfoLog(program);
    }

    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS))
    {
        alert('program validate failed ' + '(' + shaderInfo.vs + ', ' + shaderInfo.fs + ')' + getProgramInfoLog(program));
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

var CraeteFramebufferRG = function(gl, width, height)
{
    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    var tbo = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tbo);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, width, height, 0, gl.RG, gl.FLOAT, null);
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

var createNullTexture = function(gl)
{
    var nullTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, nullTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 2, 2, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return nullTex;
}

var CreateFramebufferHashCode = function(frameBufferInfo)
{
    var temp = frameBufferInfo.type.toString()
    + frameBufferInfo.internalFormat.toString()
    + frameBufferInfo.format.toString()
    + frameBufferInfo.formatType.toString()
    + frameBufferInfo.width.toString()
    + frameBufferInfo.height.toString();
    return temp.hashCode();
}

var CreateFramebufferInfo = function(type, internalFormat, format, formatType, width, height)
{
    return {type:type, internalFormat:internalFormat, format:format, formatType:formatType, width:width, height:height};
}

var returnFramebufferToPool = function(frameBuffer)
{
    if (frameBuffer)
        frameBuffer.using = false;
}

var getFramebufferFromPool = function(gl, type, internalFormat, format, formatType, width, height)
{
    if (!gl)
        return null;

    var framebufferInfo = CreateFramebufferInfo(type, internalFormat, format, formatType, width, height);
    var hashCode = CreateFramebufferHashCode(framebufferInfo);

    var poolArray = FramebufferPool[hashCode];
    if (poolArray)
    {
        for(var i=0;i<poolArray.length;++i)
        {
            if (!poolArray[i].using)
            {
                poolArray[i].using = true;
                return poolArray[i];
            }
        }
    }

    var newFramebuffer = null;

    if (type == gl.TEXTURE_2D)
    {
        var fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    
        var tbo = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tbo);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, formatType, null);
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
        newFramebuffer = {hashCode:hashCode, framebufferInfo:framebufferInfo, fbo:fbo, tbo:tbo, rbo:[rbo], using:false};
    }
    else if (type == gl.TEXTURE_2D_ARRAY)
    {
        const texture2DArray = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture2DArray);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, internalFormat, width, height, 6, 0, format, formatType, null);
    
        ////////////////////////////////////////
        // var framebuffers = [];
        // var renderbuffers = [];
    
        // for(var i=0;i<6;++i)
        // {
        //     var depthMapFBO = gl.createFramebuffer();
        //     gl.bindFramebuffer(gl.FRAMEBUFFER, depthMapFBO);
        //     gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, texture2DArray, 0, i);
    
        //     var rbo = gl.createRenderbuffer();
        //     gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
        //     gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        //     gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo);
    
        //     if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
        //     {
        //         var status_code = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        //         alert("failed to create framebuffer, " + i + ", is not complete: " + status_code);
        //         return null;
        //     }
    
        //     framebuffers.push(depthMapFBO);
        //     renderbuffers.push(rbo);
        // }
        ////////////////////////////////////////
        var framebuffers = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers);
        for(var i=0;i<6;++i)
            gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, texture2DArray, 0, i);

        var renderbuffers = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffers);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffers);

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
        {
            var status_code = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
            alert("failed to create framebuffer, " + i + ", is not complete: " + status_code);
            return;
        }
        ////////////////////////////////////////
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        newFramebuffer = {hashCode:hashCode, framebufferInfo:framebufferInfo, tbo:texture2DArray, fbo:framebuffers, rbo:renderbuffers, using:false};
    }
    else if (type == gl.TEXTURE_CUBE_MAP)
    {
        const depthCubeMap = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, depthCubeMap);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
        var framebuffers = [];
        var renderbuffers = [];
        for(var i=0;i<6;++i)
        {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, internalFormat
                , width, height, 0, format, formatType, null);
        }
    
        for(var i=0;i<6;++i)
        {
            var depthMapFBO = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, depthMapFBO);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, depthCubeMap, 0);
    
            var rbo = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo);
    
            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
            {
                var status_code = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
                alert("failed to create framebuffer, " + i + ", is not complete: " + status_code);
                return null;
            }
    
            framebuffers.push(depthMapFBO);
            renderbuffers.push(rbo);
        }
    
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        newFramebuffer = {hashCode:hashCode, framebufferInfo:framebufferInfo, tbo:depthCubeMap, fbo:framebuffers, rbo:renderbuffers, using:false};
    }
    else
    {
        alert('unsupport type ' + type + ' texture in FramebufferPool');
        return;
    }

    if (FramebufferPool[hashCode])
    {
        FramebufferPool[hashCode].push(newFramebuffer);
    }
    else
    {
        FramebufferPool[hashCode] = [newFramebuffer];
    }
    
    return newFramebuffer;
}
