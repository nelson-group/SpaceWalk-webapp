precision highp float;

// glEnable(GL_PROGRAM_POINT_SIZE);  

attribute vec3 position;
attribute vec4 color;

uniform mat4 worldViewProjection;

varying vec4 vColor;
void main()
{
    gl_Position = worldViewProjection * vec4(position, 1.0);   
    vColor = color;
    gl_PointSize = 20.;
}  

