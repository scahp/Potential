precision highp float;

uniform sampler2D tex_object;

varying vec2 TexCoord_;

void main()
{
    gl_FragColor = texture2D(tex_object, TexCoord_);
}