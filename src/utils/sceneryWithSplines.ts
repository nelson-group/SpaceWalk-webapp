import { Hdf5File } from "./hdf5_loader";
import { reshape, min, max, divide, MathType, subtract, norm, abs, ceil, pow } from "mathjs";
import { drawOutline } from "./outline";
import { drawSpheres } from "./spheres";
import { calcColor, buildGUI} from "./gui";
import { VectorFieldVisualizer } from "./arrow";

import { MeshBuilder, StorageBuffer, Scene, PointsCloudSystem, ArcRotateCamera, StandardMaterial, Vector3, Color3, Color4, Engine, CloudPoint, Texture, Vector2, Material, ShaderMaterial, Mesh, Nullable, AxesViewer, int, SubMesh, Octree, OctreeBlock, Vector4, double } from "@babylonjs/core";
import { AdvancedDynamicTexture, StackPanel } from "@babylonjs/gui";

export type camera_information_json = {
    x: number;
    y: number;
    z: number;    
    size: number;
}

export class CameraConfig {
    private static instance: CameraConfig;

    public viewboxCenter = new Vector3(25000, 25000, 25000);
    public cameraRadius = new Vector3(500);
    public viewboxVolume = this.cameraRadius._x * this.cameraRadius._y * this.cameraRadius._z 
    public viewboxMin = this.viewboxCenter.subtract(this.cameraRadius)
    public viewboxMax = this.viewboxCenter.add(this.cameraRadius) 

    private constructor() {
        
     }

    public static getInstance(): CameraConfig {
        if (!CameraConfig.instance) {
            CameraConfig.instance = new CameraConfig();
        }

        return CameraConfig.instance;
    }
        
    public getCameraConfig(): camera_information_json {
        return {x: this.viewboxCenter.x, y: this.viewboxCenter.y, z: this.viewboxCenter.z,  size: this.cameraRadius.x}
    }
}

function boxIntersect(minBox: Vector3, maxBox: Vector3, minCamera: Vector3, maxCamera: Vector3){
        let dx = min(maxBox._x, maxCamera._x) - max(minBox._x, minCamera._x)
        let dy = min(maxBox._y, maxCamera._y) - max(minBox._y, minCamera._y)
        let dz = min(maxBox._z, maxCamera._z) - max(minBox._z, minCamera._z)
        if (dx >= 0 && dy >= 0 && dz >= 0)
            return dx * dy * dz
        return 0 
}

function setCamera(canvas: HTMLCanvasElement, scene: Scene) {
    let cameraConfig = CameraConfig.getInstance()
    var camera = new ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 1.65, 1, cameraConfig.viewboxCenter, scene);    
    camera.attachControl(canvas, true);
    camera.zoomToMouseLocation = true;
    camera.inputs.addGamepad();
                      
    // console.log(distance, minCoords, targetPosition);
    camera.onViewMatrixChangedObservable.add(() => 
    {         
        if(cameraConfig.cameraRadius._x != camera.radius)
        {
            cameraConfig.cameraRadius = new Vector3(camera.radius);
            cameraConfig.viewboxVolume = cameraConfig.cameraRadius._x * cameraConfig.cameraRadius._y * cameraConfig.cameraRadius._z;
            cameraConfig.viewboxMin = cameraConfig.viewboxCenter.subtract(cameraConfig.cameraRadius);
            cameraConfig.viewboxMax = cameraConfig.viewboxCenter.add(cameraConfig.cameraRadius);

            return;
        }

        let viewboxMin = camera.target.subtract(cameraConfig.cameraRadius)
        let viewboxMax = camera.target.add(cameraConfig.cameraRadius)
        if (boxIntersect(viewboxMin, viewboxMax, cameraConfig.viewboxMin, cameraConfig.viewboxMax) / cameraConfig.viewboxVolume < 0.75)
        {
            cameraConfig.viewboxMin = viewboxMin
            cameraConfig.viewboxMax = viewboxMax
            cameraConfig.viewboxCenter = camera.target                    
        }                                
        
    });     
}

export async function createScene(canvas: HTMLCanvasElement, engine: Engine, colorConfig:Record<string,any>, timeConfig:Record<string,any>, displayOutline: boolean = true): Promise<[Scene, Mesh, StackPanel]>
 {    
    var scene = new Scene(engine);
    scene.createDefaultLight(true);
        var pcs = new PointsCloudSystem("pcs",2, scene); //size has no effect when using own shader. Maybe overwritten by shader? Ja, ist so.               
        var pcsMesh = await pcs.buildMeshAsync();    
        pcsMesh.hasVertexAlpha = true;                                                
        pcsMesh.showBoundingBox = true; 
    
        useOwnShaderForMesh(pcsMesh, scene, colorConfig);
        
        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");



        
        let guiPanel = buildGUI(advancedTexture, pcs, pcsMesh, colorConfig, timeConfig);
        setCamera(
            canvas,
            scene           
        );

    return [scene, pcsMesh, guiPanel];
}

function useOwnShaderForMesh(mesh: Mesh, scene: Scene, colorConfig:Record<string,any>)
{          
    // mesh.setVerticesData("densities", allDensitiesGlobal, false, 1);            
    var shaderMaterial = new ShaderMaterial("shader", scene, "./splineInterpolator",{                                    
    attributes: ["uv", "densities", "spline"],
    uniforms: ["worldViewProjection", "min_color", "max_color","min_density","max_density", "t"]                
    });                            
    shaderMaterial.setColor3("min_color", colorConfig.min_color);
    shaderMaterial.setColor3("max_color", colorConfig.max_color);
    // shaderMaterial.setFloat("min_density", colorConfig.min_density);
    // shaderMaterial.setFloat("max_density", colorConfig.max_density); 
    shaderMaterial.setFloat("t", 0);
    shaderMaterial.backFaceCulling = false;            
    shaderMaterial.pointsCloud = true;
    mesh.material = shaderMaterial;             
}
