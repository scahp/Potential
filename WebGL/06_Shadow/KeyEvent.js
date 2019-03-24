var KeyState = [];

var OnKeyDown = function(e)
{
    console.log('KeyDown : ' + e.key);
    KeyState[e.key] = 1;
}

var OnKeyUp = function(e)
{
    console.log('KeyUp : ' + e.key);
    KeyState[e.key] = 0;
}

var OnMouseMove = function(e)
{
    console.log('MouseMove : (' + e.movementX + ', ' + e.movementY + ')');

    if (Clicks[0])
    {
        rotateDefaultUpAxis(0, e.movementX * -0.01);
        rotateRightAxis(0, e.movementY * -0.01);
    }
}

var OnClick = function(e)
{
    console.log('Click : ' + e.button);
}

var OnMouseButtonUp = function(e)
{
    console.log('MouseButtonUp : ' + e.button);
    Clicks[0] = 0;
}

var OnMouseButtonDown = function(e)
{
    console.log('MouseButtonDown : ' + e.button);
    Clicks[0] = 1;
}

var OnCheckBoxShowSilhouetteDirectionalLight = function(e)
{
    console.log(e.checked);
    ShowSilhouetteDirectionalLight = e.checked;
}

var OnCheckBoxShowSilhouettePointLight = function(e)
{
    console.log(e.checked);
    ShowSilhouettePointLight = e.checked;
}

var OnCheckBoxShowSilhouetteSpotLight = function(e)
{
    console.log(e.checked);
    ShowSilhouetteSpotLight = e.checked;
}

var OnCheckBoxToggleVisibleDirectionalLightDebugInfo = function(e)
{
    console.log(e.checked);
    ShowDebugInfoOfDirectionalLight = e.checked;
}

var OnCheckBoxToggleVisiblePointLightDebugInfo = function(e)
{
    console.log(e.checked);
    ShowDebugInfoOfPointLight = e.checked;
}

var OnCheckBoxToggleVisibleSpotLightDebugInfo = function(e)
{
    console.log(e.checked);
    ShowDebugInfoOfSpotLight = e.checked;
}

var OnCheckBoxShowDirectionalLightInfo = function(e)
{
    console.log(e.checked);
    if (dirLight)
        dirLight.setHideDebugInfo(!e.checked);
}

var OnCheckBoxShowPointLightInfo = function(e)
{
    console.log(e.checked);
    if (pointLight)
        pointLight.setHideDebugInfo(!e.checked);
}

var OnCheckBoxShowSpotLightInfo = function(e)
{
    console.log(e.checked);
    if (spotLight)
        spotLight.setHideDebugInfo(!e.checked);
}

