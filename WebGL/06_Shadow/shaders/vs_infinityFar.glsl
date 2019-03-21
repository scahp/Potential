#include "common.glsl"

precision highp float;

attribute vec4 Pos;
attribute vec4 Color;

uniform mat4 MVP;
uniform mat4 M;
uniform mat4 MVP_Infinity;

#define MAX_NUM_OF_DIRECTIONAL_LIGHT 1
#define MAX_NUM_OF_POINT_LIGHT 10
#define MAX_NUM_OF_SPOT_LIGHT 10

uniform int NumOfDirectionalLight;
uniform int NumOfPointLight;
uniform int NumOfSpotLight;

uniform jDirectionalLight DirectionalLight[MAX_NUM_OF_DIRECTIONAL_LIGHT];
uniform jPointLight PointLight[MAX_NUM_OF_POINT_LIGHT];
uniform jSpotLight SpotLight[MAX_NUM_OF_SPOT_LIGHT];

varying vec4 Color_;

void main()
{
    Color_ = Color;

    if (Pos.w == 0.0)
    {
        vec3 lightPos;
        vec3 lightDir;
        if (NumOfPointLight > 0)
        {
            lightPos = PointLight[0].LightPos;
            lightDir = normalize(Pos.xyz - lightPos);
        }
        else if (NumOfSpotLight > 0)
        {
            lightPos = SpotLight[0].LightPos;
            lightDir = normalize(Pos.xyz - lightPos);
        }
        else if (NumOfDirectionalLight > 0)
        {
            lightDir = DirectionalLight[0].LightDirection;
        }

        gl_Position = MVP_Infinity * vec4(lightDir, 0.0);
    }
    else
    {
        gl_Position = MVP * Pos;
    }
}
