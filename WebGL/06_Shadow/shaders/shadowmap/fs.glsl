#version 300 es

#include "common.glsl"

precision highp float;
precision highp sampler2DArray;

#define MAX_NUM_OF_DIRECTIONAL_LIGHT 1
#define MAX_NUM_OF_POINT_LIGHT 3
#define MAX_NUM_OF_SPOT_LIGHT 3

uniform int UseAmbientLight;
uniform int NumOfDirectionalLight;
uniform int NumOfPointLight;
uniform int NumOfSpotLight;

uniform jAmbientLight AmbientLight;
uniform jDirectionalLight DirectionalLight[MAX_NUM_OF_DIRECTIONAL_LIGHT];
uniform jPointLight PointLight[MAX_NUM_OF_POINT_LIGHT];
uniform jSpotLight SpotLight[MAX_NUM_OF_SPOT_LIGHT];

uniform vec3 Eye;
uniform int Collided;
//uniform samplerCube tex_object;
uniform sampler2DArray tex_object;
uniform sampler2D shadow_object;
uniform vec2 ShadowMapSize;
uniform float PCF_Size_Directional;
uniform float PCF_Size_OmniDirectional;
uniform float LightZFar;
uniform float LightZNear;
uniform float PointLightZFar;
uniform float PointLightZNear;
uniform float SpotLightZFar;
uniform float SpotLightZNear;
uniform mat4 ShadowVP;
uniform mat4 ShadowV;

in vec3 ShadowPos_;
in vec3 ShadowCameraPos_;
in vec3 Pos_;
in vec4 Color_;
in vec3 Normal_;

out vec4 color;

bool isShadowing(vec3 pos)
{
    const float shadowBias = 0.01;
    if (pos.x >= 0.0 && pos.x <= 1.0 && pos.y >= 0.0 && pos.y <= 1.0 && pos.z >= 0.0 && pos.z <= 1.0)
        return (pos.z >= texture(shadow_object, pos.xy).r + shadowBias);

    return false;
}

float isShadowingPCF(vec3 pos)
{
    float result = 0.0;
    float weight = 1.0 / (PCF_Size_Directional * PCF_Size_Directional);

    float filterStart = -(PCF_Size_Directional / 2.0 - 0.5);
    float filterEnd = (PCF_Size_Directional / 2.0 - 0.5);

    for(float i=filterStart;i<=filterEnd;i += 1.0)
    {
      for(float j=filterStart;j<=filterEnd;j += 1.0)
      {
        float xOffset = ShadowMapSize.x * j;
        float yOffset = ShadowMapSize.y * i;

        vec3 currentPos =  pos + vec3(xOffset, yOffset, 0.0);
        if (!isShadowing(currentPos))
            result += weight;
      }
    }

    return result;
}



#define BLOCKER_SEARCH_STEP_COUNT 3.0
#define PCF_FILTER_STEP_COUNT 7.0
#define BLOCKER_SEARCH_DIM (BLOCKER_SEARCH_STEP_COUNT * 2.0 + 1.0)
#define BLOCKER_SEARCH_COUNT (BLOCKER_SEARCH_DIM * BLOCKER_SEARCH_DIM)
#define PCF_DIM (PCF_FILTER_STEP_COUNT * 2.0 + 1.0)
#define PCF_COUNT (PCF_DIM * PCF_DIM)

#define SHADOW_BIAS 0.02

#define SEARCH_RADIUS 5.0
#define LIGHTZNEAR (LightZNear)
//#define TMP vec2(1.0/130.0, 1.0/130.0)
#define TMP vec2(ShadowMapSize.x, ShadowMapSize.y)

vec2 SearchRegionRadiusUV(float zShadowCS)         // Z Shadow Camera Space
{
    return SEARCH_RADIUS * TMP * ((zShadowCS - LIGHTZNEAR) / zShadowCS);
}

vec2 PenumbraRadiusUV(float zReceiver, float zBlocker)
{
    return SEARCH_RADIUS * TMP * ((zReceiver - zBlocker) / zBlocker);
}

vec2 ProjectToLightUV(vec2 sizeUV, float zShadowCS)
{
    return sizeUV * (LIGHTZNEAR / zShadowCS);
}

float ReverseNDC(float z)       // from 0.0 ~ 1.0 to zNear ~ zFar
{
    return LIGHTZNEAR * LightZFar / (LightZFar - z * (LightZFar - LIGHTZNEAR));
}

void FindBlocker(out float accumBlockerDepth, out float numBlockers, vec3 pos, vec2 searchRegionRadiusUV)
{
    vec2 stepUV = searchRegionRadiusUV / BLOCKER_SEARCH_STEP_COUNT;
    //float stepUV = LIGHT_SIZE_UV * ( pos.z - NEAR_PLANE ) / pos.z;
	for(float x = -BLOCKER_SEARCH_STEP_COUNT; x <= BLOCKER_SEARCH_STEP_COUNT; ++x)
    {
		for(float y = -BLOCKER_SEARCH_STEP_COUNT; y <= BLOCKER_SEARCH_STEP_COUNT; ++y)
        {
            vec2 offset = vec2(x, y) * stepUV;
            vec3 depthPos = pos + vec3(offset, 0.0);
            if (depthPos.x >= 0.0 && depthPos.x <= 1.0 && depthPos.y >= 0.0 && depthPos.y <= 1.0 && depthPos.z >= 0.0 && depthPos.z <= 1.0)
            {
                float shadowMapDepth = texture(shadow_object, depthPos.xy).r;
                if (pos.z >= shadowMapDepth + SHADOW_BIAS)
                {
                    accumBlockerDepth += shadowMapDepth;
                    ++numBlockers;
                }
            }
        }
    }
}

float isShadowingPCSS(vec3 pos, float shadowCameraDepth)
{
    bool isInShadowMap = (pos.x >= 0.0 && pos.x <= 1.0 && pos.y >= 0.0 && pos.y <= 1.0 && pos.z >= 0.0 && pos.z <= 1.0);
    if (!isInShadowMap)
        return 1.0;

    float temp = shadowCameraDepth;
    // 1. Blocker Search
    float accumBlockerDepth = 0.0;
    float numBlockers = 0.0;
    vec2 searchRegionRadiusUV = SearchRegionRadiusUV(shadowCameraDepth);

    FindBlocker(accumBlockerDepth, numBlockers, pos, searchRegionRadiusUV);

    if (numBlockers == 0.0)
        return 1.0;
    else if (numBlockers >= BLOCKER_SEARCH_COUNT)
        return 0.0;

    // 2. Penumbra size
    float avgBlockerDepth = accumBlockerDepth / numBlockers;
    vec2 penumbraRadiusUV = PenumbraRadiusUV(pos.z, avgBlockerDepth);
    //penumbraRadiusUV.x = 0.5;
    //penumbraRadiusUV.y = 0.5;

    // if (pos.z < 0.5)
    //     return -1.0;

    // if (avgBlockerDepth < 0.15)
    //     return -1.0;

    // if (penumbraRadiusUV.x < 0.01)
    //     return -1.0;
    penumbraRadiusUV = min(searchRegionRadiusUV, penumbraRadiusUV);

    // // 3. Filtering
    float sum = 0.0;
    float pcf_count = 0.0;
    vec2 stepUV = penumbraRadiusUV / PCF_FILTER_STEP_COUNT;
    for (float x = -PCF_FILTER_STEP_COUNT; x <= PCF_FILTER_STEP_COUNT; ++x)
	{
		for (float y = -PCF_FILTER_STEP_COUNT; y <= PCF_FILTER_STEP_COUNT; ++y)
		{
            vec2 offset = vec2(x, y) * stepUV;
            vec3 depthPos = pos + vec3(offset, 0.0);
            if (depthPos.x >= 0.0 && depthPos.x <= 1.0 && depthPos.y >= 0.0 && depthPos.y <= 1.0 && depthPos.z >= 0.0 && depthPos.z <= 1.0)
            {
                float shadowMapDepth = texture(shadow_object, depthPos.xy).r;
                if (pos.z >= shadowMapDepth + SHADOW_BIAS)
                    pcf_count++;
            }
        }
    }

    return 1.0 - (pcf_count / PCF_COUNT);
}

bool isShadowing(vec3 pos, vec3 lightPos)
{
    float depthBias = 0.98;
    vec3 lightDir = pos - lightPos;
    float dist = dot(lightDir, lightDir) * depthBias;

    TexArrayUV result = convert_xyz_to_texarray_uv(normalize(lightDir));
    return (texture(tex_object, vec3(result.u, result.v, result.index)).r <= dist);
}

float isShadowingPCF(vec3 pos, vec3 lightPos)
{
    float depthBias = 0.98;
    vec3 lightDir = pos - lightPos;
    float dist = dot(lightDir, lightDir) * depthBias;

    TexArrayUV result = convert_xyz_to_texarray_uv(normalize(lightDir));

    float sumOfWeight = 0.0;
    float weight = 1.0 / (PCF_Size_OmniDirectional * PCF_Size_OmniDirectional);

    float filterStart = -(PCF_Size_OmniDirectional / 2.0 - 0.5);
    float filterEnd = (PCF_Size_OmniDirectional / 2.0 - 0.5);

    for(float i=filterStart;i<=filterEnd;i += 1.0)
    {
      for(float j=filterStart;j<=filterEnd;j += 1.0)
      {
        float xOffset = ShadowMapSize.x * j;
        float yOffset = ShadowMapSize.y * i;

        TexArrayUV temp = result;
        temp.u += xOffset;
        temp.v += yOffset;
        temp = MakeTexArrayUV(temp);

        if ((temp.u > 1.0) || (temp.u < 0.0) || (temp.v < 0.0) || (temp.v > 1.0))
            continue;

        if (texture(tex_object, vec3(temp.u, temp.v, temp.index)).r > dist)
            sumOfWeight += weight;
      }
    }

    return sumOfWeight;
}

void FindBlocker2(out float accumBlockerDepth, out float numBlockers, TexArrayUV pos, float dist, vec2 searchRegionRadiusUV)
{
    vec2 stepUV = searchRegionRadiusUV / BLOCKER_SEARCH_STEP_COUNT;
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

            if ((temp.u > 1.0) || (temp.u < 0.0) || (temp.v < 0.0) || (temp.v > 1.0))
                continue;

            float shadowValue = sqrt(texture(tex_object, vec3(temp.u, temp.v, temp.index)).r);
            if (shadowValue < dist)
            {
                accumBlockerDepth += shadowValue;
                ++numBlockers;
            }
        }
    }
}

#define SEARCH_RADIUS2 100.0

vec2 SearchRegionRadiusUV2(float zShadowCS)         // Z Shadow Camera Space
{
    return SEARCH_RADIUS2 * vec2(ShadowMapSize.x, ShadowMapSize.y) * ((zShadowCS - PointLightZNear) / zShadowCS);
}

vec2 PenumbraRadiusUV2(float zReceiver, float zBlocker)
{
    return SEARCH_RADIUS2 * 2.0 * vec2(ShadowMapSize.x, ShadowMapSize.y) * ((zReceiver - zBlocker) / zBlocker);
}

vec2 ProjectToLightUV2(vec2 sizeUV, float zShadowCS)
{
    return sizeUV * (PointLightZNear / zShadowCS);
}

float ReverseNDC2(float z)       // from 0.0 ~ 1.0 to zNear ~ zFar
{
    return PointLightZNear * PointLightZFar / (PointLightZFar - z * (PointLightZFar - PointLightZNear));
}

float isShadowingPCSS2(vec3 pos, vec3 lightPos)
{
    float depthBias = 0.98;
    vec3 lightDir = pos - lightPos;
    float dist = sqrt(dot(lightDir, lightDir)) * depthBias;
    TexArrayUV result = convert_xyz_to_texarray_uv(normalize(lightDir));

    float temp = dist;

    if (temp > PointLightZFar)
        return 0.0;

    // 1. Blocker Search
    float accumBlockerDepth = 0.0;
    float numBlockers = 0.0;
    vec2 searchRegionRadiusUV = SearchRegionRadiusUV2(temp);

    // if (searchRegionRadiusUV.x >= 0.0 && searchRegionRadiusUV.x <= 1.0)
    //     return -1.0;

    FindBlocker2(accumBlockerDepth, numBlockers, result, dist, searchRegionRadiusUV);

    if (numBlockers == 0.0)
        return 1.0;
    else if (numBlockers >= BLOCKER_SEARCH_COUNT)
        return 0.0;

    // 2. Penumbra size
    float avgBlockerDepthWorld = accumBlockerDepth / numBlockers;
    // if (avgBlockerDepthWorld < 80.0)
    //     return -1.0;
    //float avgBlockerDepthWorld = ReverseNDC2(avgBlockerDepth);
    vec2 penumbraRadiusUV = PenumbraRadiusUV2(temp, avgBlockerDepthWorld);
    vec2 filterRadiusUV = ProjectToLightUV2(penumbraRadiusUV, temp);

    //if (0.000001 > filterRadiusUV.x && filterRadiusUV.x >= 0.0)
    //    return -1.0;

 //filterRadiusUV = vec2(ShadowMapSize.x, ShadowMapSize.y) * 10.0;

    // // 3. Filtering
    float sum = 0.0;
    float pcf_count = 0.0;
    vec2 stepUV = filterRadiusUV / PCF_FILTER_STEP_COUNT;
    for (float x = -PCF_FILTER_STEP_COUNT; x <= PCF_FILTER_STEP_COUNT; ++x)
	{
		for (float y = -PCF_FILTER_STEP_COUNT; y <= PCF_FILTER_STEP_COUNT; ++y)
		{
            vec2 offset = vec2(x, y) * stepUV;
            TexArrayUV temp;
            temp.u = result.u + offset.x;
            temp.v = result.v + offset.y;
            temp.index = result.index;
            temp = MakeTexArrayUV(temp);

            if ((temp.u > 1.0) || (temp.u < 0.0) || (temp.v < 0.0) || (temp.v > 1.0))
                continue;

            float shadowValue = sqrt(texture(tex_object, vec3(temp.u, temp.v, temp.index)).r);
            if (shadowValue > dist)
            {
                pcf_count++;
            }
        }
    }

    return pcf_count / PCF_COUNT;
}

#define SEARCH_RADIUS3 100.0

vec2 SearchRegionRadiusUV3(float zShadowCS)         // Z Shadow Camera Space
{
    return SEARCH_RADIUS3 * vec2(ShadowMapSize.x, ShadowMapSize.y) * ((zShadowCS - SpotLightZNear) / zShadowCS);
}

vec2 PenumbraRadiusUV3(float zReceiver, float zBlocker)
{
    return SEARCH_RADIUS3 * 2.0 * vec2(ShadowMapSize.x, ShadowMapSize.y) * ((zReceiver - zBlocker) / zBlocker);
}

vec2 ProjectToLightUV3(vec2 sizeUV, float zShadowCS)
{
    return sizeUV * (SpotLightZNear / zShadowCS);
}

float ReverseNDC3(float z)       // from 0.0 ~ 1.0 to zNear ~ zFar
{
    return SpotLightZNear * SpotLightZFar / (SpotLightZFar - z * (SpotLightZFar - SpotLightZNear));
}

float isShadowingPCSS3(vec3 pos, vec3 lightPos)
{
    float depthBias = 0.98;
    vec3 lightDir = pos - lightPos;
    float dist = sqrt(dot(lightDir, lightDir)) * depthBias;
    TexArrayUV result = convert_xyz_to_texarray_uv(normalize(lightDir));

    float temp = dist;

    if (temp > SpotLightZFar)
        return 0.0;

    // 1. Blocker Search
    float accumBlockerDepth = 0.0;
    float numBlockers = 0.0;
    vec2 searchRegionRadiusUV = SearchRegionRadiusUV3(temp);

    // if (searchRegionRadiusUV.x >= 0.0 && searchRegionRadiusUV.x <= 1.0)
    //     return -1.0;

    FindBlocker2(accumBlockerDepth, numBlockers, result, dist, searchRegionRadiusUV);

    if (numBlockers == 0.0)
        return 1.0;
    else if (numBlockers >= BLOCKER_SEARCH_COUNT)
        return 0.0;

    // 2. Penumbra size
    float avgBlockerDepthWorld = accumBlockerDepth / numBlockers;
    // if (avgBlockerDepthWorld < 80.0)
    //     return -1.0;
    //float avgBlockerDepthWorld = ReverseNDC3(avgBlockerDepth);
    vec2 penumbraRadiusUV = PenumbraRadiusUV3(temp, avgBlockerDepthWorld);
    vec2 filterRadiusUV = ProjectToLightUV3(penumbraRadiusUV, temp);

    //if (0.000001 > filterRadiusUV.x && filterRadiusUV.x >= 0.0)
    //    return -1.0;

 //filterRadiusUV = vec2(ShadowMapSize.x, ShadowMapSize.y) * 10.0;

    // // 3. Filtering
    float sum = 0.0;
    float pcf_count = 0.0;
    vec2 stepUV = filterRadiusUV / PCF_FILTER_STEP_COUNT;
    for (float x = -PCF_FILTER_STEP_COUNT; x <= PCF_FILTER_STEP_COUNT; ++x)
	{
		for (float y = -PCF_FILTER_STEP_COUNT; y <= PCF_FILTER_STEP_COUNT; ++y)
		{
            vec2 offset = vec2(x, y) * stepUV;
            TexArrayUV temp;
            temp.u = result.u + offset.x;
            temp.v = result.v + offset.y;
            temp.index = result.index;
            temp = MakeTexArrayUV(temp);

            if ((temp.u > 1.0) || (temp.u < 0.0) || (temp.v < 0.0) || (temp.v > 1.0))
                continue;

            float shadowValue = sqrt(texture(tex_object, vec3(temp.u, temp.v, temp.index)).r);
            if (shadowValue > dist)
            {
                pcf_count++;
            }
        }
    }

    return pcf_count / PCF_COUNT;
}

void main()
{
    vec3 normal = normalize(Normal_);
    vec3 viewDir = normalize(Eye - Pos_);

    vec4 shadowPos = (ShadowVP * vec4(Pos_, 1.0));
    shadowPos /= shadowPos.w;
    vec3 ShadowPos = shadowPos.xyz * 0.5 + 0.5;        // Transform NDC space coordinate from [-1.0 ~ 1.0] into [0.0 ~ 1.0].

    // mat4 ttt = mat4(-1.0, 0.0, 0.0, 0.0
    //             , 0.0, 0.0, 1.0, 0.0
    //             , 0.0, 1.0, 0.0, -90.0
    //             , 0.0, 0.0, 0.0, 1.0);
    // ttt = transpose(ttt);
    //vec4 shadowCameraPos = (ttt * vec4(0.0, 90.0, 0.0, 1.0));    
    
    //vec4 shadowCameraPos = (ShadowV * vec4(0.0, 90.0, 0.0, 1.0));    
    vec4 shadowCameraPos = (ShadowV * vec4(Pos_, 1.0));    

    vec3 diffuse = Color_.xyz;
    if (Collided != 0)
        diffuse = vec3(1.0, 1.0, 1.0);

    bool shadow = false;
    vec3 finalColor = vec3(0.0, 0.0, 0.0);

    if (UseAmbientLight != 0)
        finalColor += GetAmbientLight(AmbientLight);

    const bool pcf = true;

    for(int i=0;i<MAX_NUM_OF_DIRECTIONAL_LIGHT;++i)
    {
        if (i >= NumOfDirectionalLight)
            break;
        
        if (pcf)
        {
            float depth = -shadowCameraPos.z;
            //if (depth >= 0.0 && depth <= 90.0)
            {
                //float shadowRate = isShadowingPCF(ShadowPos_);
                float shadowRate = isShadowingPCSS(ShadowPos, depth);
                if (shadowRate > 0.0)
                    finalColor += GetDirectionalLight(DirectionalLight[i], normal, viewDir) * shadowRate;
                if (shadowRate == -1.0)
                    finalColor.y += 1.0;
                //finalColor.xyz = -ShadowCameraPos_.zzz / LightZFar;
            }
        }
        else
        {
            if (!isShadowing(ShadowPos))
                finalColor += GetDirectionalLight(DirectionalLight[i], normal, viewDir);
        }
    }

    // for(int i=0;i<MAX_NUM_OF_POINT_LIGHT;++i)
    // {
    //     if (i >= NumOfPointLight)
    //         break;
        
    //     if (pcf)
    //     {
    //         //float shadowRate = isShadowingPCF(Pos_, PointLight[i].LightPos);
    //         float shadowRate = isShadowingPCSS2(Pos_, PointLight[i].LightPos);
    //         if (shadowRate > 0.0)
    //             finalColor += GetPointLight(PointLight[i], normal, Pos_, viewDir) * shadowRate;
    //         if (shadowRate == -1.0)
    //             finalColor.x += 1.0;
    //     }
    //     else
    //     {
    //         if (!isShadowing(Pos_, PointLight[i].LightPos))
    //             finalColor += GetPointLight(PointLight[i], normal, Pos_, viewDir);
    //     }
    // }
    
    // for(int i=0;i<MAX_NUM_OF_SPOT_LIGHT;++i)
    // {
    //     if (i >= NumOfSpotLight)
    //         break;

    //     if (pcf)
    //     {
    //         //float shadowRate = isShadowingPCF(Pos_, SpotLight[i].LightPos);
    //         float shadowRate = isShadowingPCSS3(Pos_, SpotLight[i].LightPos);
    //         if (shadowRate > 0.0)
    //             finalColor += GetSpotLight(SpotLight[i], normal, Pos_, viewDir) * shadowRate;
    //     }
    //     else
    //     {
    //         if (!isShadowing(Pos_, SpotLight[i].LightPos))
    //             finalColor += GetSpotLight(SpotLight[i], normal, Pos_, viewDir);
    //     }
    // }

    color = vec4(finalColor * diffuse, Color_.w);
}