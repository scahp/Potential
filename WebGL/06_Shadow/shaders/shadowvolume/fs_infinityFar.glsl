#include "common.glsl"

precision mediump float;

varying vec4 Color_;

void main()
{
    gl_FragColor = vec4(Color_);
}