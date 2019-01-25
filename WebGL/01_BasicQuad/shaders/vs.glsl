precision mediump float;

attribute vec3 Pos;
attribute vec4 Color;

uniform mat4 MVP;
varying vec4 Color_;

void main()
{
    Color_ = Color;
    gl_Position = MVP * vec4(Pos, 1.0);
}