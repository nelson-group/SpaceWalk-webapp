precision highp float;

// glEnable(GL_PROGRAM_POINT_SIZE);  

attribute vec4 spline;
attribute vec2 uv;

uniform mat4 worldViewProjection;
uniform float t;

varying vec2 vUV;

void main()
{
    float tsquare = t * t; //saves one, yes ONE operation!
    //vec3 t1 = tsquare * t * a; all in one formular to save registers
    //vec3 t2 = tsquare * b;
    //vec3 t3 = t * c;
    //float t4 = d;
    position = spline[0]*t*tsquare + spline[1]*tsquare + spline[2]*t + spline[3]; //at^3 + bt^2 + ct +d 
    
    gl_Position = worldViewProjection * vec4(position, 1.0);  
    vUV = uv;
}  

