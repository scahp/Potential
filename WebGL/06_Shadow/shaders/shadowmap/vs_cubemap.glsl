precision highp float;

attribute vec3 Pos;
attribute vec3 Normal;

uniform mat4 MVP;

varying vec3 Normal_;

void main()
{
    Normal_ = Pos;
    gl_Position = MVP * vec4(Pos, 1.0);
}