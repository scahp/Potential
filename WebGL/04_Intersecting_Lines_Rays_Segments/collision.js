var IntersectSegmentPlane = function(a, b, p)
{
    const ba = b.CloneVec3().Sub(a);
    var temp = GetDotProduct3(p.n, ba);
    if (!IsNearlyZero(temp))
    {
        var t = (p.d - GetDotProduct3(p.n, a)) / temp;
        if ((0.0 <= t) && (1.0 >= t))
        {
            var p = a.CloneVec3().Add(ba.Mul(t));
            return { point:p, t:t};
        }
    }

    return null;
}

var IntersectRaySphere = function(p, d, sphere)
{
    const radius = sphere.scale.x;

    var m = p.CloneVec3().Sub(sphere.pos);
    
    var b = GetDotProduct3(m, d);
    var c = GetDotProduct3(m, m) - (radius * radius);

    if (c > 0.0 && b > 0.0)
        return null;

    var discr = b * b - c;
    if (IsNearlyZero(discr))
    {
        t = -b;
    }
    else
    {
        if (discr < 0.0)
            return null;
        t = -b - Math.sqrt(discr);
    }

    if (t < 0.0)
        t = 0.0;

    var q = p.CloneVec3().Add(d.CloneVec3().Mul(t));
    return { point:q, t:t };
}

var TestRaySphere = function(p, d, sphere)
{
    const radius = sphere.scale.x;

    var m = p.CloneVec3().Sub(sphere.pos);
    
    var b = GetDotProduct3(m, d);
    var c = GetDotProduct3(m, m) - (radius * radius);

    if (c > 0.0 && b > 0.0)
        return null;

    var discr = b * b - c;
    if ((discr < 0.0) && !IsNearlyZero(discr))
        return null;

    return true;
}

var IntersectSegmentSphere = function(pa, pb, sphere)
{
    const radius = sphere.scale.x;
    const p = pa;
    const ba = pb.CloneVec3().Sub(pa);
    const baLen = ba.GetLength();
    if (baLen <= 0.0)
        return null;
    const d = ba.CloneVec3().Div(baLen);

    var m = p.CloneVec3().Sub(sphere.pos);
    
    var b = GetDotProduct3(m, d);
    var c = GetDotProduct3(m, m) - (radius * radius);

    if (c > 0.0 && b > 0.0)
        return null;

    var discr = b * b - c;
    if (IsNearlyZero(discr))
    {
        t = -b;
    }
    else
    {
        if (discr < 0.0)
            return null;
        t = -b - Math.sqrt(discr);
    }

    if (t > baLen)
        return null;

    if (t < 0.0)
        t = 0.0;

    var q = p.CloneVec3().Add(d.CloneVec3().Mul(t));
    return { point:q, t:t };
}

var TestSegmentSphere = function(pa, pb, sphere)
{
    const radius = sphere.scale.x;
    const p = pa;
    const ba = pb.CloneVec3().Sub(pa);
    const baLen = ba.GetLength();
    if (baLen <= 0.0)
        return null;
    const d = ba.CloneVec3().Div(baLen);

    var m = p.CloneVec3().Sub(sphere.pos);
    
    var b = GetDotProduct3(m, d);
    var c = GetDotProduct3(m, m) - (radius * radius);

    if (c > 0.0 && b > 0.0)
        return null;

    var discr = b * b - c;
    if (IsNearlyZero(discr))
    {
        t = -b;
    }
    else
    {
        if (discr < 0.0)
            return null;
        t = -b - Math.sqrt(discr);
    }

    if (t > baLen)
        return null;

    return true;
}