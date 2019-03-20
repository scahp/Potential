precision highp float;

attribute vec3 Pos;
attribute vec2 TexCoord;

uniform mat4 MVP;

varying vec2 TexCoord_;

void main()
{
    TexCoord_ = TexCoord;
    gl_Position = MVP * vec4(Pos, 1.0);
}