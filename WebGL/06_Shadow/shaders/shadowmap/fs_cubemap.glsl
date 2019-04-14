#version 300 es

#include "common.glsl"

precision highp float;
precision highp sampler2DArray;

in vec3 Normal_;

//uniform samplerCube tex_object;
uniform sampler2DArray tex_object;

out vec4 color;

void main()
{
    TexArrayUV result = convert_xyz_to_texarray_uv(normalize(Normal_));
    color = vec4(texture(tex_object, vec3(result.u, result.v, result.index)).rrr, 1.0);

    //gl_FragColor = textureCube(tex_object, normalize(Normal_));
    //gl_FragColor = vec4(normalize(Normal_), 1.0);
}