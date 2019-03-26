var IntersectSegmentPlane = function(a, b, p)
{
    const ba = b.Clone().Sub(a);
    var temp = GetDotProduct3(p.n, ba);
    if (!IsNearlyZero(temp))
    {
        var t = (p.d - GetDotProduct3(p.n, a)) / temp;
        if ((0.0 <= t) && (1.0 >= t))
        {
            var p = a.Clone().Add(ba.Mul(t));
            return { point:p, t:t};
        }
    }

    return null;
}

var IntersectRaySphere = function(p, d, sphere)
{
    const radius = sphere.scale.x;

    var m = p.Clone().Sub(sphere.pos);
    
    var b = GetDotProduct3(m, d);
    var c = GetDotProduct3(m, m) - (radius * radius);

    // Exit if r’s origin outside s (c > 0) and r pointing away from s (b > 0)
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

    var q = p.Clone().Add(d.Clone().Mul(t));
    return { point:q, t:t };
}

var TestRaySphere = function(p, d, sphere)
{
    const radius = sphere.scale.x;

    var m = p.Clone().Sub(sphere.pos);
    
    var b = GetDotProduct3(m, d);
    var c = GetDotProduct3(m, m) - (radius * radius);

    // Exit if r’s origin outside s (c > 0) and r pointing away from s (b > 0)
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
    const ba = pb.Clone().Sub(pa);
    const baLen = ba.GetLength();
    if (baLen <= 0.0)
        return null;
    const d = ba.Clone().Div(baLen);

    var m = p.Clone().Sub(sphere.pos);
    
    var b = GetDotProduct3(m, d);
    var c = GetDotProduct3(m, m) - (radius * radius);

    // Exit if r’s origin outside s (c > 0) and r pointing away from s (b > 0)
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

    var q = p.Clone().Add(d.Clone().Mul(t));
    return { point:q, t:t };
}

var TestSegmentSphere = function(pa, pb, sphere)
{
    const radius = sphere.scale.x;
    const p = pa;
    const ba = pb.Clone().Sub(pa);
    const baLen = ba.GetLength();
    if (baLen <= 0.0)
        return null;
    const d = ba.Clone().Div(baLen);

    var m = p.Clone().Sub(sphere.pos);
    
    var b = GetDotProduct3(m, d);
    var c = GetDotProduct3(m, m) - (radius * radius);

    // Exit if r’s origin outside s (c > 0) and r pointing away from s (b > 0)
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

var IntersectRayBox = function(p, d, box)
{
    var aabb = box.aabb;

    var tmin = 0.0;
    var tmax = Number.MAX_VALUE;

    for (var i=0;i<3;++i)
    {
        var dd = 0.0;
        var pp = 0.0;
        var aa_min = 0.0;
        var aa_max = 0.0;
        switch(i)
        {
        case 0:
            dd = d.x;
            pp = p.x;
            aa_min = aabb.min.x;
            aa_max = aabb.max.x;
            break;
        case 1:
            dd = d.y;
            pp = p.y;
            aa_min = aabb.min.y;
            aa_max = aabb.max.y;
            break;
        case 2:
            dd = d.z;
            pp = p.z;
            aa_min = aabb.min.z;
            aa_max = aabb.max.z;
            break;
        default:
            alert("it can't be happend!");
            break;
        }

        if (IsNearlyZero(Math.abs(dd)))
        {
            // Ray is parallel to slab. No hit if origin not within slab
            if ((pp < aa_min) || (pp > aa_max))
                return null;
        }
        else
        {
            var ood = 1.0 / dd;
            var t1 = (aa_min - pp) * ood;
            var t2 = (aa_max - pp) * ood;

            if (t1 > t2)
            {
                var temp = t1;
                t1 = t2;
                t2 = temp;
            }

            if (t1 > tmin)
                tmin = t1;
            
            if (t2 < tmax)
                tmax = t2;

            if (tmin > tmax)
                return null;
        }
    }

    var q = p.Clone().Add(d.Clone().Mul(tmin));
    return { point:q, t:tmin };
}

var IntersectSegmentBox = function(pa, pb, box)
{
    const p = pa;
    const ba = pb.Clone().Sub(pa);
    const baLen = ba.GetLength();
    if (baLen <= 0.0)
        return null;
    const d = ba.Clone().Div(baLen);

    var aabb = box.aabb;

    var tmin = 0.0;
    var tmax = Number.MAX_VALUE;

    for (var i=0;i<3;++i)
    {
        var dd = 0.0;
        var pp = 0.0;
        var aa_min = 0.0;
        var aa_max = 0.0;
        switch(i)
        {
        case 0:
            dd = d.x;
            pp = p.x;
            aa_min = aabb.min.x;
            aa_max = aabb.max.x;
            break;
        case 1:
            dd = d.y;
            pp = p.y;
            aa_min = aabb.min.y;
            aa_max = aabb.max.y;
            break;
        case 2:
            dd = d.z;
            pp = p.z;
            aa_min = aabb.min.z;
            aa_max = aabb.max.z;
            break;
        default:
            alert("it can't be happend!");
            break;
        }

        if (IsNearlyZero(Math.abs(dd)))
        {
            // Ray is parallel to slab. No hit if origin not within slab
            if ((pp < aa_min) || (pp > aa_max))
                return null;
        }
        else
        {
            var ood = 1.0 / dd;
            var t1 = (aa_min - pp) * ood;
            var t2 = (aa_max - pp) * ood;

            if (t1 > t2)
            {
                var temp = t1;
                t1 = t2;
                t2 = temp;
            }

            if (t1 > tmin)
                tmin = t1;
            
            if (t2 < tmax)
                tmax = t2;

            if (tmin > tmax)
                return null;
        }
    }

    if (tmin > baLen)
        return null;

    var q = p.Clone().Add(d.Clone().Mul(tmin));
    return { point:q, t:tmin };
}

var TestSegmentBox = function(pa, pb, box)
{
    var aabb = box.aabb;

    var c = aabb.min.Clone().Add(aabb.max).Mul(0.5);    // Box center-point
    var e = aabb.max.Clone().Sub(c);                    // Box halflength extents
    var m = pa.Clone().Add(pb).Mul(0.5);                // Segent midpoint
    var d = pb.Clone().Sub(m);                          // Segment halflength vector
    
    m.Sub(c);       // Translate box and segment to origin

    // Try world coordinate axes as separating axes
    var adx = Math.abs(d.x);
    if (Math.abs(m.x) > e.x + adx)
        return false;
    var ady = Math.abs(d.y);
    if (Math.abs(m.y) > e.y + ady)
        return false;
    var adz = Math.abs(d.z);
    if (Math.abs(m.z) > e.z + adz)
        return false;

    const epsilon = 0.0000001;

    // Add in an epsilon term to counteract arithmetic errors when segment is
    // (near) parallel to a coordinate axis
    adx += epsilon; ady += epsilon; adz += epsilon;

    // Try cross products of segment direction vector with coordinate axes
    if (Math.abs(m.y * d.z - m.z * d.y) > e.y * adz + e.z * ady)
        return false;
    if (Math.abs(m.z * d.x - m.x * d.z) > e.x * adz + e.z * adx)
        return false;
    if (Math.abs(m.x * d.y - m.y * d.x) > e.x * ady + e.y * adx)
        return false;

    // No separating axis found; segment must be overlapping AABB
    return true;
}