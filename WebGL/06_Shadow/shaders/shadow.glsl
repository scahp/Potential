#include "common.glsl"

precision mediump float;

//////////////////////////////////////////////////////////////////////
// Poisson Sample

#if defined(USE_POISSON_SAMPLE)

#define NUM_SAMPLES 17
#define NUM_RINGS 11
#define BLOCKER_SEARCH_NUM_SAMPLES NUM_SAMPLES
#define PCF_NUM_SAMPLES NUM_SAMPLES
#define PI2 (3.14 * 2.0)

vec2 poissonDisk[NUM_SAMPLES];

// https://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
float Rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

// https://threejs.org/examples/webgl_shadowmap_pcss.html
void InitPoissonSamples( const in vec2 randomSeed ) {
    float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( NUM_SAMPLES );
    float INV_NUM_SAMPLES = 1.0 / float( NUM_SAMPLES );

    // jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/
    float angle = Rand( randomSeed ) * PI2;
    float radius = INV_NUM_SAMPLES;
    float radiusStep = radius;

    for( int i = 0; i < NUM_SAMPLES; i ++ ) {
        poissonDisk[i] = vec2( cos( angle ), sin( angle ) ) * pow( radius, 0.75 );
        radius += radiusStep;
        angle += ANGLE_STEP;
    }
}

#endif // USE_POISSON_SAMPLE

//////////////////////////////////////////////////////////////////////
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

vec2 SearchRegionRadiusUV(float zEye, float zLightNear, vec2 texelSize)         // Z Shadow Camera Space
{
    return SEARCH_RADIUS_DIRECTIONAL * texelSize * ((zEye - zLightNear) / zEye);
}

vec2 PenumbraRadiusUV(float zReceiver, float zBlocker, vec2 texelSize)
{
    return SEARCH_RADIUS_DIRECTIONAL * texelSize * ((zReceiver - zBlocker) / zBlocker);
}

#if defined(USE_POISSON_SAMPLE)

#if defined(USE_PCF) || defined(USE_PCSS)
float PCF_PoissonSample(vec3 lightClipPos, vec2 radiusUV, sampler2D shadow_object)
{
    float sum = 0.0;
    for(int i = 0; i < PCF_NUM_SAMPLES;++i) 
    {
        vec2 offset = poissonDisk[ i ] * radiusUV;
        vec3 depthPos = lightClipPos + vec3(offset, 0.0);
        // if (!IsShadowing(depthPos, shadow_object))
        //     ++sum;
        sum += float(!IsShadowing(depthPos, shadow_object));
    }
    for(int i = 0; i < PCF_NUM_SAMPLES;++i) 
    {
        vec2 offset = -poissonDisk[ i ].yx * radiusUV;
        vec3 depthPos = lightClipPos + vec3(offset, 0.0);
        // if (!IsShadowing(depthPos, shadow_object))
        //     ++sum;
        sum += float(!IsShadowing(depthPos, shadow_object));
    }
    return sum / ( 2.0 * float( PCF_NUM_SAMPLES ) );
}
#endif  // USE_PCF || USE_PCSS

#if defined(USE_PCSS)
void FindBlocker_PoissonSample(out float accumBlockerDepth, out float numBlockers, vec3 lightClipPos, vec2 searchRegionRadiusUV, sampler2D shadow_object)
{
    for(int i = 0; i < BLOCKER_SEARCH_NUM_SAMPLES; ++i) 
    {
        vec2 offset = poissonDisk[ i ] * searchRegionRadiusUV;
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

float PCSS_PoissonSample(vec3 lightClipPos, float shadowCameraDepth, sampler2D shadow_object, float zLightNear, vec2 texelSize)
{
    if (!IsInShadowMapSpace(lightClipPos))
        return 1.0;

    // 1. Blocker Search
    float accumBlockerDepth = 0.0;
    float numBlockers = 0.0;
    vec2 searchRegionRadiusUV = SearchRegionRadiusUV(shadowCameraDepth, zLightNear, texelSize);
    FindBlocker_PoissonSample(accumBlockerDepth, numBlockers, lightClipPos, searchRegionRadiusUV, shadow_object);

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
    return PCF_PoissonSample(lightClipPos, penumbraRadiusUV, shadow_object);
}
#endif // USE_PCSS

#else   // USE_POISSON_SAMPLE

#if defined(USE_PCF) || defined(USE_PCSS)
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
            // if (IsShadowing(depthPos, shadow_object))
            //     ++pcf_count;
            pcf_count += float(IsShadowing(depthPos, shadow_object));

        }
    }

    return 1.0 - (pcf_count / PCF_COUNT);
}
#endif  // USE_PCSS || USE_PCSS

#if defined(USE_PCSS)
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
#endif // USE_PCSS

#endif  // USE_POISSON_SAMPLE


///////////////////////////////////////////////////////////////////////////////////////////
// PointLight Shadow
#define SHADOW_BIAS_OMNIDIRECTIONAL 0.9
#define SEARCH_RADIUS_OMNIDIRECTIONAL 0.05
bool IsShadowing(vec3 pos, vec3 lightPos, sampler2DArray shadow_object_array)
{
    vec3 lightDir = pos - lightPos;
    float dist = dot(lightDir, lightDir) * SHADOW_BIAS_OMNIDIRECTIONAL;

    TexArrayUV result = convert_xyz_to_texarray_uv(normalize(lightDir));
    return (texture(shadow_object_array, vec3(result.u, result.v, result.index)).r <= dist);
}

vec2 SearchRegionRadius_OmniDirectional(float zEye, float zLightNear)         // Z Shadow Camera Space
{
    return SEARCH_RADIUS_OMNIDIRECTIONAL * vec2(1.0, 1.0) * ((zEye - zLightNear) / zEye);
}

vec2 PenumbraRadius_OmniDirectional(float zReceiver, float zBlocker)
{
    return SEARCH_RADIUS_OMNIDIRECTIONAL * vec2(1.0, 1.0) * ((zReceiver - zBlocker) / zBlocker);
}

#if defined(USE_POISSON_SAMPLE)

#if defined(USE_PCF) || defined(USE_PCSS)
float PCF_OmniDirectional_PoissonSample(TexArrayUV result, float distSqured, vec2 radiusUV, sampler2DArray shadow_object_array)
{
    float sum = 0.0;
    for(int i = 0; i < PCF_NUM_SAMPLES;++i) 
    {
        vec2 offset = poissonDisk[ i ] * radiusUV;
        TexArrayUV temp = result;
        temp.u += offset.x;
        temp.v += offset.y;
        temp = MakeTexArrayUV(temp);
        temp = MakeTexArrayUV(temp);

        // if (texture(shadow_object_array, vec3(temp.u, temp.v, temp.index)).r > distSqured)
        //     ++sum;
        sum += float(texture(shadow_object_array, vec3(temp.u, temp.v, temp.index)).r > distSqured);
    }
    for(int i = 0; i < PCF_NUM_SAMPLES;++i) 
    {
        vec2 offset = -poissonDisk[ i ].yx * radiusUV;
        TexArrayUV temp = result;
        temp.u += offset.x;
        temp.v += offset.y;
        temp = MakeTexArrayUV(temp);
        temp = MakeTexArrayUV(temp);

        // if (texture(shadow_object_array, vec3(temp.u, temp.v, temp.index)).r > distSqured)
        //     ++sum;
        sum += float(texture(shadow_object_array, vec3(temp.u, temp.v, temp.index)).r > distSqured);
    }
    return sum / ( 2.0 * float( PCF_NUM_SAMPLES ) );
}
float PCF_OmniDirectional_PoissonSample(vec3 pos, vec3 lightPos, vec2 radiusSquredUV, sampler2DArray shadow_object_array)
{
    vec3 lightDir = pos - lightPos;
    float dist = dot(lightDir, lightDir) * SHADOW_BIAS_OMNIDIRECTIONAL;

    TexArrayUV coord = convert_xyz_to_texarray_uv(normalize(lightDir));

    return PCF_OmniDirectional_PoissonSample(coord, dist, radiusSquredUV, shadow_object_array);
}
#endif  // USE_PCF || USE_PCSS

#if defined(USE_PCSS)
void FindBlocker_OmniDirectional_PoissonSample(out float accumBlockerDepth, out float numBlockers, TexArrayUV pos, float dist, vec2 searchRegionRadius, sampler2DArray shadow_object_array)
{
    float distSqure = dist * dist;
    for(int i = 0; i < BLOCKER_SEARCH_NUM_SAMPLES; ++i) 
    {
        vec2 offset = poissonDisk[ i ] * searchRegionRadius;
        TexArrayUV temp = pos;
        temp.u += offset.x;
        temp.v += offset.y;
        temp = MakeTexArrayUV(temp);
        temp = MakeTexArrayUV(temp);

        // if (!IsInShadowMapSpace(vec2(temp.u, temp.v)))
        //     continue;

        float shadowValue = texture(shadow_object_array, vec3(temp.u, temp.v, temp.index)).r;
        if (shadowValue <= distSqure)
        {
            accumBlockerDepth += sqrt(shadowValue);
            ++numBlockers;
        }
    }
}
float PCSS_OmniDirectional_PoissonSample(vec3 pos, vec3 lightPos, float zLightNear, vec2 texelSize, sampler2DArray shadow_object_array)
{
    vec3 lightDir = pos - lightPos;
    float distSqured = dot(lightDir, lightDir);
    float dist = sqrt(distSqured);
    distSqured *= SHADOW_BIAS_OMNIDIRECTIONAL;
    dist *= SHADOW_BIAS_OMNIDIRECTIONAL;
    TexArrayUV result = convert_xyz_to_texarray_uv(normalize(lightDir));

    // 1. Blocker Search
    float accumBlockerDepth = 0.0;
    float numBlockers = 0.0;
    vec2 searchRegionRadius = SearchRegionRadius_OmniDirectional(dist, zLightNear);
    FindBlocker_OmniDirectional_PoissonSample(accumBlockerDepth, numBlockers, result, dist, searchRegionRadius, shadow_object_array);

    if (numBlockers == 0.0)
        return 1.0;
    else if (numBlockers >= BLOCKER_SEARCH_COUNT)
       return 0.0;

    // 2. Penumbra size
    float avgBlockerDepthWorld = accumBlockerDepth / numBlockers;
    vec2 penumbraRadius = PenumbraRadius_OmniDirectional(dist, avgBlockerDepthWorld);
    penumbraRadius = min(searchRegionRadius, penumbraRadius);     // to avoid artifacts of too much penumbra radius

    // // 3. Filtering
    return PCF_OmniDirectional_PoissonSample(result, distSqured, penumbraRadius, shadow_object_array);
}
#endif // USE_PCSS

#else   // USE_POISSON_SAMPLE

#if defined(USE_PCF) || defined(USE_PCSS)
float PCF_OmniDirectional(TexArrayUV result, float distSqured, vec2 radiusUV, sampler2DArray shadow_object_array)
{
    float sum = 0.0;
    float pcf_count = 0.0;
    vec2 stepUV = radiusUV / PCF_FILTER_STEP_COUNT;
    for (float x = -PCF_FILTER_STEP_COUNT; x <= PCF_FILTER_STEP_COUNT; ++x)
	{
		for (float y = -PCF_FILTER_STEP_COUNT; y <= PCF_FILTER_STEP_COUNT; ++y)
		{
            vec2 offset = vec2(x, y) * stepUV;

            TexArrayUV temp = result;
            temp.u += offset.x;
            temp.v += offset.y;
            temp = MakeTexArrayUV(temp);
            temp = MakeTexArrayUV(temp);

            // if (texture(shadow_object_array, vec3(temp.u, temp.v, temp.index)).r <= distSqured)
            //     ++pcf_count;
            pcf_count += float(texture(shadow_object_array, vec3(temp.u, temp.v, temp.index)).r <= distSqured);
        }
    }

    return 1.0 - (pcf_count / PCF_COUNT);
}

float PCF_OmniDirectional(vec3 pos, vec3 lightPos, vec2 radiusSquredUV, sampler2DArray shadow_object_array)
{
    vec3 lightDir = pos - lightPos;
    float dist = dot(lightDir, lightDir) * SHADOW_BIAS_OMNIDIRECTIONAL;

    TexArrayUV coord = convert_xyz_to_texarray_uv(normalize(lightDir));

    return PCF_OmniDirectional(coord, dist, radiusSquredUV, shadow_object_array);
}
#endif  // USE_PCF || USE_PCSS

#if defined(USE_PCSS)
void FindBlocker_OmniDirectional(out float accumBlockerDepth, out float numBlockers, TexArrayUV pos, float dist, vec2 searchRegionRadius, sampler2DArray shadow_object_array)
{
    vec2 stepUV = searchRegionRadius / BLOCKER_SEARCH_STEP_COUNT;
    float distSqure = dist * dist;
	for(float x = -BLOCKER_SEARCH_STEP_COUNT; x <= BLOCKER_SEARCH_STEP_COUNT; ++x)
    {
		for(float y = -BLOCKER_SEARCH_STEP_COUNT; y <= BLOCKER_SEARCH_STEP_COUNT; ++y)
        {
            vec2 offset = vec2(x, y) * stepUV;
            TexArrayUV temp = pos;
            temp.u += offset.x;
            temp.v += offset.y;
            temp = MakeTexArrayUV(temp);
            temp = MakeTexArrayUV(temp);

            // if (!IsInShadowMapSpace(vec2(temp.u, temp.v)))
            //     continue;

            float shadowValue = texture(shadow_object_array, vec3(temp.u, temp.v, temp.index)).r;
            if (shadowValue <= distSqure)
            {
                accumBlockerDepth += sqrt(shadowValue);
                ++numBlockers;
            }
        }
    }
}
float PCSS_OmniDirectional(vec3 pos, vec3 lightPos, float zLightNear, vec2 texelSize, sampler2DArray shadow_object_array)
{
    vec3 lightDir = pos - lightPos;
    float distSqured = dot(lightDir, lightDir);
    float dist = sqrt(distSqured);
    distSqured *= SHADOW_BIAS_OMNIDIRECTIONAL;
    dist *= SHADOW_BIAS_OMNIDIRECTIONAL;
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
    return PCF_OmniDirectional(result, distSqured, penumbraRadius, shadow_object_array);
}
#endif

#endif  // USE_POISSON_SAMPLE
