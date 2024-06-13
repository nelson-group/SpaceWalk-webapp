import { Hdf5File } from "./hdf5_loader";
import { reshape, min, max, divide, MathType, subtract, norm, abs, ceil, pow } from "mathjs";
import { drawOutline } from "./outline";
import { drawSpheres } from "./spheres";
import { calcColor, buildGUI} from "./gui";
import { VectorFieldVisualizer } from "./arrow";

import { Scene, Matrix, ArcRotateCamera, Vector3, Engine, ShaderMaterial, Mesh, StandardMaterial, PushMaterial, CloudPoint, Color4, Nullable, UniversalCamera, FreeCameraKeyboardMoveInput, ArcRotateCameraKeyboardMoveInput, Camera, Color3, Material } from "@babylonjs/core";
import { AdvancedDynamicTexture, StackPanel } from "@babylonjs/gui";
import { DownloadControl } from "..";

export type camera_information_json = {
    x: number;
    y: number;
    z: number;    
    size: number;
}

export class CameraConfig {
    private static instance: CameraConfig;

    public cameraInfoText:Nullable<HTMLElement>
    public viewboxCenter:Vector3
    public cameraRadius:Vector3
    public viewboxVolume:number
    public viewboxMin:Vector3
    public viewboxMax:Vector3
    public simulationBoxSize: number    
    public camera: Nullable<ArcRotateCamera>

    private constructor() {
        this.viewboxCenter = new Vector3(4418.633198653534, 22094.21741225524, 16017.983243107832); // new Vector3(7218.33, 24516.7, 21434.0);
        this.cameraRadius = new Vector3(200,200,200);
        this.viewboxVolume = this.cameraRadius._x * this.cameraRadius._y * this.cameraRadius._z * 8 // * 8 kommt, weil es nur der Radius ist, der Durchmesser jedoch benötigt wird und man eigentlich x, y und z noch mal 2 machen müsste woraus sich * 2 * 2 * 2 ergibt ==> * 8
        this.viewboxMin = this.viewboxCenter.subtract(this.cameraRadius)
        this.viewboxMax = this.viewboxCenter.add(this.cameraRadius)
        this.cameraInfoText = null
        this.simulationBoxSize = 0
        this.camera = null
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

    public setCameraInfoText(htmlElement: HTMLElement)
    {
        this.cameraInfoText = htmlElement;
        return true;
    }
    public updateCameraInfoText(radius: number, target: Vector3, position: Vector3)
    {
        if (!this.cameraInfoText)
        return false

        this.cameraInfoText.innerHTML = "Camera info: Radius: " + radius + "; Position: ("+ position.x + ", " + position.y +  ", " + position.z + ")"+ "; Target: ("+ target.x + ", " + target.y +  ", " + target.z + ")" ;
        return true;
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

function setCamera(canvas: HTMLCanvasElement, scene: Scene,  timeConfig:Record<string,any>) {
    let cameraConfig = CameraConfig.getInstance()
    var camera = new ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 1.65, cameraConfig.cameraRadius.x, cameraConfig.viewboxCenter, scene);    
    cameraConfig.camera = camera;    
    (timeConfig.material as ShaderMaterial).setVector3("camera_pos", camera.position);
    camera.attachControl(canvas, true);
    
    (camera.inputs.attached.keyboard as ArcRotateCameraKeyboardMoveInput).panningSensibility = 1;

    camera.onViewMatrixChangedObservable.add(() => 
    {       
        cameraConfig.updateCameraInfoText(camera.radius, camera.target, camera.position);
        (timeConfig.material as ShaderMaterial).setVector3("camera_pos", camera.position);        
        if(cameraConfig.cameraRadius._x != camera.radius)
        {
            cameraConfig.cameraRadius = new Vector3(camera.radius, camera.radius,camera.radius);
            cameraConfig.viewboxVolume = cameraConfig.cameraRadius._x * cameraConfig.cameraRadius._y * cameraConfig.cameraRadius._z;
            cameraConfig.viewboxMin = cameraConfig.viewboxCenter.subtract(cameraConfig.cameraRadius);
            cameraConfig.viewboxMax = cameraConfig.viewboxCenter.add(cameraConfig.cameraRadius);
            DownloadControl.finishedDownload = false             
        }

        let viewboxMin = camera.target.subtract(cameraConfig.cameraRadius)
        let viewboxMax = camera.target.add(cameraConfig.cameraRadius)
        if (boxIntersect(viewboxMin, viewboxMax, cameraConfig.viewboxMin, cameraConfig.viewboxMax) / cameraConfig.viewboxVolume < 0.95)
        {
            cameraConfig.viewboxMin = viewboxMin
            cameraConfig.viewboxMax = viewboxMax
            cameraConfig.viewboxCenter = camera.target 
            DownloadControl.finishedDownload = false                
        }   
        let distanceCamera2target = (camera.position.subtract(camera.target)).length(); 
        let maxViewOfCamera = distanceCamera2target * 3 //empirical value
        camera.maxZ = maxViewOfCamera; 
        (timeConfig.material as ShaderMaterial).setFloat("farPlane",maxViewOfCamera-0.5); //must be a bit smaller than maxViewOfCamera such that the points beginn with color 0.        
    });     
}

export async function createScene(canvas: HTMLCanvasElement, engine: Engine, colorConfig:Record<string,any>, timeConfig:Record<string,any>, displayOutline: boolean = true, initial_data: Record<string,any>): Promise<[Scene, ShaderMaterial, StackPanel]>
 {    
    CameraConfig.getInstance().simulationBoxSize = initial_data["BoxSize"]
    var scene = new Scene(engine);
    
    scene.clearColor = (new Color3(0.06,0.06,0.09)).toColor4(1); // background color
    // var pcs = new PointsCloudSystem("pcs",20, scene, { updatable: true }); //size has no effect when using own shader. Maybe overwritten by shader? Ja, ist so.               
    // pcs.addPoints(500, testFunc);
    // var mesh = await pcs.buildMeshAsync();    
    let material = createMaterial(scene, colorConfig, timeConfig)    

    var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

    let guiPanel = buildGUI(advancedTexture, material, colorConfig, timeConfig, CameraConfig.getInstance());
    setCamera(
        canvas,
        scene,
        timeConfig          
    );

    return [scene, material, guiPanel];
}


function createMaterial(scene:Scene, colorConfig:Record<string,any>, timeConfig:Record<string,any>):ShaderMaterial{
    // mesh.setVerticesData("densities", allDensitiesGlobal, false, 1);            
    var shaderMaterial = new ShaderMaterial("shader", scene, "./splineInterpolator",{                                    
        attributes: ["position", "densities", "voronoi", "splinesA", "splinesB", "splinesC"],
        uniforms: ["farPlane","worldViewProjection","projection","view", "world","scale", "camera_pos", "min_color", "max_color","min_density","max_density","kernel_scale","point_size", "t"]                
        });                            
    shaderMaterial.setColor3("min_color", colorConfig.min_color);
    shaderMaterial.setColor3("max_color", colorConfig.max_color);        
    shaderMaterial.setFloat("min_density", colorConfig.quantiles[colorConfig.start_quantile-10]);
    shaderMaterial.setFloat("max_density", colorConfig.quantiles[colorConfig.start_quantile+10]);
    shaderMaterial.setFloat("kernel_scale", 12);
    shaderMaterial.setFloat("point_size", 12);
    shaderMaterial.setFloat("scale", 100);
    shaderMaterial.setFloat("farPlane", 200*3); // just any initial value because gets updated from camera change
    shaderMaterial.backFaceCulling = false;   
    shaderMaterial.pointsCloud = true;
    shaderMaterial.forceDepthWrite = true;
    // (shaderMaterial as Material).useLogarithmicDepth = true;
    shaderMaterial.alphaMode = colorConfig.blendig_modes[1][1];
    timeConfig.material = shaderMaterial;
    
    return shaderMaterial
    }
    

