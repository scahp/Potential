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
        
        if (updateIntersection)
            updateIntersection();
    }
}

var OnSliderChangePlaneRotationX = function(e)
{
    console.log(e.target.valueAsNumber);
    if (quad && quad.plane)
    {
        quadRot.x = e.target.valueAsNumber;
        quad.plane.n = CreateVec3(0.0, 1.0, 0.0).Transform(CreateRotMat4(quadRot.x, quadRot.y, quadRot.z)).GetNormalize();

        quad.setPlane(quad.plane);

        if (updateIntersection)
            updateIntersection();
    }
}

var OnSliderChangePlaneRotationY = function(e)
{
    console.log(e.target.valueAsNumber);
    if (quad && quad.plane)
    {
        quadRot.y = e.target.valueAsNumber;
        quad.plane.n = CreateVec3(0.0, 1.0, 0.0).Transform(CreateRotMat4(quadRot.x, quadRot.y, quadRot.z)).GetNormalize();
        
        quad.setPlane(quad.plane);

        if (updateIntersection)
            updateIntersection();
    }
}

var OnSliderChangePlaneRotationZ = function(e)
{
    console.log(e.target.valueAsNumber);
    if (quad && quad.plane)
    {
        quadRot.z = e.target.valueAsNumber;
        quad.plane.n = CreateVec3(0.0, 1.0, 0.0).Transform(CreateRotMat4(quadRot.x, quadRot.y, quadRot.z)).GetNormalize();
        
        quad.setPlane(quad.plane);

        if (updateIntersection)
            updateIntersection();
    }
}

var OnSliderChangePlaneD = function(e)
{
    console.log(e.target.valueAsNumber);   

    quad.plane.d = e.target.valueAsNumber;
    quad.setPlane(quad.plane);

    if (updateIntersection)
        updateIntersection();
}

var OnChangedIntersectingType = function(e)
{
    console.log(e.value);
    SwitchExampleType(e.value);
}

var OnSliderChangeSpherePosX = function(e)
{
    console.log(e.target.valueAsNumber);
    if (sphere)
    {
        sphere.pos.x = e.target.valueAsNumber;
        if (updateIntersection)
            updateIntersection();
    }
}

var OnSliderChangeSpherePosY = function(e)
{
    console.log(e.target.valueAsNumber);
    if (sphere)
    {
        sphere.pos.y = e.target.valueAsNumber;
        if (updateIntersection)
            updateIntersection();
    }
}

var OnSliderChangeSpherePosZ = function(e)
{
    console.log(e.target.valueAsNumber);
    if (sphere)
    {
        sphere.pos.z = e.target.valueAsNumber;
        if (updateIntersection)
            updateIntersection();
    }
}
