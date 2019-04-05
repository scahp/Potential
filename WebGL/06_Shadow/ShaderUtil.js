var CreatePipeLineHashCode = function(vsText, fsText)
{
    return (vsText + fsText).hashCode();
}

var CreatePipeLine = function(vsText, fsText)
{
    const hashCode = CreatePipeLineHashCode(vsText, fsText);
    var pipeLine = PipeLines[hashCode];
    if (!pipeLine)
    {
        if (jWebGL && jWebGL.gl)
            pipeLine = PipeLines[hashCode] = CreateProgram(jWebGL.gl, vsText, fsText);
        if (!pipeLine)
            return null;
    }

    return {hashCode:hashCode, pipeLine:PipeLines[hashCode]};
}

var GetPipeLine = function(hashCode)
{
    if (PipeLines[hashCode])
        return {hashCode:hashCode, pipeLine:PipeLines[hashCode]};
    return null;
}

var GetPipeLineFromAttribDesc = function(attribDesc)
{
    var shader = [];
    GetShaderFromAttribDesc(shader, attribDesc);

    const hashCode = CreatePipeLineHashCode(shader.vs, shader.fs);

    var pipeLineInfo = GetPipeLine(hashCode);
    if (!pipeLineInfo)
        pipeLineInfo = CreatePipeLine(shader.vs, shader.fs);

    return pipeLineInfo;
}

var LoadPipeline = function(shaderInfo)
{
    const hashCode = CreatePipeLineHashCode(shaderInfo.vs, shaderInfo.fs);

    var pipeLineInfo = GetPipeLine(hashCode);
    if (!pipeLineInfo)
        pipeLineInfo = CreatePipeLine(shaderInfo.vs, shaderInfo.fs);

    return pipeLineInfo;
}