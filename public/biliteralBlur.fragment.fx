uniform sampler2D textureSampler;
uniform sampler2D depthSampler;

uniform vec2 blurDir;

// uniform int filterSize;
// uniform float depthThreshold;
// uniform float normalThreshold;

#define teiler 1.
#define teilung 1./teiler
varying vec2 vUV;

void main(void) {
    vec3 color = textureLod(textureSampler, vUV, 0.).rgb;
    float depth = 1. - textureLod(depthSampler, vUV, 0.).x;

    if (depth >= 1. || depth <= 0.) 
        discard; 


    int filterSize = 100;
    float depthThreshold = 0.2;

    float sigma = float(filterSize);
    float two_sigma2 = 2.0 * sigma * sigma;

    float sigmaDepth = depthThreshold;
    // float two_sigmaDepth2 = 2.0 * sigmaDepth * sigmaDepth;

    // float sigmaNormal = normalThreshold;
    // float two_sigmaNormal2 = 2.0 * sigmaNormal * sigmaNormal;

    vec3 sum = vec3(0.);
    float wsum = 0.;

    for (int x = -filterSize; x <= filterSize; ++x) {
        vec2 coords = vec2(x);
        vec3 sampleColor = textureLod(textureSampler, vUV + coords * blurDir / 100., 0.).rgb;
        float sampleDepth = 1. - textureLod(depthSampler, vUV + coords * blurDir / 100., 0.).r;
        // vec3 sampleNormal = textureLod(normalSampler, vUV + coords * blurDir, 0.).rgb;

        float r = dot(coords, coords);
        float w = exp(-r / two_sigma2);

        float depthDelta = abs(sampleDepth - depth);
        float wd = step(depthDelta, depthThreshold);

        // vec3 normalDelta = abs(sampleNormal - normal);
        // float wn = step(normalDelta.x + normalDelta.y + normalDelta.z, normalThreshold);

        sum += sampleColor * w * wd;
        wsum += w * wd;
    }

    glFragColor = vec4(sum / wsum, 1.); 
    // glFragColor = vec4(vec3(1), );
}