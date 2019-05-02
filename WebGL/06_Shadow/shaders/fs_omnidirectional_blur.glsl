#version 300 es

#include "common.glsl"

precision mediump float;
precision mediump sampler2DArray;

uniform sampler2DArray tex_object_array;
uniform vec2 PixelSize;
uniform float Vertical;
uniform float MaxDist;
uniform float TexIndex;

#define FILTER_STEP_COUNT 20.0
#define FILTER_SIZE vec2(FILTER_STEP_COUNT, FILTER_STEP_COUNT)
#define COUNT (FILTER_STEP_COUNT * 2.0 + 1.0)

in vec2 TexCoord_;
out vec4 FragColor;

void main()
{
    vec2 radiusUV = (FILTER_SIZE * PixelSize) / FILTER_STEP_COUNT;

    if (Vertical > 0.0)
    {
        radiusUV = vec2(0.0, radiusUV.y);
    }
    else
    {
        radiusUV = vec2(radiusUV.x, 0.0);
    }

    vec4 color = vec4(0);
    for (float x = -FILTER_STEP_COUNT; x <= FILTER_STEP_COUNT; ++x)
	{
        vec2 offset = vec2(x, x) * radiusUV;
        TexArrayUV temp;
        temp.u = TexCoord_.x + offset.x;
        temp.v = TexCoord_.y + offset.y;
        temp.index = int(TexIndex);
        temp = MakeTexArrayUV(temp);
        color += texture(tex_object_array, vec3(temp.u, temp.v, temp.index));
    }

    FragColor = color / COUNT;
}