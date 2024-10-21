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
uniform float t;
uniform float point_size;
uniform float scale;
uniform float farPlane;

varying vec2 vdensityVary;
varying float vDepth;
varying float vSphereRadius;

#define scale_coef 1.

void main()
{    
    float tsquare = t * t; //saves one, yes ONE operation!    
    vec3 positionNew = splinesA*t*tsquare + splinesB*tsquare + splinesC*t + position; //at^3 + bt^2 + ct +d     
    
    gl_Position = worldViewProjection * vec4(positionNew, 1.0); 
    float clipSpaceDepthNormalized = clamp(1. - gl_Position.z / (farPlane * 1.1), 0., 1.);    
    gl_PointSize = point_size * voronoi; // (100. * pow(clipSpaceDepthNormalized,scale));// * scale_coef * pow(1. - clipSpaceDepthNormalized  + 1., scale);            
    gl_PointSize *= (1. + scale * pow(clipSpaceDepthNormalized,scale));// * scale_coef * pow(1. - clipSpaceDepthNormalized  + 1., scale);            

    // varyings
    vDepth = gl_Position.z / farPlane;
    vdensityVary = densities; 
    vSphereRadius = gl_PointSize;         
}  

