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

function CreateProgram(gl, vsFilename, fgFilename)
{
    var vsCode;
    var fsCode;

    LoadTextResource(vsFilename, false, function(result)
    {
        vsCode = result;
    });

    LoadTextResource(fgFilename, false, function(result)
    {
        fsCode = result;
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
        alert('fs compile failed');
        return gl.getShaderInfoLog(fs);
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