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
uniform float PCF_Size;

in vec3 ShadowPos_;
in vec3 Pos_;
in vec4 Color_;
in vec3 Normal_;

out vec4 color;

bool isShadowing(vec3 pos)
{
    const float shadowBias = 0.005;
    if (pos.x >= 0.0 && pos.x <= 1.0 && pos.y >= 0.0 && pos.y <= 1.0 && pos.z >= 0.0 && pos.z <= 1.0)
        return (pos.z >= texture(shadow_object, pos.xy).r + shadowBias);

    return false;
}

float isShadowingPCF(vec3 pos)
{
    float result = 0.0;
    float weight = 1.0 / (PCF_Size * PCF_Size);

    float filterStart = -(PCF_Size / 2.0 - 0.5);
    float filterEnd = (PCF_Size / 2.0 - 0.5);

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

bool isShadowing(vec3 pos, vec3 lightPos)
{
    float depthBias = 0.99;
    vec3 lightDir = pos - lightPos;
    float dist = dot(lightDir, lightDir) * depthBias;

    TexArrayUV result = convert_xyz_to_cube_uv(normalize(lightDir));
    return (texture(tex_object, vec3(result.u, result.v, result.index)).r <= dist);
}

float isShadowingPCF(vec3 pos, vec3 lightPos)
{
    float depthBias = 0.99;
    vec3 lightDir = pos - lightPos;
    float dist = dot(lightDir, lightDir) * depthBias;

    TexArrayUV result = convert_xyz_to_cube_uv(normalize(lightDir));

    float sumOfWeight = 0.0;
    float weight = 1.0 / (PCF_Size * PCF_Size);

    float filterStart = -(PCF_Size / 2.0 - 0.5);
    float filterEnd = (PCF_Size / 2.0 - 0.5);

    for(float i=filterStart;i<=filterEnd;i += 1.0)
    {
      for(float j=filterStart;j<=filterEnd;j += 1.0)
      {
        float xOffset = ShadowMapSize.x * j;
        float yOffset = ShadowMapSize.y * i;

        if (texture(tex_object, vec3(result.u + xOffset, result.v + yOffset, result.index)).r > dist)
            sumOfWeight += weight;
      }
    }

    return sumOfWeight;
}

void main()
{
    vec3 normal = normalize(Normal_);
    vec3 viewDir = normalize(Eye - Pos_);

    vec3 diffuse = Color_.xyz;
    if (Collided != 0)
        diffuse = vec3(1.0, 1.0, 1.0);

    bool shadow = false;
    vec3 finalColor = vec3(0.0, 0.0, 0.0);

    if (UseAmbientLight != 0)
        finalColor += GetAmbientLight(AmbientLight);

    for(int i=0;i<MAX_NUM_OF_DIRECTIONAL_LIGHT;++i)
    {
        if (i >= NumOfDirectionalLight)
            break;
        
        float shadowRate = isShadowingPCF(ShadowPos_);
        if (shadowRate > 0.0)
            finalColor += GetDirectionalLight(DirectionalLight[i], normal, viewDir) * shadowRate;
    }

    for(int i=0;i<MAX_NUM_OF_POINT_LIGHT;++i)
    {
        if (i >= NumOfPointLight)
            break;
        
        float shadowRate = isShadowingPCF(Pos_, PointLight[i].LightPos);
        if (shadowRate > 0.0)
            finalColor += GetPointLight(PointLight[i], normal, Pos_, viewDir) * shadowRate;
    }
    
    for(int i=0;i<MAX_NUM_OF_SPOT_LIGHT;++i)
    {
        if (i >= NumOfSpotLight)
            break;

        float shadowRate = isShadowingPCF(Pos_, SpotLight[i].LightPos);
        if (shadowRate > 0.0)
            finalColor += GetSpotLight(SpotLight[i], normal, Pos_, viewDir) * shadowRate;
    }

    color = vec4(finalColor * diffuse, Color_.w);
}