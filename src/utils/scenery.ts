import { Hdf5File } from "./hdf5_loader";
import { reshape, min, max, divide, MathType, subtract, norm } from "mathjs";
import { drawOutline } from "./outline";
import { drawSpheres } from "./spheres";
import { calcColor, buildGUI, ColorConfig, useOwnShader } from "./gui";
import { VectorFieldVisualizer } from "./arrow";

import { MeshBuilder, StorageBuffer, Scene, PointsCloudSystem, ArcRotateCamera, StandardMaterial, Vector3, Color3, Color4, Engine, CloudPoint, Texture, Vector2, Material, ShaderMaterial, Mesh, Nullable, AxesViewer } from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";

function setCamera(canvas: HTMLCanvasElement, scene: Scene, cameraPosition: Vector3, targetPosition: Vector3, mesh: Nullable<Mesh> = null) {
    var camera = new ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 1.65, 1, cameraPosition, scene);
    camera.setTarget(targetPosition);
    camera.attachControl(canvas, true);
    camera.zoomToMouseLocation = true;
    
    if (mesh != null)
    {
        let nominator = Vector3.Distance(targetPosition, cameraPosition)
        camera.onViewMatrixChangedObservable.add(() => 
        {        
            let distance = nominator / Vector3.Distance(targetPosition, camera.globalPosition);            
            
            // console.log(nominator + ":" + Vector3.Distance(targetPosition, camera.globalPosition));
            console.log(camera._worldMatrix);
            if (useOwnShader)
            {
                (mesh.material as ShaderMaterial).setFloat("distance", distance);
                (mesh.material as ShaderMaterial).setVector3("cameraPosition", camera.globalPosition);
            }
        });
    }
}

export async function createScene(file_url: string, filename: string, partType: string, canvas: HTMLCanvasElement, engine: Engine, usePointCloudSystem: boolean = true, displayOutline: boolean = true) {
    var scene = new Scene(engine);
    scene.createDefaultLight(true);

    var coordinatesPath = partType + "/Coordinates";
    var densityPath = partType + "/Density";

    var hdf5File = new Hdf5File();
    await hdf5File.open(file_url, filename);

    var allCoordsGlobal = hdf5File.getElements(coordinatesPath);
    var coordinatesShape = hdf5File.getElementsShape(coordinatesPath);
    var allDensitiesGlobal = hdf5File.getElements(densityPath) as Array<number>;

    var maxDensity = max(allDensitiesGlobal) as number;
    allDensitiesGlobal = divide(allDensitiesGlobal, maxDensity) as Array<number>;
    const axes = new AxesViewer(scene, 100);    
    if (!usePointCloudSystem) {
        const wireFrameMaterial = new StandardMaterial("wireFrameMaterial", scene);
        wireFrameMaterial.wireframe = true;
        drawSpheres(scene, coordinatesShape, allCoordsGlobal, wireFrameMaterial);
        setCamera(
            canvas,
            scene,
            new Vector3(allCoordsGlobal[1][0], allCoordsGlobal[1][1], allCoordsGlobal[1][2]),
            new Vector3(allCoordsGlobal[0][0], allCoordsGlobal[0][1], allCoordsGlobal[0][2])                
        );
    }
    else {
        var colorConfig = {
            "min_color": new Color3(0, 0, 0),
            "max_color": new Color3(1, 1, 1),
            "min_density": min(allDensitiesGlobal),
            "max_density": max(allDensitiesGlobal),
            "automatic_opacity": false,
        };
        var positionAndColorParticles = function (particle: CloudPoint, i: number, _s: number) {
            particle.position = new Vector3(allCoordsGlobal[i][0], allCoordsGlobal[i][1], allCoordsGlobal[i][2]);
            particle.color = calcColor(colorConfig, allDensitiesGlobal[i]); //still needed for not own shader part
            // particle.uv = new Vector2(64,64);            
        }                

        var pcs = new PointsCloudSystem("pcs",2, scene); //size has no effect when using own shader. Maybe overwritten by shader? Ja, ist so.
        pcs.addPoints(coordinatesShape[0], positionAndColorParticles);                
        var pcsMesh = await pcs.buildMeshAsync();
        pcsMesh.hasVertexAlpha = true;                                                
        pcsMesh.showBoundingBox = true; 
        axes.xAxis.parent = pcsMesh;
        axes.yAxis.parent = pcsMesh;
        axes.zAxis.parent = pcsMesh;

        var originalPcsMaterial: Nullable<Material> = null;           
        if (useOwnShader)       
            originalPcsMaterial = useOwnShaderForMesh(pcsMesh, scene, colorConfig,allDensitiesGlobal);
        
        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        buildGUI(advancedTexture, pcs, originalPcsMaterial, pcsMesh, colorConfig, allDensitiesGlobal);
        setCamera(
            canvas,
            scene,
            new Vector3(allCoordsGlobal[1][0], allCoordsGlobal[1][1], allCoordsGlobal[1][2]),
            new Vector3(allCoordsGlobal[0][0], allCoordsGlobal[0][1], allCoordsGlobal[0][2]),
            pcsMesh        
        );
    }    

    const arrow = new VectorFieldVisualizer(scene);
    arrow.createArrow();

    // if (displayOutline) { //not needed anymore since the mesh itself provides boundingboxes
    //     // drawOutline(allCoordsGlobal, scene);
    // }

    return scene;
}

function useOwnShaderForMesh(mesh: Mesh, scene: Scene, colorConfig:ColorConfig, allDensitiesGlobal: number[]): Nullable<Material>
{          
    mesh.setVerticesData("densities", allDensitiesGlobal, false, 1);        
    var shaderMaterial = new ShaderMaterial("shader", scene, "./scatteredDataWithSize",{                                    
    attributes: ["position", "uv", "densities"],
    uniforms: ["worldViewProjection", "min_color", "max_color","min_density","max_density", "distance", "cameraPosition"]                
    });                        
    shaderMaterial.setColor3("min_color", colorConfig.min_color);
    shaderMaterial.setColor3("max_color", colorConfig.max_color);
    shaderMaterial.setFloat("min_density", colorConfig.min_density);
    shaderMaterial.setFloat("max_density", colorConfig.max_density);    
    shaderMaterial.setFloat("distance", 1);
    shaderMaterial.setVector3("cameraPosition", Vector3.Zero());
    shaderMaterial.backFaceCulling = false;            
    shaderMaterial.pointsCloud = true;
    let tmpMaterial = mesh.material;
    mesh.material = shaderMaterial; 
    return tmpMaterial;               
}

////////////// working shader example ////////////////////////////////
// var shaderMaterial = new ShaderMaterial("shader", scene, "./scatteredDataWithSize",{                                    
//     attributes: ["position", "uv","densities"],
//     uniforms: ["worldViewProjection"]                
// });                    
// shaderMaterial.backFaceCulling = false;
// var mainTexture = new Texture("data/textures/Dot.png", scene);

// shaderMaterial.setTexture("textureSampler", mainTexture);

// var minCoords = min(allCoordsGlobal, 0);
// var maxCoords = max(allCoordsGlobal, 0);

// var boxSize = subtract(maxCoords, minCoords);

// var centerOfBox = subtract(maxCoords, divide(boxSize, 2));

// var box = MeshBuilder.CreateBox(
// "shader",
// { width: boxSize[0], height: boxSize[1], depth: boxSize[2] },
// scene
// );            
// box.material = shaderMaterial;    
// box.position.x = centerOfBox[0];
// box.position.y = centerOfBox[1];
// box.position.z = centerOfBox[2];