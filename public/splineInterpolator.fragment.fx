precision highp float;

uniform vec3 min_color;
uniform vec3 max_color;
uniform float min_density; //all normalized in client
uniform float max_density; //all normalized in client
uniform float max_dens_in_data; //for normalization of icnomming densities

varying vec2 vdensityVary;


void main() {
   float vdensity = vdensityVary[0] / max_dens_in_data;
   float one_minus_d = 1. - vdensity; // normalization done by gpu
   vec3 color = min_color * one_minus_d + max_color * vdensity;   
   float opacity = min(max(0., vdensity - min_density) / (max_density - min_density), 1.);

   vec4 newColor = vec4(color, opacity);
   gl_FragColor = min(newColor + gl_FragColor, 1.) ;   
   
   // gl_FragColor = vec4(max_density / max_dens_in_data,max_density / max_dens_in_data, max_density /max_dens_in_data, 0.2);
}




