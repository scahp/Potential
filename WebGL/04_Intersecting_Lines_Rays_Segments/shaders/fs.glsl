#include "common.glsl"

precision highp float;

uniform vec3 Eye;

uniform vec3 LightDirection;

uniform jAmbientLight AmbientLight;
uniform jDirectionalLight DirectionalLight;

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

    vec3 lightDir = normalize(-LightDirection);
    vec3 reflectLightDir = 2.0 * max(dot(lightDir, normal), 0.0) * normal - lightDir;

    vec3 finalColor = GetAmbientLight(AmbientLight) + GetDirectionalLight(DirectionalLight, lightDir, normal, reflectLightDir, viewDir);
    gl_FragColor = vec4(finalColor * diffuse, Color_.w);
}