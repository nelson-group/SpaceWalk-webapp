precision highp float;

// glEnable(GL_PROGRAM_POINT_SIZE);  

attribute vec3 position;
attribute vec2 uv;
attribute float densities;

uniform mat4 worldViewProjection;
uniform float distance;
uniform vec3 cameraPosition;

varying vec2 vUV;
varying float vdensity;

void main()
{
    gl_Position = worldViewProjection * vec4(position, 1.0);    
    // gl_PointSize = 2.;
    gl_PointSize = 20. * max(pow(1000000., 1. - (length(cameraPosition - position) / distance)) / 1000000., 0.1);
    vdensity = densities;
    vUV = uv;
}  

