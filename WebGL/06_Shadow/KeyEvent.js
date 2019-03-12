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

var OnSliderChangePointLightX = function(e)
{
    console.log(e.target.valueAsNumber);
    if (pointLight)
        pointLight.pos.x = e.target.valueAsNumber;
}

var OnSliderChangePointLightY = function(e)
{
    console.log(e.target.valueAsNumber);
    if (pointLight)
        pointLight.pos.y = e.target.valueAsNumber;
}

var OnSliderChangePointLightZ = function(e)
{
    console.log(e.target.valueAsNumber);
    if (pointLight)
        pointLight.pos.z = e.target.valueAsNumber;
}

var OnSliderChangePointLightRadius = function(e)
{
    console.log(e.target.valueAsNumber);
    if (pointLight)
        pointLight.maxDistance = e.target.valueAsNumber;
}

var OnSliderChangeSpotLightX = function(e)
{
    console.log(e.target.valueAsNumber);
    if (spotLight)
        spotLight.pos.x = e.target.valueAsNumber;
}

var OnSliderChangeSpotLightY = function(e)
{
    console.log(e.target.valueAsNumber);
    if (spotLight)
        spotLight.pos.y = e.target.valueAsNumber;
}

var OnSliderChangeSpotLightZ = function(e)
{
    console.log(e.target.valueAsNumber);
    if (spotLight)
        spotLight.pos.z = e.target.valueAsNumber;
}

var OnSliderChangeSpotLightUmbraAngle = function(e)
{
    console.log(e.target.valueAsNumber);
    if (spotLight)
    {
        spotLight.umbraRadian = e.target.valueAsNumber;
        if (spotLight.penumbraRadian > spotLight.umbraRadian)
        {
            spotLight.penumbraRadian = spotLight.umbraRadian;
            document.getElementById('SpotLightPenumbraAngle').value = spotLight.penumbraRadian;
        }
    }
}

var OnSliderChangeSpotLightPenumbraAngle = function(e)
{
    console.log(e.target.valueAsNumber);
    if (spotLight)
    {
        spotLight.penumbraRadian = e.target.valueAsNumber;
        if (spotLight.penumbraRadian > spotLight.umbraRadian)
        {
            spotLight.umbraRadian = spotLight.penumbraRadian;
            document.getElementById('SpotLightUmbraAngle').value = spotLight.umbraRadian;
        }
    }
}

var OnSliderChangeSpotLightDistance = function(e)
{
    console.log(e.target.valueAsNumber);
    if (spotLight)
        spotLight.maxDistance = e.target.valueAsNumber;
}

var OnSliderChangeSpherePosX = function(e)
{
    console.log(e.target.valueAsNumber);
    if (tempSphere)
        tempSphere.pos.x = e.target.valueAsNumber;
}

var OnSliderChangeSpherePosY = function(e)
{
    console.log(e.target.valueAsNumber);
    if (tempSphere)
        tempSphere.pos.y = e.target.valueAsNumber;
}

var OnSliderChangeSpherePosZ = function(e)
{
    console.log(e.target.valueAsNumber);
    if (tempSphere)
        tempSphere.pos.z = e.target.valueAsNumber;
}

var OnSliderChangeSphereRadius = function(e)
{
    console.log(e.target.valueAsNumber);
    if (tempSphere)
        tempSphere.scale.x = tempSphere.scale.y = tempSphere.scale.z = e.target.valueAsNumber;
}
