import { Filter } from 'pixi.js';

const fragment = `
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform float uAlpha;

void main() {
    vec4 color = texture(uTexture, vTextureCoord);
    
    // Calculate standard Luma for grayscale
    float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    
    // Determine if the pixel is "Red"
    // We check if Red is significantly higher than the average of Green and Blue
    float avgGB = (color.g + color.b) * 0.5;
    float redDiff = color.r - avgGB;
    
    // Create a smooth mask for red pixels
    // Values below 0.15 will be fully grayscale
    // Values above 0.35 will be fully original color
    float isRed = smoothstep(0.15, 0.35, redDiff);
    
    // Target color is grayscale, but we mix the original color back in if it's red
    vec3 targetColor = mix(vec3(luma), color.rgb, isRed);
    
    // Finally mix between the completely original color and our target effect based on the GSAP alpha
    vec3 result = mix(color.rgb, targetColor, uAlpha);
    
    finalColor = vec4(result * color.a, color.a);
}
`;

export class SelectiveRedFilter {
    public static create(): Filter {
        return Filter.from({
            gl: {
                vertex: `
                    in vec2 aPosition;
                    out vec2 vTextureCoord;

                    uniform vec4 uInputSize;
                    uniform vec4 uOutputFrame;
                    uniform vec4 uOutputTexture;

                    vec4 filterVertexPosition(void) {
                        vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
                        position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
                        position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
                        return vec4(position, 0.0, 1.0);
                    }

                    vec2 filterTextureCoord(void) {
                        return aPosition * (uOutputFrame.zw * uInputSize.zw);
                    }

                    void main(void) {
                        gl_Position = filterVertexPosition();
                        vTextureCoord = filterTextureCoord();
                    }
                `,
                fragment: fragment
            },
            resources: {
                filterUniforms: {
                    uAlpha: { value: 0.0, type: 'f32' }
                }
            }
        });
    }
}
