precision mediump float;

struct jAmbientLight
{
    vec3 Color;
    vec3 Intensity;
};

struct jDirectionalLight
{
    vec3 Color;
    vec3 DiffuseLightIntensity;
    vec3 SpecularLightIntensity;
    float SpecularPow;
};

vec3 TransformPos(mat4 m, vec3 v)
{
    return (m * vec4(v, 1.0)).xyz;
}

vec3 TransformNormal(mat4 m, vec3 v)
{
    return (m * vec4(v, 0.0)).xyz;
}

vec3 GetAmbientLight(jAmbientLight light)
{
    return light.Color * light.Intensity;
}

vec3 GetDirectionalLightDiffuse(jDirectionalLight light, vec3 lightDir, vec3 normal)
{
    return light.Color * max(dot(lightDir, normal), 0.0) * light.DiffuseLightIntensity;
}

vec3 GetDirectionalLightSpecular(jDirectionalLight light, vec3 reflectLightDir, vec3 viewDir)
{
    return light.Color * pow(max(dot(reflectLightDir, viewDir), 0.0), light.SpecularPow) * light.SpecularLightIntensity;
}

vec3 GetDirectionalLight(jDirectionalLight light, vec3 lightDir, vec3 normal, vec3 reflectLightDir, vec3 viewDir)
{
    return (GetDirectionalLightDiffuse(light, lightDir, normal) + GetDirectionalLightSpecular(light, reflectLightDir, viewDir));
}