precision mediump float;

attribute float VertexID;
attribute vec3 Color;

varying vec3 Color_;

void main()
{
    vec2 pos[4];
    pos[0].x = -0.5;    pos[0].y = 0.5;
    pos[1].x = 0.5;     pos[1].y = 0.5;
    pos[2].x = -0.5;    pos[2].y = -0.5;
    pos[3].x = 0.5;     pos[3].y = -0.5;

    Color_ = Color;
    if (0.0 == VertexID)
        gl_Position = vec4(pos[0], 0.0, 1.0);
    else if (1.0 == VertexID)
        gl_Position = vec4(pos[1], 0.0, 1.0);
    else if (2.0 == VertexID)
        gl_Position = vec4(pos[2], 0.0, 1.0);
    else if (3.0 == VertexID)
        gl_Position = vec4(pos[3], 0.0, 1.0);
}