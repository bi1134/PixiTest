import { Filter, GlProgram } from "pixi.js";

const fragment = `
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform float uProgress;
uniform float uAlpha;

void main() {
    vec4 color = texture(uTexture, vTextureCoord);
    
    // Diagonal band logic
    // We want a band that moves from -0.5 to 1.5 roughly based on progress
    // x + y * 0.5 (tilt)
    
    float tilt = 0.5;
    float bandWidth = 0.2;
    // Changed to minus to create slash down shape
    float pos = vTextureCoord.x - vTextureCoord.y * tilt; 
    
    // Map progress (0 to 1) roughly to cover range:
    // Min value at (0, 1) = -0.5
    // Max value at (1, 0) = 1.0
    float start = -0.5 - bandWidth * 2.0;
    float end = 1.0 + bandWidth * 2.0;
    float currentPos = start + (end - start) * uProgress;
    
    float dist = abs(pos - currentPos);
    
    // Smoothstep for soft edges
    float glare = smoothstep(bandWidth, 0.0, dist);
    
    // Additive glare 
    // Multiply by color.a to ensure transparency is respected (Cut Corners)
    vec3 glareColor = vec3(1.0, 1.0, 1.0) * glare * uAlpha * color.a;
    
    finalColor = vec4(color.rgb + glareColor, color.a);
}
`;

const vertex = `
in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

void main(void)
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    // FLIPPED Y for correct orientation
    position.y = (position.y * (2.0 / uOutputTexture.y) - 1.0) * -1.0; 
    
    gl_Position = vec4(position, 0.0, 1.0);
    vTextureCoord = aPosition * (uOutputFrame.zw * uInputSize.zw);
}
`;

export class GlareFilter extends Filter {
    constructor() {
        super({
            glProgram: new GlProgram({
                vertex,
                fragment,
                name: "glare-filter",
            }),
            resources: {
                glareUniforms: {
                    uProgress: { value: 0, type: "f32" },
                    uAlpha: { value: 1, type: "f32" },
                },
            },
        });
    }

    public get progress(): number {
        return this.resources.glareUniforms.uniforms.uProgress;
    }
    public set progress(value: number) {
        this.resources.glareUniforms.uniforms.uProgress = value;
    }

    public get alpha(): number {
        return this.resources.glareUniforms.uniforms.uAlpha;
    }
    public set alpha(value: number) {
        this.resources.glareUniforms.uniforms.uAlpha = value;
    }
}
