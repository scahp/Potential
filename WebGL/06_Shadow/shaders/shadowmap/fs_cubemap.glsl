precision highp float;

varying vec3 Normal_;

uniform samplerCube tex_object;

void main()
{
    gl_FragColor = textureCube(tex_object, normalize(Normal_));
    //gl_FragColor = vec4(normalize(Normal_), 1.0);
}