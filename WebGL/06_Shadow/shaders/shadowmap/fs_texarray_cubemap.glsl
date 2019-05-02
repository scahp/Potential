#version 300 es

#include "common.glsl"

precision mediump float;
precision mediump sampler2DArray;

in vec3 Normal_;

//uniform samplerCube tex_object;
uniform sampler2DArray tex_object_array;

out vec4 color;

void main()
{
    TexArrayUV result = convert_xyz_to_texarray_uv(normalize(Normal_));
    color = vec4(texture(tex_object_array, vec3(result.u, result.v, result.index)).rg, 0.0, 1.0);

    //gl_FragColor = textureCube(tex_object, normalize(Normal_));
    //color = vec4(result.u, result.v ,0.0, 1.0);
}