precision highp float;

// glEnable(GL_PROGRAM_POINT_SIZE);  
attribute vec3 position;
attribute vec2 densities;
attribute vec3 splinesA;
attribute vec3 splinesB;
attribute vec3 splinesC;
attribute vec4 color;


uniform mat4 worldViewProjection;
uniform float t;
uniform float point_size;

varying vec2 vdensityVary;
void main()
{
    
    float tsquare = t * t; //saves one, yes ONE operation!
    // vec3 t1 = tsquare * t * a; all in one formular to save registers
    // vec3 t2 = tsquare * b;
    // vec3 t3 = t * c;
    // float t4 = d;
    vec3 positionNew = splinesA*t*tsquare + splinesB*tsquare + splinesC*t + position; //at^3 + bt^2 + ct +d 
    
    gl_Position = worldViewProjection * vec4(positionNew, 1.0);  
    vdensityVary = densities;
    gl_PointSize = point_size;
    // test = projection * vec4(positionNew, 1.0);
}  

