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

var OnSliderChangeTime = function(e)
{
    console.log(e.target.valueAsNumber);
    if (arrowSegment.segment)
    {
        var t = e.target.valueAsNumber;
        UpdateSegmentTime(arrowSegment.segment, t);
    }
}

var OnSliderChangeRayX = function(e)
{
    console.log(e.target.valueAsNumber);
    if (arrowSegment.segment)
    {
        arrowSegment.segment.end.x = e.target.valueAsNumber;
        UpdateSegmentTime(arrowSegment.segment, 1.0);
    }
}

var OnSliderChangeRayY = function(e)
{
    console.log(e.target.valueAsNumber);
    if (arrowSegment.segment)
    {
        arrowSegment.segment.end.y = e.target.valueAsNumber;
        UpdateSegmentTime(arrowSegment.segment, 1.0);
    }
}

var OnSliderChangeRayZ = function(e)
{
    console.log(e.target.valueAsNumber);
    if (arrowSegment.segment)
    {
        arrowSegment.segment.end.z = e.target.valueAsNumber;
        UpdateSegmentTime(arrowSegment.segment, 1.0);
    }
}