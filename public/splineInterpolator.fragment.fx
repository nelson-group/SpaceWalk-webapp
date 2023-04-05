precision highp float;

uniform float t;
uniform vec3 min_color;
uniform vec3 max_color;
uniform float min_density; //all normalized in client
uniform float max_density; //all normalized in client

varying vec2 vdensityVary;


void main() {
   vec2 vdensityBoth = (vdensityVary - min_density) / (max_density - min_density);
   float min_dens_normalized = min_density / max_density;
   float vdensity = vdensityBoth[0] + (vdensityBoth[1] - vdensityBoth[0]) * t;
   float one_minus_d = 1. - vdensity; // normalization done by gpu
   vec3 color = min_color * one_minus_d + max_color * vdensity;   
   float opacity = min(max(0., vdensity - min_dens_normalized) / (1. - min_dens_normalized), 1.);

   vec4 newColor = vec4(color, opacity);
   gl_FragColor = min(newColor + gl_FragColor, 1.) ;   
   
   // gl_FragColor = vec4(vdensityBoth[0],vdensityBoth[1], 0, 0.2);
}




