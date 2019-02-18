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
        
        UpdateCollision();
    }
}

var OnSliderChangePlaneA = function(e)
{
    console.log(e.target.valueAsNumber);
    if (plane)
    {
        quad.rot.x = e.target.valueAsNumber;
        var result = CreateVec3(0.0, 1.0, 0.0).Transform(CreateRotMat4(quad.rot.x, quad.rot.y, quad.rot.z));
        plane.n = result.GetNormalize();

        quad.pos = plane.n.CloneVec3().Mul(plane.d);

        UpdateCollision();
    }
}

var OnSliderChangePlaneB = function(e)
{
    console.log(e.target.valueAsNumber);
    if (plane)
    {
        quad.rot.y = e.target.valueAsNumber;
        var result = CreateVec3(0.0, 1.0, 0.0).Transform(CreateRotMat4(quad.rot.x, quad.rot.y, quad.rot.z));
        plane.n = result.GetNormalize();

        quad.pos = plane.n.CloneVec3().Mul(plane.d);

        UpdateCollision();
    }
}

var OnSliderChangePlaneC = function(e)
{
    console.log(e.target.valueAsNumber);
    if (plane)
    {
        quad.rot.z = e.target.valueAsNumber;
        var result = CreateVec3(0.0, 1.0, 0.0).Transform(CreateRotMat4(quad.rot.x, quad.rot.y, quad.rot.z));
        plane.n = result.GetNormalize();

        quad.pos = plane.n.CloneVec3().Mul(plane.d);

        UpdateCollision();
    }
}

var OnSliderChangePlaneD = function(e)
{
    console.log(e.target.valueAsNumber);   

    plane.d = e.target.valueAsNumber;
    quad.pos = plane.n.CloneVec3().Mul(plane.d);

    UpdateCollision();
}