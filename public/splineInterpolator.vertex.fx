precision highp float;

// glEnable(GL_PROGRAM_POINT_SIZE);  
attribute vec3 position;
attribute vec2 densities;
attribute float voronoi;
attribute vec3 splinesA;
attribute vec3 splinesB;
attribute vec3 splinesC;
attribute vec4 color;


uniform mat4 worldViewProjection;
uniform mat4 view;
uniform mat4 world;
uniform float t;
uniform float point_size;
uniform vec3 camera_pos;
uniform float scale;
// uniform float scale;

varying vec2 vdensityVary;
varying vec3 viewPos;
varying float sphereRadius;

#define scale_coef 0.02

void main()
{
    
    
    float tsquare = t * t; //saves one, yes ONE operation!
    // vec3 t1 = tsquare * t * a; all in one formular to save registers
    // vec3 t2 = tsquare * b;
    // vec3 t3 = t * c;
    // float t4 = d;
    vec3 positionNew = splinesA*t*tsquare + splinesB*tsquare + splinesC*t + position; //at^3 + bt^2 + ct +d 
    viewPos = (view * vec4(positionNew, 1.0)).xyz;
    //viewPos = vec4(positionNew, 1.0).xyz;
    
    gl_Position = worldViewProjection * vec4(positionNew, 1.0);  
    gl_PointSize = (point_size * voronoi) + 1. / (scale_coef * length(viewPos) + 1.) * scale;

    // varyings
    vdensityVary = densities;      
    sphereRadius = gl_PointSize;
}  

