#version 300 es

precision highp float;

layout(location = 0) in vec3 Pos;
layout(location = 1) in vec3 Normal;

uniform mat4 MVP;

out vec3 Normal_;

void main()
{
    Normal_ = Pos;
    gl_Position = MVP * vec4(Pos, 1.0);
}