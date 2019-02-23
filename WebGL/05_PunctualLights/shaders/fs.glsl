#include "common.glsl"

precision highp float;

uniform vec3 Eye;

uniform jAmbientLight AmbientLight;
uniform jDirectionalLight DirectionalLight;
uniform jPointLight PointLight;
uniform jSpotLight SpotLight;

uniform int Collided;

varying vec3 Pos_;
varying vec4 Color_;
varying vec3 Normal_;

void main()
{
    vec3 normal = normalize(Normal_);
    vec3 viewDir = normalize(Eye - Pos_);

    jMaterialColor materialColor;

    materialColor.Diffuse = Color_.xyz;
    if (Collided > 0)
        materialColor.Diffuse = vec3(1.0, 1.0, 1.0);
    materialColor.Specular = vec3(1.0, 1.0, 1.0);

    vec3 lightDir = normalize(-DirectionalLight.LightDirection);
    vec3 reflectLightDir = 2.0 * max(dot(lightDir, normal), 0.0) * normal - lightDir;

    vec3 finalColor = vec3(0.0, 0.0, 0.0);
    finalColor += GetAmbientLight(AmbientLight);
    finalColor += GetDirectionalLight(DirectionalLight, materialColor, normal, reflectLightDir, viewDir);

    vec3 pointLightDir = PointLight.LightPos - Pos_;
    float pointLightDistance = length(pointLightDir);
    pointLightDir = normalize(pointLightDir);
    vec3 pointLightReflectionLightDir = 2.0 * max(dot(pointLightDir, normal), 0.0) * normal - pointLightDir;
    finalColor += GetPointLight(PointLight, materialColor, normal, pointLightDir, pointLightReflectionLightDir, viewDir, pointLightDistance);

    vec3 spotLightDir = SpotLight.LightPos - Pos_;
    float spotLightDistance = length(spotLightDir);
    spotLightDir = normalize(spotLightDir);
    vec3 spotLightReflectionLightDir = 2.0 * max(dot(spotLightDir, normal), 0.0) * normal - spotLightDir;
    finalColor += GetSpotLight(SpotLight, materialColor, normal, spotLightDir, spotLightReflectionLightDir, viewDir, spotLightDistance);

    gl_FragColor = vec4(finalColor, Color_.w);
}