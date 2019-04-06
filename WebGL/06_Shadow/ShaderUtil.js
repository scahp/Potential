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

var LoadPipeline = function(shaderInfo)
{
    const hashCode = CreatePipeLineHashCode(shaderInfo.vs, shaderInfo.fs);

    var pipeLineInfo = GetPipeLine(hashCode);
    if (!pipeLineInfo)
        pipeLineInfo = CreatePipeLine(shaderInfo.vs, shaderInfo.fs);

    return pipeLineInfo;
}

////////////////////////////////////////////////////////////////////////////
// Shader file info
var CreateCubeMapShaderFile = function()
{
    const vs = "shaders/shadowmap/vs_cubemap.glsl";
    const fs = "shaders/shadowmap/fs_cubemap.glsl";

    return {vs:vs, fs:fs};
}

var CreateShadowMapShaderFile = function()
{
    const vs = "shaders/shadowmap/vs_shadowMap.glsl";
    const fs = "shaders/shadowmap/fs_shadowMap.glsl";

    return {vs:vs, fs:fs};
}

var CreateOmniDirectionalShadowMapShaderFile = function()
{
    const vs = "shaders/shadowmap/vs_omniDirectionalShadowMap.glsl";
    const fs = "shaders/shadowmap/fs_omniDirectionalShadowMap.glsl";

    return {vs:vs, fs:fs};
}

var CreateBaseInfinityFarShaderFile = function()
{
    const vs = "shaders/shadowvolume/vs_infinityFar.glsl";
    const fs = "shaders/shadowvolume/fs_infinityFar.glsl";

    return {vs:vs, fs:fs};
}

var CreateBaseShadowVolumeShaderFile = function()
{
    const vs = "shaders/shadowvolume/vs.glsl";
    const fs = "shaders/shadowvolume/fs.glsl";

    return {vs:vs, fs:fs};
}

var CreateBaseShadowMapShaderFile = function()
{
    const vs = "shaders/shadowmap/vs.glsl";
    const fs = "shaders/shadowmap/fs.glsl";

    return {vs:vs, fs:fs};
}

var CreateBaseShadowVolumeAmbientOnlyShaderFile = function()
{
    const vs = "shaders/shadowvolume/vs.glsl";
    const fs = "shaders/shadowvolume/fs_ambientonly.glsl";

    return {vs:vs, fs:fs};
}

var CreateBaseColorOnlyShaderFile = function()
{
    const vs = 'shaders/color_only_vs.glsl';
    const fs = 'shaders/color_only_fs.glsl';

    return {vs:vs, fs:fs};
}

var CreateBaseTextureShaderFile = function()
{
    const vs = 'shaders/tex_vs.glsl';
    const fs = 'shaders/tex_fs.glsl';

    return {vs:vs, fs:fs};
}

var CreateBaseUIShaderFile = function()
{
    const vs = 'shaders/tex_ui_vs.glsl';
    const fs = 'shaders/tex_ui_fs.glsl';

    return {vs:vs, fs:fs};
}
