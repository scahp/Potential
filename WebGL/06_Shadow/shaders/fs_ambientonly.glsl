#include "common.glsl"

precision highp float;

uniform vec3 Eye;

uniform jAmbientLight AmbientLight;

uniform int Collided;

varying vec3 Pos_;
varying vec4 Color_;
varying vec3 Normal_;

void main()
{
    vec3 diffuse = Color_.xyz;
    if (Collided != 0)
        diffuse = vec3(1.0, 1.0, 1.0);

    vec3 finalColor = vec3(0.0, 0.0, 0.0);
    finalColor += GetAmbientLight(AmbientLight);

    gl_FragColor = vec4(finalColor * diffuse, Color_.w);
}