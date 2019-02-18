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