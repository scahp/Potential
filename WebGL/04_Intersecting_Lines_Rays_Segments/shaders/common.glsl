precision mediump float;

struct jAmbientLight
{
    vec3 Color;
    vec3 Intensity;
};

struct jDirectionalLight
{
    vec3 DiffuseColor;
    vec3 DiffuseLightIntensity;
    vec3 SpecularColor;
    vec3 SpecularLightIntensity;
    float SpecularPow;
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

vec3 GetAmbientLight(jAmbientLight light)
{
    return light.Color * light.Intensity;
}

vec3 GetDirectionalLightDiffuse(jDirectionalLight light, jMaterialColor materialColor, vec3 lightDir, vec3 normal)
{
    return light.DiffuseColor * max(dot(lightDir, normal), 0.0) * light.DiffuseLightIntensity * materialColor.Diffuse;
}

vec3 GetDirectionalLightSpecular(jDirectionalLight light, jMaterialColor materialColor, vec3 reflectLightDir, vec3 viewDir)
{
    return light.SpecularColor * pow(max(dot(reflectLightDir, viewDir), 0.0), light.SpecularPow) * light.SpecularLightIntensity * materialColor.Specular;
}

vec3 GetDirectionalLight(jDirectionalLight light, jMaterialColor materialColor, vec3 lightDir, vec3 normal, vec3 reflectLightDir, vec3 viewDir)
{
    return (GetDirectionalLightDiffuse(light, materialColor, lightDir, normal) + GetDirectionalLightSpecular(light, materialColor, reflectLightDir, viewDir));
}