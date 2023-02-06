import { Scene, StandardMaterial, TransformNode, CreateCylinder, Color3} from "@babylonjs/core";

export class VectorFieldVisualizer {
    private arrowMaterial: StandardMaterial;
    private scene: Scene;
    constructor(scene: Scene) {
        this.scene = scene;
        this.arrowMaterial = new StandardMaterial("", scene);
    }


    createArrow(scene: Scene = this.scene, material: StandardMaterial = this.arrowMaterial, thickness: number = 1, isCollider = false): TransformNode {
        const arrow = new TransformNode("arrow", scene);
        const cylinder = CreateCylinder("cylinder", { diameterTop: 0, height: 0.075, diameterBottom: 0.0375 * (1 + (thickness - 1) / 4), tessellation: 96 }, scene);
        const line = CreateCylinder("cylinder", { diameterTop: 0.005 * thickness, height: 0.275, diameterBottom: 0.005 * thickness, tessellation: 96 }, scene);
    
        // Position arrow pointing in its drag axis
        cylinder.parent = arrow;
        cylinder.material = material;
        cylinder.rotation.x = Math.PI / 2;
        cylinder.position.z += 0.3;
    
        line.parent = arrow;
        line.material = material;
        line.position.z += 0.275 / 2;
        line.rotation.x = Math.PI / 2;
    
        if (isCollider) {
            line.visibility = 0;
            cylinder.visibility = 0;
        }
        return arrow;
    }
}