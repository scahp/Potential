precision mediump float;

uniform vec3 Eye;

varying vec3 Pos_;
varying vec4 Color_;
varying vec3 Normal_;

void main()
{
    vec3 normal = normalize(Normal_);
    vec3 viewDir = normalize(Eye - Pos_);
    float specularPow = 64.0;

    vec3 ambientColor = vec3(0.7, 0.8, 0.8);
    vec3 diffuseColor = Color_.xyz;
    vec3 specularColor = vec3(0.9, 0.7, 0.8);

    vec3 ambientLightIntensity = vec3(0.3, 0.3, 0.3);
    vec3 diffuseLightIntensity = vec3(0.5, 0.5, 0.5);
    vec3 specularLightIntensity = vec3(0.4, 0.4, 0.4);

    vec3 finalColor = ambientColor * ambientLightIntensity;

    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    vec3 reflectLightDir = 2.0 * max(dot(lightDir, normal), 0.0) * normal - lightDir;

    finalColor += diffuseColor * max(dot(lightDir, normal), 0.0) * diffuseLightIntensity;
    finalColor += specularColor * pow(max(dot(reflectLightDir, viewDir), 0.0), specularPow) * specularLightIntensity;

    gl_FragColor = vec4(finalColor, Color_.w);
}