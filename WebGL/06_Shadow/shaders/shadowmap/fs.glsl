#version 300 es

#preprocessor

#include "shadow.glsl"

precision mediump float;
precision mediump sampler2DArray;

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
uniform sampler2DArray shadow_object_array;
uniform sampler2D shadow_object;
uniform vec2 ShadowMapSize;
uniform float PCF_Size_Directional;
uniform float PCF_Size_OmniDirectional;
uniform float LightZNear;
uniform float PointLightZNear;
uniform float SpotLightZNear;
uniform mat4 ShadowVP;
uniform mat4 ShadowV;

in vec3 ShadowPos_;
in vec3 ShadowCameraPos_;
in vec3 Pos_;
in vec4 Color_;
in vec3 Normal_;

out vec4 color;

void main()
{
    vec3 normal = normalize(Normal_);
    vec3 viewDir = normalize(Eye - Pos_);

    vec4 shadowPos = (ShadowVP * vec4(Pos_, 1.0));
    shadowPos /= shadowPos.w;
    vec3 ShadowPos = shadowPos.xyz * 0.5 + 0.5;        // Transform NDC space coordinate from [-1.0 ~ 1.0] into [0.0 ~ 1.0].

    vec4 shadowCameraPos = (ShadowV * vec4(Pos_, 1.0));    

    vec3 diffuse = Color_.xyz;
    if (Collided != 0)
        diffuse = vec3(1.0, 1.0, 1.0);

    bool shadow = false;
    vec3 finalColor = vec3(0.0, 0.0, 0.0);

    if (UseAmbientLight != 0)
        finalColor += GetAmbientLight(AmbientLight);

#if defined(USE_POISSON_SAMPLE)
        InitPoissonSamples(ShadowPos.xy);
#endif

    for(int i=0;i<MAX_NUM_OF_DIRECTIONAL_LIGHT;++i)
    {
        if (i >= NumOfDirectionalLight)
            break;
        
#if defined(USE_PCSS)
        {
            float shadowRate = 0.0;
#if defined(USE_POISSON_SAMPLE)
                shadowRate = PCSS_PoissonSample(ShadowPos, -shadowCameraPos.z, shadow_object, LightZNear, ShadowMapSize);
#else // USE_POISSON_SAMPLE
                shadowRate = PCSS(ShadowPos, -shadowCameraPos.z, shadow_object, LightZNear, ShadowMapSize);
#endif // USE_POISSON_SAMPLE

            if (shadowRate > 0.0)
                finalColor += GetDirectionalLight(DirectionalLight[i], normal, viewDir) * shadowRate;

        }
#elif defined(USE_PCF)
        {
            float shadowRate = 0.0;
#if defined(USE_POISSON_SAMPLE)
                shadowRate = PCF_PoissonSample(ShadowPos, vec2(PCF_Size_Directional, PCF_Size_Directional) * ShadowMapSize, shadow_object);
#else // USE_POISSON_SAMPLE
                shadowRate = PCF(ShadowPos, vec2(PCF_Size_Directional, PCF_Size_Directional) * ShadowMapSize, shadow_object);
#endif // USE_POISSON_SAMPLE

            if (shadowRate > 0.0)
                finalColor += GetDirectionalLight(DirectionalLight[i], normal, viewDir) * shadowRate;
        }
#else
        {
            if (!IsShadowing(ShadowPos, shadow_object))
                finalColor += GetDirectionalLight(DirectionalLight[i], normal, viewDir);
        }
#endif
    }

    for(int i=0;i<MAX_NUM_OF_POINT_LIGHT;++i)
    {
        if (i >= NumOfPointLight)
            break;

#if defined(USE_PCSS)
        {
            float shadowRate = 0.0;
#if defined(USE_POISSON_SAMPLE)
                shadowRate = PCSS_OmniDirectional_PoissonSample(Pos_, PointLight[i].LightPos, PointLightZNear, ShadowMapSize, shadow_object_array);
#else // USE_POISSON_SAMPLE
                shadowRate = PCSS_OmniDirectional(Pos_, PointLight[i].LightPos, PointLightZNear, ShadowMapSize, shadow_object_array);
#endif // USE_POISSON_SAMPLE

            if (shadowRate > 0.0)
               finalColor += GetPointLight(PointLight[i], normal, Pos_, viewDir) * shadowRate;
        }
#elif defined(USE_PCF)
        {
            vec2 radiusSquredUV = vec2(PCF_Size_OmniDirectional, PCF_Size_OmniDirectional) * ShadowMapSize;
            float shadowRate = 0.0;
#if defined(USE_POISSON_SAMPLE)
                shadowRate = PCF_OmniDirectional_PoissonSample(Pos_, PointLight[i].LightPos, radiusSquredUV, shadow_object_array);
#else
                shadowRate = PCF_OmniDirectional(Pos_, PointLight[i].LightPos, radiusSquredUV, shadow_object_array);
#endif

            if (shadowRate > 0.0)
               finalColor += GetPointLight(PointLight[i], normal, Pos_, viewDir) * shadowRate;
        }
#else
        {
            if (!IsShadowing(Pos_, PointLight[i].LightPos, shadow_object_array))
                finalColor += GetPointLight(PointLight[i], normal, Pos_, viewDir);
        }
#endif
    }
    
    for(int i=0;i<MAX_NUM_OF_SPOT_LIGHT;++i)
    {
        if (i >= NumOfSpotLight)
            break;

#if defined(USE_PCSS)
        {
            float shadowRate = 0.0;
#if defined(USE_POISSON_SAMPLE)
                shadowRate = PCSS_OmniDirectional_PoissonSample(Pos_, SpotLight[i].LightPos, SpotLightZNear, ShadowMapSize, shadow_object_array);
#else // USE_POISSON_SAMPLE
                shadowRate = PCSS_OmniDirectional(Pos_, SpotLight[i].LightPos, SpotLightZNear, ShadowMapSize, shadow_object_array);
#endif // USE_POISSON_SAMPLE

            if (shadowRate > 0.0)
               finalColor += GetSpotLight(SpotLight[i], normal, Pos_, viewDir) * shadowRate;
        }
#elif defined(USE_PCF)
        {
            vec2 radiusSquredUV = vec2(PCF_Size_OmniDirectional, PCF_Size_OmniDirectional) * ShadowMapSize;
            float shadowRate = 0.0;
#if defined(USE_POISSON_SAMPLE)
                shadowRate = PCF_OmniDirectional_PoissonSample(Pos_, SpotLight[i].LightPos, radiusSquredUV, shadow_object_array);
#else // USE_POISSON_SAMPLE
                shadowRate = PCF_OmniDirectional(Pos_, SpotLight[i].LightPos, radiusSquredUV, shadow_object_array);
#endif // USE_POISSON_SAMPLE

            if (shadowRate > 0.0)
                finalColor += GetSpotLight(SpotLight[i], normal, Pos_, viewDir) * shadowRate;
        }
#else
        {
            if (!IsShadowing(Pos_, SpotLight[i].LightPos, shadow_object_array))
                finalColor += GetSpotLight(SpotLight[i], normal, Pos_, viewDir);
        }
#endif
    }

    color = vec4(finalColor * diffuse, Color_.w);
}