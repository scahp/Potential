#include "common.glsl"

precision highp float;

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
uniform samplerCube tex_object;
uniform sampler2D shadow_object;
uniform vec2 ShadowMapSize;

varying vec3 ShadowPos_;
varying vec3 Pos_;
varying vec4 Color_;
varying vec3 Normal_;

bool isShadowing(vec3 pos)
{
    const float shadowBias = 0.005;
    if (pos.x >= 0.0 && pos.x <= 1.0 && pos.y >= 0.0 && pos.y <= 1.0 && pos.z >= 0.0 && pos.z <= 1.0)
        return (pos.z >= texture2D(shadow_object, pos.xy).r + shadowBias);

    return false;
}

float isShadowingPCF(vec3 pos)
{
    vec2 PCFKernel[5];
    PCFKernel[0] = vec2(0.0, 0.0);
    PCFKernel[1] = vec2(0.0, ShadowMapSize.y);
    PCFKernel[2] = vec2(0.0, -ShadowMapSize.y);
    PCFKernel[3] = vec2(ShadowMapSize.x, 0.0);
    PCFKernel[4] = vec2(-ShadowMapSize.x, 0.0);

    float result = 0.0;
    const float weight = 0.2;
    for(int i=0;i<5;++i)
    {
        vec3 currentPos =  pos + vec3(PCFKernel[i], 0.0);
        if (!isShadowing(currentPos))
            result += weight;
    }

    return result;
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
        
        float depthBias = 0.99;
        vec3 lightDir = Pos_ - PointLight[i].LightPos;
        float dist = dot(lightDir, lightDir) * depthBias;
        vec4 cubeTexel = textureCube(tex_object, normalize(lightDir));
        shadow = (cubeTexel.x <= dist);
        if (!shadow)
            finalColor += GetPointLight(PointLight[i], normal, Pos_, viewDir);
    }
    
    for(int i=0;i<MAX_NUM_OF_SPOT_LIGHT;++i)
    {
        if (i >= NumOfSpotLight)
            break;

        float depthBias = 0.99;
        vec3 lightDir = Pos_ - SpotLight[i].LightPos;
        float dist = dot(lightDir, lightDir) * depthBias;
        vec4 cubeTexel = textureCube(tex_object, normalize(lightDir));
        shadow = (cubeTexel.x <= dist);
        if (!shadow)
            finalColor += GetSpotLight(SpotLight[i], normal, Pos_, viewDir);
    }

    gl_FragColor = vec4(finalColor * diffuse, Color_.w);
}