//adapted from https://github.com/BabylonJS/Babylon.js/blob/master/packages/dev/core/src/Shaders/fluidRenderingParticleDepth.vertex.fx
precision highp float;

// glEnable(GL_PROGRAM_POINT_SIZE);  
attribute vec3 position;
attribute float voronoi;
attribute vec3 splinesA;
attribute vec3 splinesB;
attribute vec3 splinesC;



uniform mat4 worldViewProjection;
uniform float t;
uniform float point_size;
uniform float scale;
uniform float farPlane;

varying float vDepth;
varying float vSphereRadius;

#define scale_coef 0.02

void main()
{
    float tsquare = t * t; //saves one, yes ONE operation!    
    vec3 positionNew = splinesA*t*tsquare + splinesB*tsquare + splinesC*t + position; //at^3 + bt^2 + ct +d     
    
    gl_Position = worldViewProjection * vec4(positionNew, 1.0);       
    gl_PointSize = (point_size * voronoi) + 1. / (scale_coef * (gl_Position.z / farPlane)  + 1.) * scale;            

    vDepth = gl_Position.z;   
    vSphereRadius = gl_PointSize;
}  

