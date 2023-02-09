precision highp float;

varying vec4 vColor;
varying vec2 vUV;

void main() {
   // vec4 newColor = clamp(gl_FragColor + vColor,0,1);   
   gl_FragColor = vec4(vColor);
}