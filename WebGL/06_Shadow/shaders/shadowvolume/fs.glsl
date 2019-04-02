#include "common.glsl"

precision highp float;

#define MAX_NUM_OF_DIRECTIONAL_LIGHT 1
#define MAX_NUM_OF_POINT_LIGHT 3
#define MAX_NUM_OF_SPOT_LIGHT 3

uniform int NumOfDirectionalLight;
uniform int NumOfPointLight;
uniform int NumOfSpotLight;

uniform jDirectionalLight DirectionalLight[MAX_NUM_OF_DIRECTIONAL_LIGHT];
uniform jPointLight PointLight[MAX_NUM_OF_POINT_LIGHT];
uniform jSpotLight SpotLight[MAX_NUM_OF_SPOT_LIGHT];

uniform vec3 Eye;

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

    vec3 finalColor = vec3(0.0, 0.0, 0.0);

    for(int i=0;i<MAX_NUM_OF_DIRECTIONAL_LIGHT;++i)
    {
        if (i >= NumOfDirectionalLight)
            break;
        
        finalColor += GetDirectionalLight(DirectionalLight[i], normal, viewDir);
    }

    for(int i=0;i<MAX_NUM_OF_POINT_LIGHT;++i)
    {
        if (i >= NumOfPointLight)
            break;
        
        finalColor += GetPointLight(PointLight[i], normal, Pos_, viewDir);
    }
    
    for(int i=0;i<MAX_NUM_OF_SPOT_LIGHT;++i)
    {
        if (i >= NumOfSpotLight)
            break;

        finalColor += GetSpotLight(SpotLight[i], normal, Pos_, viewDir);
    }

    gl_FragColor = vec4(finalColor * diffuse, Color_.w);
}