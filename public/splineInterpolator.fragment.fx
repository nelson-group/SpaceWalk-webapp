precision highp float;

uniform mat4 projection;
uniform float t;
uniform vec3 min_color;
uniform vec3 max_color;
uniform float min_density; //all normalized in client
uniform float max_density; //all normalized in client
uniform float kernel_scale;
varying vec2 vdensityVary;
uniform float farPlane;

varying vec3 viewPos;
varying float sphereRadius;

#define PI radians(180.0)

void main() {
   vec3 uv;
   uv.xy = gl_PointCoord * 2. - 1. ;
   float r2 = dot(uv.xy,  uv.xy);
   if (r2 >= kernel_scale / 40.) discard; //discard position on voxel / must be smaller than 1

   uv.z = sqrt(1.-r2);
      
   vec2 vdensityBoth = (vdensityVary - min_density) / (max_density - min_density);
   vdensityBoth = min(vdensityBoth, 1.);
   // float min_dens_normalized = min_density / max_density;
   float vdensity = vdensityBoth[0] + (vdensityBoth[1] - vdensityBoth[0]) * t;
   float one_minus_d = 1. - vdensity; // normalization done by gpu
   vec3 color = min_color * one_minus_d + max_color * vdensity;   
   // float opacity = min(max(0., vdensity - min_dens_normalized) / (1. - min_dens_normalized), 1.);
   // float alphaCoef = (1. / (1.+ pow(kernel_scale*length(gl_PointCoord - vec2(0.5,0.5)),2.)));
   // vec4 newColor = vec4(color, alphaCoef);

   vec4 realViewPos = vec4(viewPos + uv * sphereRadius, 1.0);
   vec4 clipSpacePos = projection * realViewPos;
   clipSpacePos /= farPlane;    //instead of w see: https://gamedev.stackexchange.com/questions/93156/z-value-of-clip-space-position-is-always-1-0
   float invertedZ = 1.-clipSpacePos.z;   
   // gl_FragDepth = -invertedZ;
   // gl_FragColor = vec4(0.,0.,invertedZ, 1.);   
   gl_FragColor = vec4(color, invertedZ);   
}




