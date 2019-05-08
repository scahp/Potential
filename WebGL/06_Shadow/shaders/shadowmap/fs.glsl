#version 300 es

#preprocessor

#include "shadow.glsl"

precision mediump float;
precision mediump sampler2DArray;

#define MAX_NUM_OF_DIRECTIONAL_LIGHT 1
#define MAX_NUM_OF_POINT_LIGHT 1
#define MAX_NUM_OF_SPOT_LIGHT 1

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
uniform sampler2DArray shadow_object_point_array;
uniform sampler2DArray shadow_object_spot_array;
uniform sampler2D shadow_object;
uniform vec2 ShadowMapSize;
uniform float PCF_Size_Directional;
uniform float PCF_Size_OmniDirectional;
uniform float LightZNear;
uniform float LightZFar;
uniform float PointLightZNear;
uniform float PointLightZFar;
uniform float SpotLightZNear;
uniform float SpotLightZFar;
uniform mat4 ShadowVP;
uniform mat4 ShadowV;
uniform vec3 LightPos;      // Directional Light Pos 임시
uniform float ESM_C;
uniform float PointLightESM_C;
uniform float SpotLightESM_C;

// in vec3 ShadowPos_;
// in vec3 ShadowCameraPos_;
in vec3 Pos_;
in vec4 Color_;
in vec3 Normal_;

out vec4 color;

void main()
{
#if defined(USE_VSM)
    float vsmBiasForOmniDirectional = 0.5;
#endif // defined(USE_VSM) || defined(USE_EVSM)

#if defined(USE_EVSM)
    float evsmBiasForOmniDirectional = 0.5;
#endif // USE_EVSM

    vec3 normal = normalize(Normal_);
    vec3 viewDir = normalize(Eye - Pos_);

    vec4 tempShadowPos = (ShadowVP * vec4(Pos_, 1.0));
    tempShadowPos /= tempShadowPos.w;
    vec3 ShadowPos = tempShadowPos.xyz * 0.5 + 0.5;        // Transform NDC space coordinate from [-1.0 ~ 1.0] into [0.0 ~ 1.0].

    vec4 shadowCameraPos = (ShadowV * vec4(Pos_, 1.0));    

    vec3 diffuse = Color_.xyz;
    if (Collided != 0)
        diffuse = vec3(1.0, 1.0, 1.0);

    bool shadow = false;
    vec3 finalColor = vec3(0.0, 0.0, 0.0);

    if (UseAmbientLight != 0)
        finalColor += GetAmbientLight(AmbientLight);

#if defined(USE_POISSON_SAMPLE)
        InitPoissonSamples(gl_FragCoord.xy);
#endif

    for(int i=0;i<MAX_NUM_OF_DIRECTIONAL_LIGHT;++i)
    {
        if (i >= NumOfDirectionalLight)
            break;

        float lit = 0.0;

#if defined(USE_PCSS)
        {
#if defined(USE_POISSON_SAMPLE)
            lit = PCSS_PoissonSample(ShadowPos, -shadowCameraPos.z, shadow_object, LightZNear, ShadowMapSize);
#else // USE_POISSON_SAMPLE
            lit = PCSS(ShadowPos, -shadowCameraPos.z, shadow_object, LightZNear, ShadowMapSize);
#endif // USE_POISSON_SAMPLE
        }
#elif defined(USE_PCF)
        {
#if defined(USE_POISSON_SAMPLE)
            lit = PCF_PoissonSample(ShadowPos, vec2(PCF_Size_Directional, PCF_Size_Directional) * ShadowMapSize, shadow_object);
#else // USE_POISSON_SAMPLE
            lit = PCF(ShadowPos, vec2(PCF_Size_Directional, PCF_Size_Directional) * ShadowMapSize, shadow_object);
#endif // USE_POISSON_SAMPLE
        }
#elif defined(USE_VSM)
        {
            lit = VSM(ShadowPos, LightPos, Pos_, shadow_object);
        }
#elif defined(USE_ESM)
        {
            lit = ESM(ShadowPos, LightPos, Pos_, LightZNear, LightZFar, ESM_C, shadow_object);
        }
#elif defined(USE_EVSM)
        {
            lit = EVSM(ShadowPos, LightPos, Pos_, LightZNear, LightZFar, ESM_C, shadow_object);
        }
#else
        {
            lit = float(!IsShadowing(ShadowPos, shadow_object));
        }
#endif

        if (lit > 0.0)
            finalColor += GetDirectionalLight(DirectionalLight[i], normal, viewDir) * lit;
    }

    for(int i=0;i<MAX_NUM_OF_POINT_LIGHT;++i)
    {
        if (i >= NumOfPointLight)
            break;

        vec3 toLight = PointLight[i].LightPos - Pos_;
        float distFromLightSqrt = dot(toLight, toLight);

        if (distFromLightSqrt > (PointLight[i].MaxDistance * PointLight[i].MaxDistance))
            continue;

        float lit = 0.0;

#if defined(USE_PCSS)
        {

#if defined(USE_POISSON_SAMPLE)
            lit = PCSS_OmniDirectional_PoissonSample(Pos_, PointLight[i].LightPos, PointLightZNear, ShadowMapSize, shadow_object_point_array);
#else // USE_POISSON_SAMPLE
            lit = PCSS_OmniDirectional(Pos_, PointLight[i].LightPos, PointLightZNear, ShadowMapSize, shadow_object_point_array);
#endif // USE_POISSON_SAMPLE
        }
#elif defined(USE_PCF)
        {
            vec2 radiusSquredUV = vec2(PCF_Size_OmniDirectional, PCF_Size_OmniDirectional) * ShadowMapSize;
#if defined(USE_POISSON_SAMPLE)
            lit = PCF_OmniDirectional_PoissonSample(Pos_, PointLight[i].LightPos, radiusSquredUV, shadow_object_point_array);
#else
            lit = PCF_OmniDirectional(Pos_, PointLight[i].LightPos, radiusSquredUV, shadow_object_point_array);
#endif
        }
#elif defined(USE_VSM)
        {
            lit = VSM_OmniDirectional(PointLight[i].LightPos, Pos_, shadow_object_point_array, vsmBiasForOmniDirectional);
        }
#elif defined(USE_ESM)
        {
            lit = ESM_OmniDirectional(PointLight[i].LightPos, Pos_, PointLightZNear, PointLightZFar, PointLightESM_C, shadow_object_point_array);
        }
#elif defined(USE_EVSM)
        {
            lit = EVSM_OmniDirectional(PointLight[i].LightPos, Pos_, PointLightZNear, PointLightZFar, PointLightESM_C, shadow_object_point_array, evsmBiasForOmniDirectional);
        }
#else
        {
            lit = float(!IsShadowing(Pos_, PointLight[i].LightPos, shadow_object_point_array));
        }
#endif

        if (lit > 0.0)
            finalColor += GetPointLight(PointLight[i], normal, Pos_, viewDir) * lit;
    }
    
    for(int i=0;i<MAX_NUM_OF_SPOT_LIGHT;++i)
    {
        if (i >= NumOfSpotLight)
            break;

        vec3 toLight = SpotLight[i].LightPos - Pos_;
        float distFromLightSqrt = dot(toLight, toLight);

        if (distFromLightSqrt > (SpotLight[i].MaxDistance * SpotLight[i].MaxDistance))
            continue;

        float lit = 0.0;

#if defined(USE_PCSS)
        {
#if defined(USE_POISSON_SAMPLE)
            lit = PCSS_OmniDirectional_PoissonSample(Pos_, SpotLight[i].LightPos, SpotLightZNear, ShadowMapSize, shadow_object_spot_array);
#else // USE_POISSON_SAMPLE
            lit = PCSS_OmniDirectional(Pos_, SpotLight[i].LightPos, SpotLightZNear, ShadowMapSize, shadow_object_spot_array);
#endif // USE_POISSON_SAMPLE
        }
#elif defined(USE_PCF)
        {
            vec2 radiusSquredUV = vec2(PCF_Size_OmniDirectional, PCF_Size_OmniDirectional) * ShadowMapSize;
#if defined(USE_POISSON_SAMPLE)
            lit = PCF_OmniDirectional_PoissonSample(Pos_, SpotLight[i].LightPos, radiusSquredUV, shadow_object_spot_array);
#else // USE_POISSON_SAMPLE
            lit = PCF_OmniDirectional(Pos_, SpotLight[i].LightPos, radiusSquredUV, shadow_object_spot_array);
#endif // USE_POISSON_SAMPLE
        }
#elif defined(USE_VSM)
        {
            lit = VSM_OmniDirectional(SpotLight[i].LightPos, Pos_, shadow_object_spot_array, vsmBiasForOmniDirectional);
        }
#elif defined(USE_ESM)
        {
            lit = ESM_OmniDirectional(SpotLight[i].LightPos, Pos_, SpotLightZNear, SpotLightZFar, SpotLightESM_C, shadow_object_spot_array);
        }
#elif defined(USE_EVSM)
        {
            lit = EVSM_OmniDirectional(SpotLight[i].LightPos, Pos_, SpotLightZNear, SpotLightZFar, SpotLightESM_C, shadow_object_spot_array, evsmBiasForOmniDirectional);
        }
#else
        {
            lit = float(!IsShadowing(Pos_, SpotLight[i].LightPos, shadow_object_spot_array));
        }
#endif

        if (lit > 0.0)
            finalColor += GetSpotLight(SpotLight[i], normal, Pos_, viewDir) * lit;
    }

    color = vec4(finalColor * diffuse, Color_.w);
}