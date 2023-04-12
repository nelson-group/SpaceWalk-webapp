precision highp float;

uniform float t;
uniform vec3 min_color;
uniform vec3 max_color;
uniform float min_density; //all normalized in client
uniform float max_density; //all normalized in client
uniform float kernel_scale;
varying vec2 vdensityVary;

#define PI radians(180.0)

void main() {
   vec2 vdensityBoth = (vdensityVary - min_density) / (max_density - min_density);
   vdensityBoth = min(vdensityBoth, 1.);
   float min_dens_normalized = min_density / max_density;
   float vdensity = vdensityBoth[0] + (vdensityBoth[1] - vdensityBoth[0]) * t;
   float one_minus_d = 1. - vdensity; // normalization done by gpu
   vec3 color = min_color * one_minus_d + max_color * vdensity;   
   float opacity = min(max(0., vdensity - min_dens_normalized) / (1. - min_dens_normalized), 1.);
   float alphaCoef = (1. / (1.+ pow(kernel_scale*length(gl_PointCoord - vec2(0.5,0.5)),2.)));
   vec4 newColor = vec4(color, opacity * alphaCoef);
   gl_FragColor += min(newColor, 1.) ;   
   
   // gl_FragColor = vec4(test.x, test.y, test.z, 1);
}




