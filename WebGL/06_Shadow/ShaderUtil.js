var CreatePipeLineHashCode = function(shaderInfo)
{
    return (shaderInfo.vs + shaderInfo.fs + shaderInfo.vsPreprocessor + shaderInfo.fsPreprocessor).hashCode();
}

var CreatePipeLine = function(shaderInfo)
{
    const hashCode = CreatePipeLineHashCode(shaderInfo);
    var pipeLine = PipeLines[hashCode];
    if (!pipeLine)
    {
        if (jWebGL && jWebGL.gl)
            pipeLine = PipeLines[hashCode] = CreateProgram(jWebGL.gl, shaderInfo);
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
    const hashCode = CreatePipeLineHashCode(shaderInfo);

    var pipeLineInfo = GetPipeLine(hashCode);
    if (!pipeLineInfo)
        pipeLineInfo = CreatePipeLine(shaderInfo);

    return pipeLineInfo;
}

////////////////////////////////////////////////////////////////////////////
// Shader file info
var CreateCubeMapShaderFile = function()
{
    const vs = "shaders/shadowmap/vs_cubemap.glsl";
    const fs = "shaders/shadowmap/fs_cubemap.glsl";

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:""};
}

var CreateTexArrayCubeMapShaderFile = function()
{
    const vs = "shaders/shadowmap/vs_texarray_cubemap.glsl";
    const fs = "shaders/shadowmap/fs_texarray_cubemap.glsl";

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:""};
}

var CreateShadowMapShaderFile = function()
{
    const vs = "shaders/shadowmap/vs_shadowMap.glsl";
    const fs = "shaders/shadowmap/fs_shadowMap.glsl";

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:""};
}

var CreateVarianceShadowMapShaderFile = function()
{
    const vs = "shaders/shadowmap/vs_varianceShadowMap.glsl";
    const fs = "shaders/shadowmap/fs_varianceShadowMap.glsl";

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:""};
}

var CreateOmniDirectionalShadowMapShaderFile = function()
{
    const vs = "shaders/shadowmap/vs_omniDirectionalShadowMap.glsl";
    const fs = "shaders/shadowmap/fs_omniDirectionalShadowMap.glsl";

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:""};
}

var CreateExponentialShadowMapShaderFile = function()
{
    const vs = "shaders/shadowmap/vs_exponentialShadowMap.glsl";
    const fs = "shaders/shadowmap/fs_exponentialShadowMap.glsl";

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:""};
}

var CreateExponentialVarianceShadowMapShaderFile = function()
{
    const vs = "shaders/shadowmap/vs_EVSM.glsl";
    const fs = "shaders/shadowmap/fs_EVSM.glsl";

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:""};
}

var CreateBaseInfinityFarShaderFile = function()
{
    const vs = "shaders/shadowvolume/vs_infinityFar.glsl";
    const fs = "shaders/shadowvolume/fs_infinityFar.glsl";

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:""};
}

var CreateBaseShadowVolumeShaderFile = function()
{
    const vs = "shaders/shadowvolume/vs.glsl";
    const fs = "shaders/shadowvolume/fs.glsl";

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:""};
}

var CreateBaseShadowMapShaderFile = function()
{
    const vs = "shaders/shadowmap/vs.glsl";
    const fs = "shaders/shadowmap/fs.glsl";

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:""};
}

var CreateBaseShadowMap_PCSS_ShaderFile = function()
{
    const vs = "shaders/shadowmap/vs.glsl";
    const fs = "shaders/shadowmap/fs.glsl";

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:"#define USE_PCSS 1"};
}

var CreateBaseShadowMap_PCSS_PoissonSample_ShaderFile = function()
{
    const vs = "shaders/shadowmap/vs.glsl";
    const fs = "shaders/shadowmap/fs.glsl";

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:"#define USE_PCSS 1\r\n#define USE_POISSON_SAMPLE 1"};
}

var CreateBaseShadowMap_PCF_ShaderFile = function()
{
    const vs = "shaders/shadowmap/vs.glsl";
    const fs = "shaders/shadowmap/fs.glsl";

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:"#define USE_PCF 1"};
}

var CreateBaseShadowMap_PCF_PoissonSample_ShaderFile = function()
{
    const vs = "shaders/shadowmap/vs.glsl";
    const fs = "shaders/shadowmap/fs.glsl";

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:"#define USE_PCF 1\r\n#define USE_POISSON_SAMPLE 1"};
}

var CreateBaseShadowMap_VarianceShadowMap_ShaderFile = function()
{
    const vs = "shaders/shadowmap/vs.glsl";
    const fs = "shaders/shadowmap/fs.glsl";

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:"#define USE_VSM 1"};
}

var CreateBaseShadowVolumeAmbientOnlyShaderFile = function()
{
    const vs = "shaders/shadowvolume/vs.glsl";
    const fs = "shaders/shadowvolume/fs_ambientonly.glsl";

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:""};
}

var CreateBaseColorOnlyShaderFile = function()
{
    const vs = 'shaders/color_only_vs.glsl';
    const fs = 'shaders/color_only_fs.glsl';

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:""};
}

var CreateBaseTextureShaderFile = function()
{
    const vs = 'shaders/tex_vs.glsl';
    const fs = 'shaders/tex_fs.glsl';

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:""};
}

var CreateBaseUIShaderFile = function()
{
    const vs = 'shaders/tex_ui_vs.glsl';
    const fs = 'shaders/tex_ui_fs.glsl';

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:""};
}

var CreateFullscreenBlurShaderFile = function()
{
    const vs = 'shaders/vs_blur.glsl';
    const fs = 'shaders/fs_blur.glsl';

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:""};
}

var CreateFullscreenBlurOmnidirectionalShaderFile = function()
{
    const vs = 'shaders/vs_omnidirectional_blur.glsl';
    const fs = 'shaders/fs_omnidirectional_blur.glsl';

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:""};
}

var CreateBaseShadowMap_ExponentialShadowMap_ShaderFile = function()
{
    const vs = "shaders/shadowmap/vs.glsl";
    const fs = "shaders/shadowmap/fs.glsl";

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:"#define USE_ESM 1"};
}

var CreateOmniDirectionalExponentialShadowMapShaderFile = function()
{
    const vs = "shaders/shadowmap/vs_omniDirectionalExponentialShadowMap.glsl";
    const fs = "shaders/shadowmap/fs_omniDirectionalExponentialShadowMap.glsl";

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:""};
}

var CreateOmniDirectionalExponentialVarianceShadowMapShaderFile = function()
{
    const vs = "shaders/shadowmap/vs_omniDirectionalEVSM.glsl";
    const fs = "shaders/shadowmap/fs_omniDirectionalEVSM.glsl";

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:""};
}

var CreateBaseShadowMap_EVSM_ShaderFile = function()
{
    const vs = "shaders/shadowmap/vs.glsl";
    const fs = "shaders/shadowmap/fs.glsl";

    return {vs:vs, fs:fs, vsPreprocessor:"", fsPreprocessor:"#define USE_EVSM 1"};
}