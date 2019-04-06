var jRenderer = function(gl)
{
    this.gl = gl;
}

jRenderer.prototype.Setup = function()
{

}

jRenderer.prototype.Teardown = function()
{

}

jRenderer.prototype.ShadowPrePass = function(camera)
{

}

jRenderer.prototype.DebugShadowPass = function(camera)
{

}

jRenderer.prototype.RenderPass = function(camera)
{

}

jRenderer.prototype.DebugRenderPass = function(camera)
{

}

jRenderer.prototype.UIPass = function(camera)
{

}

jRenderer.prototype.DebugUIPass = function(camera)
{

}

jRenderer.prototype.Render = function(camera)
{
    var gl = this.gl;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    
    this.ShadowPrePass(camera);
    this.DebugShadowPass(camera);

    this.RenderPass(camera);
    this.DebugRenderPass(camera);

    this.UIPass(camera);
    this.DebugUIPass(camera);
}

jRenderer.prototype.Reset = function()
{
    this.ShadowPrePass = jRenderer.prototype.ShadowPrePass;    
    this.DebugShadowPass = jRenderer.prototype.DebugShadowPass;    
    this.RenderPass = jRenderer.prototype.RenderPass;    
    this.DebugRenderPass = jRenderer.prototype.DebugRenderPass;    
    this.UIPass = jRenderer.prototype.UIPass;    
    this.DebugUIPass = jRenderer.prototype.DebugUIPass;    
}

///////////////////////////////////////////////////////////////////////////////
