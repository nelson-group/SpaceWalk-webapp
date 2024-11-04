//adapted from https://github.com/BabylonJS/Babylon.js/blob/master/packages/dev/core/src/Shaders/fluidRenderingParticleDepth.fragment.fx
precision highp float;

uniform float farPlane;
uniform float kernel_scale;

varying float vDepth;
varying float vSphereRadius;

#define maxKernel dot(vec2(1.,1.), vec2(1.,1.))

void main() {
   vec3 uv;
   uv.xy = abs(gl_PointCoord*2.-1.); //wertebereich built in gl_PointCoord = 0,1
   float r2 = dot(uv.xy,  uv.xy);
   float pointSize = kernel_scale * maxKernel;
  // if (r2 >= pointSize) discard; //discard position on voxel / must be smaller than 1   
   // r2 = clamp( r2,0.,1.);
   uv.z = sqrt(1.- r2) / vSphereRadius; //actual uv.z from in clipsspace (from 0-1 to 0.0000 because of smallness of particles
   
   
   float clipSpaceDepthNormalized = clamp(vDepth + uv.z, 0.0001, 0.999);
   // float clipSpaceDepthNormalized = clamp(vDepth, 0.0001, 0.999);

   float fragmentDepth = clipSpaceDepthNormalized;
   #ifdef logDepth
      fragmentDepth = log2(max(1.0001, 1. + clipSpaceDepthNormalized));      
   #endif

   // gl_FragDepth = fragmentDepth;
   gl_FragColor = vec4(fragmentDepth,0.,0., 1.); 
}




