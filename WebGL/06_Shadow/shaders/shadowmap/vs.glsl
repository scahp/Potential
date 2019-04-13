#version 300 es

#include "common.glsl"

precision highp float;

layout(location = 0) in vec3 Pos;
layout(location = 1) in vec4 Color;
layout(location = 2) in vec3 Normal;

uniform mat4 MVP;
uniform mat4 MV;
uniform mat4 M;
uniform mat4 ShadowVP;

out vec3 ShadowPos_;
out vec3 Pos_;
out vec4 Color_;
out vec3 Normal_;

void main()
{
    Color_ = Color;
    Normal_ = TransformNormal(M, Normal);
    Pos_ = TransformPos(M, Pos);

    vec4 shadowPos = (ShadowVP * vec4(Pos_, 1.0));
    shadowPos /= shadowPos.w;
    ShadowPos_.xyz = shadowPos.xyz * 0.5 + 0.5;        // Transform NDC space coordinate from [-1.0 ~ 1.0] into [0.0 ~ 1.0].
    gl_Position = MVP * vec4(Pos, 1.0);
}