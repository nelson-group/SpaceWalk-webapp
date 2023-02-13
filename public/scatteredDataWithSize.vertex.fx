precision highp float;

// glEnable(GL_PROGRAM_POINT_SIZE);  

attribute vec3 position;
attribute vec2 uv;
attribute float densities;

uniform mat4 worldViewProjection;
uniform float distance;

varying vec2 vUV;
varying float vdensity;

void main()
{
    gl_Position = worldViewProjection * vec4(position, 1.0);    
    // gl_PointSize = max(50. * distance, 1.);  
    gl_PointSize = 2.;
    vdensity = densities;
    vUV = uv;
}  

