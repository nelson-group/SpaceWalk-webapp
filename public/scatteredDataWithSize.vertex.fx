precision highp float;

// glEnable(GL_PROGRAM_POINT_SIZE);  

attribute vec3 position;
attribute vec2 uv;
// attribute float densities;

uniform mat4 worldViewProjection;

varying vec4 vColor;
varying vec2 vUV;

void main()
{
    gl_Position = worldViewProjection * vec4(position, 1.0);    
    gl_PointSize = 2.;    
    vColor = vec4(1, 0, 0, 0.3);
    vUV = uv;
}  