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

    vec3 diffuse = Color_.xyz;
    if (Collided != 0)
        diffuse = vec3(1.0, 1.0, 1.0);

    vec3 lightDir = normalize(-DirectionalLight.LightDirection);
    vec3 reflectLightDir = 2.0 * max(dot(lightDir, normal), 0.0) * normal - lightDir;

    vec3 finalColor = vec3(0.0, 0.0, 0.0);
    finalColor += GetDirectionalLight(DirectionalLight, normal, reflectLightDir, viewDir);

    vec3 pointLightDir = PointLight.LightPos - Pos_;
    float pointLightDistance = length(pointLightDir);
    pointLightDir = normalize(pointLightDir);
    vec3 pointLightReflectionLightDir = 2.0 * max(dot(pointLightDir, normal), 0.0) * normal - pointLightDir;
    finalColor += GetPointLight(PointLight, normal, pointLightDir, pointLightReflectionLightDir, viewDir, pointLightDistance);

    vec3 spotLightDir = SpotLight.LightPos - Pos_;
    float spotLightDistance = length(spotLightDir);
    spotLightDir = normalize(spotLightDir);
    vec3 spotLightReflectionLightDir = 2.0 * max(dot(spotLightDir, normal), 0.0) * normal - spotLightDir;
    finalColor += GetSpotLight(SpotLight, normal, spotLightDir, spotLightReflectionLightDir, viewDir, spotLightDistance);

    gl_FragColor = vec4(finalColor * diffuse, Color_.w);
}