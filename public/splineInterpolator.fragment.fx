precision highp float;

uniform float t;
uniform vec3 min_color;
uniform vec3 max_color;
uniform float min_density; //all normalized in client
uniform float max_density; //all normalized in client
uniform float kernel_scale;
uniform float farPlane;

varying vec2 vdensityVary;
varying float vDepth;
varying float vSphereRadius;

#define PI radians(180.0)
#define maxKernel dot(vec2(1.,1.), vec2(1.,1.))

void main() {
   vec3 uv;
   uv.xy = abs(gl_PointCoord*2.-1.); //wertebereich built in gl_PointCoord = 0,1
   float r2 = dot(uv.xy,  uv.xy);
   float pointSize = kernel_scale * maxKernel;
   if (r2 >= pointSize) discard; //discard position on voxel / must be smaller than 1      
      
   vec2 vdensityBoth = (vdensityVary - min_density) / (max_density - min_density);
   vdensityBoth = min(vdensityBoth, 1.);
   
   float vdensity = vdensityBoth[0] + (vdensityBoth[1] - vdensityBoth[0]) * t;
   float one_minus_d = 1. - vdensity; // normalization done by gpu
   vec3 color = min_color * one_minus_d + max_color * vdensity;   

   // gl_FragDepth = log2(1. + clamp(vDepth - (1.- r2) * vSphereRadius / farPlane, 0.001,0.999));
   gl_FragColor = vec4(color, (1. - r2) * 0.1);    
   // gl_FragColor = vec4(vec3(vDepth), (1. - r2) * (vdensity / max_density));    
   // gl_FragColor = vec4(color, 1);    
}




