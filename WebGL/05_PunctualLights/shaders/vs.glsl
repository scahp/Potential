#include "common.glsl"

precision mediump float;

attribute vec3 Pos;
attribute vec4 Color;
attribute vec3 Normal;

uniform mat4 MVP;
uniform mat4 MV;
uniform mat4 M;

varying vec3 Pos_;
varying vec4 Color_;
varying vec3 Normal_;

void main()
{
    Color_ = Color;
    Normal_ = TransformNormal(M, Normal);
    Pos_ = TransformPos(M, Pos);
    gl_Position = MVP * vec4(Pos, 1.0);
}