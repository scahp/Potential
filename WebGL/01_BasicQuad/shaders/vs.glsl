precision mediump float;

attribute float VertexID;
attribute vec3 Color;
attribute vec2 Offset;
attribute float Scale;

varying vec3 Color_;

void main()
{
    vec2 pos[4];
    float size = 0.5 * Scale;
    pos[0].x = -size;    pos[0].y = size;
    pos[1].x = size;     pos[1].y = size;
    pos[2].x = -size;    pos[2].y = -size;
    pos[3].x = size;     pos[3].y = -size;

    Color_ = Color;
    if (0.0 == VertexID)
        gl_Position = vec4(pos[0] + Offset, 0.0, 1.0);
    else if (1.0 == VertexID)
        gl_Position = vec4(pos[1] + Offset, 0.0, 1.0);
    else if (2.0 == VertexID)
        gl_Position = vec4(pos[2] + Offset, 0.0, 1.0);
    else if (3.0 == VertexID)
        gl_Position = vec4(pos[3] + Offset, 0.0, 1.0);
}