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

varying vec4 ShadowPos_;
varying vec3 Pos_;
varying vec4 Color_;
varying vec3 Normal_;

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
        
        if (ShadowPos_.x >= 0.0 && ShadowPos_.x <= 1.0 && ShadowPos_.y >= 0.0 && ShadowPos_.y <= 1.0 && ShadowPos_.z >= 0.0 && ShadowPos_.z <= 1.0)
            shadow = (ShadowPos_.z >= texture2D(shadow_object, ShadowPos_.xy).r + 0.005);
        if (!shadow)
            finalColor += GetDirectionalLight(DirectionalLight[i], normal, viewDir);
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