precision mediump float;

uniform sampler2D tex_object;

varying vec2 TexCoord_;
varying vec4 Color_;

void main()
{
    gl_FragColor = texture2D(tex_object, TexCoord_);
    // gl_FragColor.x = TexCoord_.x;
    // gl_FragColor.y = TexCoord_.y;
    // gl_FragColor.z *= 0.0;
}