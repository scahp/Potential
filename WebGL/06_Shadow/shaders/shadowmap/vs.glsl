#include "common.glsl"

precision highp float;

attribute vec3 Pos;
attribute vec4 Color;
attribute vec3 Normal;

uniform mat4 MVP;
uniform mat4 MV;
uniform mat4 M;
uniform mat4 ShadowVP;

varying vec4 ShadowPos_;
varying vec3 Pos_;
varying vec4 Color_;
varying vec3 Normal_;

void main()
{
    Color_ = Color;
    Normal_ = TransformNormal(M, Normal);
    Pos_ = TransformPos(M, Pos);

    ShadowPos_ = (ShadowVP * vec4(Pos_, 1.0));
    ShadowPos_ /= ShadowPos_.w;
    ShadowPos_.xyz = ShadowPos_.xyz * 0.5 + 0.5;        // Transform NDC space coordinate from [-1.0 ~ 1.0] into [0.0 ~ 1.0].
    gl_Position = MVP * vec4(Pos, 1.0);
}