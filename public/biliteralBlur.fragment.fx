precision highp float;

uniform sampler2D textureSampler;
uniform sampler2D depthSampler;
// uniform vec2 textureSize;
// uniform float radius; //Radius of the blur

// must be done
// uniform int maxFilterSize;
// uniform vec2 blurDir;
// uniform float projectedParticleConstant;
// uniform float depthThreshold;
varying vec2 vUV;

void main() {       
    // float depth = texture2D(textureSampler, vUV).x;
    // if (depth >= 1. || depth <= .06) discard;

    // vec3 finalColor = vec3(0.0);
    // float radius = 10.;    
    // float total = 0.0;
    // for (float dx = -radius; dx <= radius; dx++) {
    //     for (float dy = -radius; dy <= radius; dy++) {
    //         vec2 offset = vec2(dx, dy);
    //         // offset /= radius;
    //         // float weight = 1. - dot(offset / 10., offset / 10.)/ radius;
    //         float weight = 0.5;
    //         finalColor += texture2D(textureSampler, vUV + offset / 1000.).rgb / 100.;
    //         total += weight;
    //     }
    // }

    
    // gl_FragColor = vec4(finalColor, 1.0);
    // gl_FragColor = vec4(vec3(depth), 1.0);
    // vec3 r = texture2D(textureSampler, vUV).xyz;
    // vec3 r = vec3(texture2D(depthSampler, vUV).x);
    // vec3 r = texture2D(textureSampler, vUV).xyz * (1.-texture2D(depthSampler, vUV).x);
    // gl_FragColor = vec4(r, 1.0);
    gl_FragColor = vec4(vUV.x,vUV.y,0., 1.0);

    //here properly
    int maxFilterSize = 50;
    vec2 blurDir = vec2(1.,0.);
    float projectedParticleConstant = 10.;
    float depthThreshold = 1.;
    
    float depth = 1. - textureLod(depthSampler, vUV, 0.).x;

    if (depth >= 1. || depth <= 0.) {
        discard;
    }

    int filterSize = min(maxFilterSize, int(ceil(projectedParticleConstant / depth)));
    float sigma = float(filterSize) / 3.0;
    float two_sigma2 = 2.0 * sigma * sigma;

    float sigmaDepth = depthThreshold / 3.0;
    float two_sigmaDepth2 = 2.0 * sigmaDepth * sigmaDepth;

    float sum = 0.;
    float wsum = 0.;    

    for (int x = -filterSize; x <= filterSize; ++x) {
        vec2 coords = vec2(x);
        float sampleDepthVel = 1. - textureLod(depthSampler, vUV + coords * blurDir, 0.).r;

        float r = dot(coords, coords);
        float w = exp(-r / two_sigma2);

        float rDepth = sampleDepthVel - depth;
        float wd = exp(-rDepth * rDepth / two_sigmaDepth2);

        sum += sampleDepthVel * w * wd;        
        wsum += w * wd;
    }

    glFragColor = vec4(sum / wsum, 0., 0., 1.);

}