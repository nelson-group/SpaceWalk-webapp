import { Hdf5File } from "./hdf5_loader";
import { reshape, min, max, divide, MathType, subtract, norm, abs, ceil, pow } from "mathjs";
import { drawOutline } from "./outline";
import { drawSpheres } from "./spheres";
import { calcColor, buildGUI, ColorConfig, useOwnShader, TimeConfig } from "./gui";
import { VectorFieldVisualizer } from "./arrow";

import { MeshBuilder, StorageBuffer, Scene, PointsCloudSystem, ArcRotateCamera, StandardMaterial, Vector3, Color3, Color4, Engine, CloudPoint, Texture, Vector2, Material, ShaderMaterial, Mesh, Nullable, AxesViewer, int, SubMesh, Octree, OctreeBlock, Vector4 } from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";



function setCamera(canvas: HTMLCanvasElement, scene: Scene, cameraPosition: Vector3, targetPosition: Vector3, minCoords:Nullable<Array<number>> = null, mesh: Nullable<Mesh> = null) {
    var camera = new ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 1.65, 1, cameraPosition, scene);
    camera.setTarget(targetPosition);
    camera.attachControl(canvas, true);
    camera.zoomToMouseLocation = true;
    
    if (mesh != null && minCoords != null)
    {           
        let targetPositionArray = [targetPosition.x, targetPosition.y, targetPosition.z] as Array<number>;
        let distance = norm(subtract(targetPositionArray, minCoords)) as number;
        // console.log(distance, minCoords, targetPosition);
        camera.onViewMatrixChangedObservable.add(() => 
        {              
            if (useOwnShader)
            {
                (mesh.material as ShaderMaterial).setFloat("distance", distance);
                (mesh.material as ShaderMaterial).setVector3("cameraPosition", camera.globalPosition);
                mesh.setVerticesData("splines", Array(0), false, 1); //TODO: need data from sockel
            }
        }); 
    }
}



export async function createScene(file_url: string, filename: string, partType: string, canvas: HTMLCanvasElement, engine: Engine, usePointCloudSystem: boolean = true, displayOutline: boolean = true) {    var scene = new Scene(engine);
    scene.createDefaultLight(true);

    var coordinatesPath = partType + "/Coordinates";
    var densityPath = partType + "/Density";

    var hdf5File = new Hdf5File();
    await hdf5File.open(file_url, filename);

    var allCoordsGlobal = hdf5File.getElements(coordinatesPath);
    let minCoords = min(allCoordsGlobal, 0);
    var coordinatesShape = hdf5File.getElementsShape(coordinatesPath);
    var allDensitiesGlobal = hdf5File.getElements(densityPath) as Array<number>;

    var maxDensity = max(allDensitiesGlobal) as number;
    allDensitiesGlobal = divide(allDensitiesGlobal, maxDensity) as Array<number>;    
    if (!usePointCloudSystem) {
        const wireFrameMaterial = new StandardMaterial("wireFrameMaterial", scene);
        wireFrameMaterial.wireframe = true;
        drawSpheres(scene, coordinatesShape, allCoordsGlobal, wireFrameMaterial);
        setCamera(
            canvas,
            scene,
            new Vector3(minCoords[0], minCoords[1], minCoords[2]),
            new Vector3(allCoordsGlobal[1][0], allCoordsGlobal[1][1], allCoordsGlobal[1][2])
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
        }                
                
        var pcs = new PointsCloudSystem("pcs",2, scene); //size has no effect when using own shader. Maybe overwritten by shader? Ja, ist so.
        pcs.addPoints(coordinatesShape[0], positionAndColorParticles);                
        var pcsMesh = await pcs.buildMeshAsync();    
        pcsMesh.hasVertexAlpha = true;                                                
        pcsMesh.showBoundingBox = true; 

        var originalPcsMaterial: Nullable<Material> = null;           
        if (useOwnShader)       
            originalPcsMaterial = useOwnShaderForMesh(pcsMesh, scene, colorConfig,allDensitiesGlobal);
        
        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        var timeConfig = {
            "current_snapnum": 75,
            "min_snapnum": 0,
            "max_snapnum": 99,
            "number_of_interpolations": 100,
            "is_active": false,
            "t": 0,
            "text_object_snapnum": null,
            "slider_object_snapnum": null,
            "text_object_interpolation": null,            
            "minimum_fps": 3,
            "mesh": pcsMesh
        } 

        buildGUI(advancedTexture, pcs, originalPcsMaterial, pcsMesh, colorConfig, timeConfig, allDensitiesGlobal);
        setCamera(
            canvas,
            scene,
            new Vector3(minCoords[0], minCoords[1], minCoords[2]),
            new Vector3(allCoordsGlobal[1][0], allCoordsGlobal[1][1], allCoordsGlobal[1][2]),            
            minCoords,
            pcsMesh
        );
        
    }

    

    return scene;
}

function useOwnShaderForMesh(mesh: Mesh, scene: Scene, colorConfig:ColorConfig, allDensitiesGlobal: number[]): Nullable<Material>
{          
    mesh.setVerticesData("densities", allDensitiesGlobal, false, 1);            
    var shaderMaterial = new ShaderMaterial("shader", scene, "./scatteredDataWithSize",{                                    
    attributes: ["uv", "densities", "spline"],
    uniforms: ["worldViewProjection", "min_color", "max_color","min_density","max_density", "cameraPosition", "t"]                
    });                            
    shaderMaterial.setColor3("min_color", colorConfig.min_color);
    shaderMaterial.setColor3("max_color", colorConfig.max_color);
    shaderMaterial.setFloat("min_density", colorConfig.min_density);
    shaderMaterial.setFloat("max_density", colorConfig.max_density);        
    shaderMaterial.setVector3("cameraPosition", Vector3.Zero());
    shaderMaterial.setFloat("t", 0);
    shaderMaterial.backFaceCulling = false;            
    shaderMaterial.pointsCloud = true;
    let tmpMaterial = mesh.material;
    mesh.material = shaderMaterial; 
    return tmpMaterial;               
}
