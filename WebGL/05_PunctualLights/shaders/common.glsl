precision mediump float;

struct jAmbientLight
{
    vec3 Color;
    vec3 Intensity;
};

struct jDirectionalLight
{
    vec3 LightDirection;
    vec3 Color;
    vec3 DiffuseLightIntensity;
    vec3 SpecularLightIntensity;
    float SpecularPow;
};

struct jPointLight
{
    vec3 LightPos;
    vec3 Color;
    vec3 DiffuseLightIntensity;
    vec3 SpecularLightIntensity;
    float SpecularPow;
    float MaxDistance;
};

struct jSpotLight
{
    vec3 LightPos;
    vec3 Direction;
    vec3 Color;
    vec3 DiffuseLightIntensity;
    vec3 SpecularLightIntensity;
    float SpecularPow;
    float MaxDistance;
    float PenumbraRadian;
    float UmbraRadian;
};

vec3 TransformPos(mat4 m, vec3 v)
{
    return (m * vec4(v, 1.0)).xyz;
}

vec3 TransformNormal(mat4 m, vec3 v)
{
    return (m * vec4(v, 0.0)).xyz;
}

float WindowingFunction(float value, float maxValue)
{
    return pow(max(0.0, 1.0 - pow(value / maxValue, 4.0)), 2.0);
}

float DistanceAttenuation(float distance, float maxDistance)
{
    const float refDistance = 50.0;
    float attenuation = (refDistance * refDistance) / ((distance * distance) + 1.0);
    return attenuation * WindowingFunction(distance, maxDistance);
}

float DiretionalFalloff(float lightRadian, float penumbraRadian, float umbraRadian)
{
    float t = clamp((cos(lightRadian) - cos(umbraRadian)) / (cos(penumbraRadian) - cos(umbraRadian)), 0.0, 1.0);
    return t * t;
}

vec3 GetAmbientLight(jAmbientLight light)
{
    return light.Color * light.Intensity;
}

vec3 GetDirectionalLightDiffuse(jDirectionalLight light, vec3 normal)
{
    return light.Color * max(dot(-light.LightDirection, normal), 0.0) * light.DiffuseLightIntensity;
}

vec3 GetDirectionalLightSpecular(jDirectionalLight light, vec3 reflectLightDir, vec3 viewDir)
{
    return light.Color * pow(max(dot(reflectLightDir, viewDir), 0.0), light.SpecularPow) * light.SpecularLightIntensity;
}

vec3 GetDirectionalLight(jDirectionalLight light, vec3 normal, vec3 reflectLightDir, vec3 viewDir)
{
    return (GetDirectionalLightDiffuse(light, normal) + GetDirectionalLightSpecular(light, reflectLightDir, viewDir));
}

vec3 GetPointLightDiffuse(jPointLight light, vec3 normal, vec3 lightDir)
{
    return light.Color * max(dot(lightDir, normal), 0.0) * light.DiffuseLightIntensity;
}

vec3 GetPointLightSpecular(jPointLight light, vec3 reflectLightDir, vec3 viewDir)
{
    return light.Color * pow(max(dot(reflectLightDir, viewDir), 0.0), light.SpecularPow) * light.SpecularLightIntensity;
}

vec3 GetPointLight(jPointLight light, vec3 normal, vec3 lightDir, vec3 reflectLightDir, vec3 viewDir, float distance)
{
    return (GetPointLightDiffuse(light, normal, lightDir) + GetPointLightSpecular(light, reflectLightDir, viewDir)) * DistanceAttenuation(distance, light.MaxDistance);
}

vec3 GetSpotLightDiffuse(jSpotLight light, vec3 normal, vec3 lightDir)
{
    return light.Color * max(dot(lightDir, normal), 0.0) * light.DiffuseLightIntensity;
}

vec3 GetSpotLightSpecular(jSpotLight light, vec3 reflectLightDir, vec3 viewDir)
{
    return light.Color * pow(max(dot(reflectLightDir, viewDir), 0.0), light.SpecularPow) * light.SpecularLightIntensity;
}

vec3 GetSpotLight(jSpotLight light, vec3 normal, vec3 lightDir, vec3 reflectLightDir, vec3 viewDir, float distance)
{
    float lightRadian = acos(dot(lightDir, -light.Direction));

    return (GetSpotLightDiffuse(light, normal, lightDir)
     + GetSpotLightSpecular(light, reflectLightDir, viewDir))
      * DistanceAttenuation(distance, light.MaxDistance)
      * DiretionalFalloff(lightRadian, light.PenumbraRadian, light.UmbraRadian);
}
