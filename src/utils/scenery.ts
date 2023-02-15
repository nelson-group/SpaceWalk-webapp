import { Hdf5File } from "./hdf5_loader";
import { reshape, min, max, divide, MathType, subtract, norm, abs, ceil, pow } from "mathjs";
import { drawOutline } from "./outline";
import { drawSpheres } from "./spheres";
import { calcColor, buildGUI, ColorConfig, useOwnShader } from "./gui";
import { VectorFieldVisualizer } from "./arrow";

import { MeshBuilder, StorageBuffer, Scene, PointsCloudSystem, ArcRotateCamera, StandardMaterial, Vector3, Color3, Color4, Engine, CloudPoint, Texture, Vector2, Material, ShaderMaterial, Mesh, Nullable, AxesViewer, int, SubMesh, Octree, OctreeBlock } from "@babylonjs/core";
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
            // particle.uv = new Vector2(64,64);            
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
        buildGUI(advancedTexture, pcs, originalPcsMaterial, pcsMesh, colorConfig, allDensitiesGlobal);
        setCamera(
            canvas,
            scene,
            new Vector3(minCoords[0], minCoords[1], minCoords[2]),
            new Vector3(allCoordsGlobal[1][0], allCoordsGlobal[1][1], allCoordsGlobal[1][2]),            
            minCoords,
            pcsMesh
        );
        
        let pcsMesh2 = pcsMesh.clone("pcsMesh2");
        pcsMesh2.visibility = 0;
        pcsMesh2.useOctreeForPicking = true;
        // pcsMesh.useOctreeForCollisions = true;
        
        // console.log(pcsMesh.subMeshes);
        let numberOfParticlesPerLeaf = 8;
        let idArray = [...Array(coordinatesShape[0]).keys()];
        // console.log(pcsMesh.subMeshes);
        pcsMesh2.setIndices(idArray);
        pcsMesh2.subdivide(idArray.length / numberOfParticlesPerLeaf); //make around enough submeshes such that numberOfLeaves are fullfilled per submesh, which is to iterate then
        // console.log(pcsMesh.subMeshes);
        let depth = 5;
        let numberOfLeafs = ceil(pcsMesh2.subMeshes.length / (pow(8, depth) as number));
        pcsMesh2.createOrUpdateSubmeshesOctree(numberOfLeafs, depth);
        pcsMesh2.isPickable = false;
        // let test = pcsMesh2.intersectsPoint(new Vector3(allCoordsGlobal[0][0],allCoordsGlobal[0][1],allCoordsGlobal[0][2]));
        // console.log(pcsMesh2.intersectsPoint(new Vector3(0,0,0)));
        // console.log(pcsMesh2.intersectsPoint(new Vector3(minCoords[0], minCoords[1], minCoords[2])));
        // console.log(test);
        // console.log(pcsMesh2._submeshesOctree);
        // let test2 = pcsMesh2._submeshesOctree.intersects(new Vector3(allCoordsGlobal[0][0],allCoordsGlobal[0][1],allCoordsGlobal[0][2]), 1e-10, false)
        // console.log(test2);

        let entities = Array<OctreeBlock<any>>();
        pcsMesh2._submeshesOctree.blocks.forEach(element => {
            entities.push(element);});
            console.log(entities);
        let counter = 0;
        for (let index = 0; index < entities.length; index++) {
            const element = entities[index];
            console.log(index);                    
            element.blocks.forEach(element2 => { 
                    if(element2.blocks)                    
                    entities.push(element2);
                    else
                    if(element2.entries.length > 0){
                        element2.entries.forEach(element3 => {
                            if (element3 instanceof SubMesh)
                                counter++;
                        // console.log(entities.length + ":" + counter);
                        })
                    }
                
                })
            };                                                            
        

        console.log("done:" + counter);

    }

    

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
