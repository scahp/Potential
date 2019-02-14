precision mediump float;

uniform vec3 Eye;

uniform vec3 LightDirection;

uniform vec3 AmbientColor;
uniform vec3 AmbientLightIntensity;

uniform vec3 DiffuseLightIntensity;

uniform vec3 SpecularColor;
uniform vec3 SpecularLightIntensity;
uniform float SpecularPow;

uniform int Collided;

varying vec3 Pos_;
varying vec4 Color_;
varying vec3 Normal_;

void main()
{
    vec3 normal = normalize(Normal_);
    vec3 viewDir = normalize(Eye - Pos_);

    vec3 diffuseColor = Color_.xyz;
    if (Collided > 0)
        diffuseColor = vec3(1.0, 1.0, 1.0);

    vec3 finalColor = AmbientColor * AmbientLightIntensity;

    vec3 lightDir = normalize(-LightDirection);
    vec3 reflectLightDir = 2.0 * max(dot(lightDir, normal), 0.0) * normal - lightDir;

    finalColor += diffuseColor * max(dot(lightDir, normal), 0.0) * DiffuseLightIntensity;
    finalColor += SpecularColor * pow(max(dot(reflectLightDir, viewDir), 0.0), SpecularPow) * SpecularLightIntensity;

    gl_FragColor = vec4(finalColor, Color_.w);
}