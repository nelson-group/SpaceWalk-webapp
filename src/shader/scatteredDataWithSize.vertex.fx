#version 300 es
precision highp float;

glEnable(GL_PROGRAM_POINT_SIZE);  

void main()
{
    gl_Position = vec4(aPos, 1.0);    
    gl_PointSize = 10;    
}  