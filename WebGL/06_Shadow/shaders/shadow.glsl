#include "common.glsl"

precision highp float;

#define BLOCKER_SEARCH_STEP_COUNT 3.0
#define PCF_FILTER_STEP_COUNT 3.0
#define BLOCKER_SEARCH_DIM (BLOCKER_SEARCH_STEP_COUNT * 2.0 + 1.0)
#define BLOCKER_SEARCH_COUNT (BLOCKER_SEARCH_DIM * BLOCKER_SEARCH_DIM)
#define PCF_DIM (PCF_FILTER_STEP_COUNT * 2.0 + 1.0)
#define PCF_COUNT (PCF_DIM * PCF_DIM)

//////////////////////////////////////////////////////////////////////
// Dirctional Light Shadow
#define SHADOW_BIAS_DIRECTIONAL 0.02
#define SEARCH_RADIUS_DIRECTIONAL 5.0
bool IsInShadowMapSpace(vec2 clipPos)
{
    return (clipPos.x >= 0.0 && clipPos.x <= 1.0 && clipPos.y >= 0.0 && clipPos.y <= 1.0);
}

bool IsInShadowMapSpace(vec3 clipPos)
{
    return (clipPos.x >= 0.0 && clipPos.x <= 1.0 && clipPos.y >= 0.0 && clipPos.y <= 1.0 && clipPos.z >= 0.0 && clipPos.z <= 1.0);
}

bool IsShadowing(vec3 pos, sampler2D shadow_object)
{
    if (IsInShadowMapSpace(pos))
        return (pos.z >= texture(shadow_object, pos.xy).r + SHADOW_BIAS_DIRECTIONAL);

    return false;
}

float PCF(vec3 lightClipPos, vec2 radiusUV, sampler2D shadow_object)
{
    float sum = 0.0;
    float pcf_count = 0.0;
    vec2 stepUV = radiusUV / PCF_FILTER_STEP_COUNT;
    for (float x = -PCF_FILTER_STEP_COUNT; x <= PCF_FILTER_STEP_COUNT; ++x)
	{
		for (float y = -PCF_FILTER_STEP_COUNT; y <= PCF_FILTER_STEP_COUNT; ++y)
		{
            vec2 offset = vec2(x, y) * stepUV;
            vec3 depthPos = lightClipPos + vec3(offset, 0.0);
            if (IsShadowing(depthPos, shadow_object))
                ++pcf_count;
        }
    }

    return 1.0 - (pcf_count / PCF_COUNT);
}

vec2 SearchRegionRadiusUV(float zEye, float zLightNear, vec2 texelSize)         // Z Shadow Camera Space
{
    return SEARCH_RADIUS_DIRECTIONAL * texelSize * ((zEye - zLightNear) / zEye);
}

vec2 PenumbraRadiusUV(float zReceiver, float zBlocker, vec2 texelSize)
{
    return SEARCH_RADIUS_DIRECTIONAL * texelSize * ((zReceiver - zBlocker) / zBlocker);
}

void FindBlocker(out float accumBlockerDepth, out float numBlockers, vec3 lightClipPos, vec2 searchRegionRadiusUV, sampler2D shadow_object)
{
    vec2 stepUV = searchRegionRadiusUV / BLOCKER_SEARCH_STEP_COUNT;
	for(float x = -BLOCKER_SEARCH_STEP_COUNT; x <= BLOCKER_SEARCH_STEP_COUNT; ++x)
    {
		for(float y = -BLOCKER_SEARCH_STEP_COUNT; y <= BLOCKER_SEARCH_STEP_COUNT; ++y)
        {
            vec2 offset = vec2(x, y) * stepUV;
            vec3 depthPos = lightClipPos + vec3(offset, 0.0);
            if (IsInShadowMapSpace(depthPos))
            {
                float shadowMapDepth = texture(shadow_object, depthPos.xy).r;
                if (lightClipPos.z >= shadowMapDepth + SHADOW_BIAS_DIRECTIONAL)
                {
                    accumBlockerDepth += shadowMapDepth;
                    ++numBlockers;
                }
            }
        }
    }
}

float PCSS(vec3 lightClipPos, float shadowCameraDepth, sampler2D shadow_object, float zLightNear, vec2 texelSize)
{
    if (!IsInShadowMapSpace(lightClipPos))
        return 1.0;

    // 1. Blocker Search
    float accumBlockerDepth = 0.0;
    float numBlockers = 0.0;
    vec2 searchRegionRadiusUV = SearchRegionRadiusUV(shadowCameraDepth, zLightNear, texelSize);
    FindBlocker(accumBlockerDepth, numBlockers, lightClipPos, searchRegionRadiusUV, shadow_object);

    // early out
    if (numBlockers == 0.0)
        return 1.0;
    else if (numBlockers >= BLOCKER_SEARCH_COUNT)
        return 0.0;

    // 2. Penumbra size
    float avgBlockerDepth = accumBlockerDepth / numBlockers;
    vec2 penumbraRadiusUV = PenumbraRadiusUV(lightClipPos.z, avgBlockerDepth, texelSize);

    penumbraRadiusUV = min(searchRegionRadiusUV, penumbraRadiusUV);     // to avoid artifacts of too much penumbra radius

    // 3. PCF Filtering
    return PCF(lightClipPos, penumbraRadiusUV, shadow_object);
}

///////////////////////////////////////////////////////////////////////////////////////////
// PointLight Shadow
#define SHADOW_BIAS_OMNIDIRECTIONAL 0.9
#define SEARCH_RADIUS_OMNIDIRECTIONAL 0.05
bool IsShadowing(vec3 pos, vec3 lightPos, sampler2DArray tex_object)
{
    vec3 lightDir = pos - lightPos;
    float dist = dot(lightDir, lightDir) * SHADOW_BIAS_OMNIDIRECTIONAL;

    TexArrayUV result = convert_xyz_to_texarray_uv(normalize(lightDir));
    return (texture(tex_object, vec3(result.u, result.v, result.index)).r <= dist);
}

float PCF_OmniDirectional(TexArrayUV result, float dist, vec2 radius, sampler2DArray tex_object)
{
    float sum = 0.0;
    float pcf_count = 0.0;
    float distSquare = dist * dist;
    vec2 step = radius / PCF_FILTER_STEP_COUNT;
    for (float x = -PCF_FILTER_STEP_COUNT; x <= PCF_FILTER_STEP_COUNT; ++x)
	{
		for (float y = -PCF_FILTER_STEP_COUNT; y <= PCF_FILTER_STEP_COUNT; ++y)
		{
            vec2 offset = vec2(x, y) * step;

            TexArrayUV temp = result;
            temp.u += offset.x;
            temp.v += offset.y;
            temp = MakeTexArrayUV(temp);
            temp = MakeTexArrayUV(temp);

            if (!IsInShadowMapSpace(vec2(temp.u, temp.v)))
                continue;

            if (texture(tex_object, vec3(temp.u, temp.v, temp.index)).r <= distSquare)
                ++pcf_count;
        }
    }

    return 1.0 - (pcf_count / PCF_COUNT);
}

float PCF_OmniDirectionalOrigin(TexArrayUV result, float dist, vec2 pcfSize, vec2 texelSize, sampler2DArray shadow_object_array)
{
    float sumOfWeight = 0.0;
    float weight = 1.0 / (pcfSize.x * pcfSize.y);

    float filterStart = -(pcfSize.x / 2.0 - 0.5);
    float filterEnd = (pcfSize.x / 2.0 - 0.5);

    float filterStart2 = -(pcfSize.y / 2.0 - 0.5);
    float filterEnd2 = (pcfSize.y / 2.0 - 0.5);

    for(float i=filterStart;i<=filterEnd;i += 1.0)
    {
      for(float j=filterStart2;j<=filterEnd2;j += 1.0)
      {
        float xOffset = texelSize.x * j;
        float yOffset = texelSize.y * i;

        TexArrayUV temp = result;
        temp.u += xOffset;
        temp.v += yOffset;
        temp = MakeTexArrayUV(temp);

        if ((temp.u > 1.0) || (temp.u < 0.0) || (temp.v < 0.0) || (temp.v > 1.0))
            continue;

        if (texture(shadow_object_array, vec3(temp.u, temp.v, temp.index)).r > dist)
            sumOfWeight += weight;
      }
    }

    return sumOfWeight;
}

float PCF_OmniDirectionalOrigin(vec3 pos, vec3 lightPos, vec2 pcfSize, vec2 texelSize, sampler2DArray shadow_object_array)
{
    float depthBias = 0.98;
    vec3 lightDir = pos - lightPos;
    float dist = dot(lightDir, lightDir) * depthBias;

    TexArrayUV result = convert_xyz_to_texarray_uv(normalize(lightDir));
    return PCF_OmniDirectionalOrigin(result, dist, pcfSize, texelSize, shadow_object_array);
}

float PCF_OmniDirectional(vec3 pos, vec3 lightPos, vec2 radius, vec2 texelSize, sampler2DArray shadow_object_array)
{
    vec3 lightDir = pos - lightPos;
    float dist = dot(lightDir, lightDir) * SHADOW_BIAS_OMNIDIRECTIONAL;

    TexArrayUV coord = convert_xyz_to_texarray_uv(normalize(lightDir));

    return PCF_OmniDirectional(coord, dist, radius, shadow_object_array);
}

void FindBlocker_OmniDirectional(out float accumBlockerDepth, out float numBlockers, TexArrayUV pos, float dist, vec2 searchRegionRadius, sampler2DArray shadow_object_array)
{
    vec2 stepUV = searchRegionRadius / BLOCKER_SEARCH_STEP_COUNT;
    float distSqure = dist * dist;
	for(float x = -BLOCKER_SEARCH_STEP_COUNT; x <= BLOCKER_SEARCH_STEP_COUNT; ++x)
    {
		for(float y = -BLOCKER_SEARCH_STEP_COUNT; y <= BLOCKER_SEARCH_STEP_COUNT; ++y)
        {
            vec2 offset = vec2(x, y) * stepUV;
            TexArrayUV temp;
            temp.u = pos.u + offset.x;
            temp.v = pos.v + offset.y;
            temp.index = pos.index;
            temp = MakeTexArrayUV(temp);
            temp = MakeTexArrayUV(temp);

            if (!IsInShadowMapSpace(vec2(temp.u, temp.v)))
                continue;

            float shadowValue = texture(shadow_object_array, vec3(temp.u, temp.v, temp.index)).r;
            if (shadowValue <= distSqure)
            {
                accumBlockerDepth += sqrt(shadowValue);
                ++numBlockers;
            }
        }
    }
}

vec2 SearchRegionRadius_OmniDirectional(float zEye, float zLightNear)         // Z Shadow Camera Space
{
    return SEARCH_RADIUS_OMNIDIRECTIONAL * vec2(1.0, 1.0) * ((zEye - zLightNear) / zEye);
}

vec2 PenumbraRadius_OmniDirectional(float zReceiver, float zBlocker)
{
    return SEARCH_RADIUS_OMNIDIRECTIONAL * vec2(1.0, 1.0) * ((zReceiver - zBlocker) / zBlocker);
}

float PCSS_OmniDirectional(vec3 pos, vec3 lightPos, float zLightNear, vec2 texelSize, sampler2DArray shadow_object_array)
{
    vec3 lightDir = pos - lightPos;
    float dist = sqrt(dot(lightDir, lightDir) - zLightNear) * SHADOW_BIAS_OMNIDIRECTIONAL;
    TexArrayUV result = convert_xyz_to_texarray_uv(normalize(lightDir));

    // 1. Blocker Search
    float accumBlockerDepth = 0.0;
    float numBlockers = 0.0;
    vec2 searchRegionRadius = SearchRegionRadius_OmniDirectional(dist, zLightNear);
    FindBlocker_OmniDirectional(accumBlockerDepth, numBlockers, result, dist, searchRegionRadius, shadow_object_array);

    if (numBlockers == 0.0)
        return 1.0;
    else if (numBlockers >= BLOCKER_SEARCH_COUNT)
        return 0.0;

    // 2. Penumbra size
    float avgBlockerDepthWorld = accumBlockerDepth / numBlockers;
    vec2 penumbraRadius = PenumbraRadius_OmniDirectional(dist, avgBlockerDepthWorld);
    penumbraRadius = min(searchRegionRadius, penumbraRadius);     // to avoid artifacts of too much penumbra radius

    // // 3. Filtering
    return PCF_OmniDirectional(result, dist, penumbraRadius, shadow_object_array);
}
