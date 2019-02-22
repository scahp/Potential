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

struct jMaterialColor
{
    vec3 Diffuse;
    vec3 Specular;
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
    return clamp((cos(lightRadian) - cos(umbraRadian)) / (cos(penumbraRadian) - cos(umbraRadian)), 0.0, 1.0);
}

vec3 GetAmbientLight(jAmbientLight light)
{
    return light.Color * light.Intensity;
}

vec3 GetDirectionalLightDiffuse(jDirectionalLight light, jMaterialColor materialColor, vec3 normal)
{
    return light.Color * max(dot(-light.LightDirection, normal), 0.0) * light.DiffuseLightIntensity * materialColor.Diffuse;
}

vec3 GetDirectionalLightSpecular(jDirectionalLight light, jMaterialColor materialColor, vec3 reflectLightDir, vec3 viewDir)
{
    return light.Color * pow(max(dot(reflectLightDir, viewDir), 0.0), light.SpecularPow) * light.SpecularLightIntensity * materialColor.Specular;
}

vec3 GetDirectionalLight(jDirectionalLight light, jMaterialColor materialColor, vec3 normal, vec3 reflectLightDir, vec3 viewDir)
{
    return (GetDirectionalLightDiffuse(light, materialColor, normal) + GetDirectionalLightSpecular(light, materialColor, reflectLightDir, viewDir));
}

vec3 GetPointLightDiffuse(jPointLight light, jMaterialColor materialColor, vec3 normal, vec3 lightDir)
{
    return light.Color * max(dot(lightDir, normal), 0.0) * light.DiffuseLightIntensity * materialColor.Diffuse;
}

vec3 GetPointLightSpecular(jPointLight light, jMaterialColor materialColor, vec3 reflectLightDir, vec3 viewDir)
{
    return light.Color * pow(max(dot(reflectLightDir, viewDir), 0.0), light.SpecularPow) * light.SpecularLightIntensity * materialColor.Specular;
}

vec3 GetPointLight(jPointLight light, jMaterialColor materialColor, vec3 normal, vec3 lightDir, vec3 reflectLightDir, vec3 viewDir, float distance)
{
    return (GetPointLightDiffuse(light, materialColor, normal, lightDir) + GetPointLightSpecular(light, materialColor, reflectLightDir, viewDir)) * DistanceAttenuation(distance, light.MaxDistance);
}

vec3 GetSpotLightDiffuse(jSpotLight light, jMaterialColor materialColor, vec3 normal, vec3 lightDir)
{
    return light.Color * max(dot(lightDir, normal), 0.0) * light.DiffuseLightIntensity * materialColor.Diffuse;
}

vec3 GetSpotLightSpecular(jSpotLight light, jMaterialColor materialColor, vec3 reflectLightDir, vec3 viewDir)
{
    return light.Color * pow(max(dot(reflectLightDir, viewDir), 0.0), light.SpecularPow) * light.SpecularLightIntensity * materialColor.Specular;
}

vec3 GetSpotLight(jSpotLight light, jMaterialColor materialColor, vec3 normal, vec3 lightDir, vec3 reflectLightDir, vec3 viewDir, float distance)
{
    float lightRadian = acos(dot(lightDir, light.Direction));

    return (GetSpotLightDiffuse(light, materialColor, normal, lightDir)
     + GetSpotLightSpecular(light, materialColor, reflectLightDir, viewDir))
      * DistanceAttenuation(distance, light.MaxDistance)
      * DiretionalFalloff(lightRadian, light.PenumbraRadian, light.UmbraRadian);
}
