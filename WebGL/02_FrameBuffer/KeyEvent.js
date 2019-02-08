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

var OnSliderChangeFar = function(e)
{
    console.log(e);
    Cameras[1].far = e.target.valueAsNumber;
}

var OnSliderChangeNear = function(e)
{
    console.log(e);
    Cameras[1].near = e.target.valueAsNumber;
}

var OnSliderChangeFOV = function(e)
{
    console.log(e);
    Cameras[1].fovRad = DegreeToRadian(e.target.valueAsNumber);
}

