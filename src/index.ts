import { createScene, CameraConfig } from "./utils/sceneryWithSplines";  
 
const file_url = "data/tng/subhalos/70/442304/cutout_70_442304_70.hdf5";
const filename = "XYZ";
const partType = "PartType0";

import { Engine, Nullable, Mesh, Color3, ShaderMaterial, PointsCloudSystem, CloudPoint, Vector3 } from "@babylonjs/core";
import { number } from "mathjs";
import {StackPanel, Slider} from "@babylonjs/gui"

let dowloadInProcess = false
let finishedDownload = false

var timeConfig = {
    "current_snapnum": 75,
    "min_snapnum": 0,
    "max_snapnum": 98,
    "number_of_interpolations": 100,
    "is_active": false,
    "t": 0,
    "text_object_snapnum": null,
    "slider_object_snapnum": null,
    "text_object_interpolation": null,            
    "minimum_fps": 3    
} 

var colorConfig = {
    "min_color": new Color3(0, 0, 0),
    "max_color": new Color3(1, 1, 1),
    "min_density": 0,
    "max_density": 0,
    "automatic_opacity": false,
};

const url = "http://127.0.0.1:8000/v1/get/splines/";
let simulationName = "TNG50-4"
let node_indices:Array<number> = [];
let level_of_detail:Record<number,number> = {};
let batch_size_lod = 500;

async function main() {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    const divFPS = document.getElementById("fps")!;
    const divDownloading = document.getElementById("downloading")!;

    var engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    var [scene, pcs, material, guiPanel] = await createScene(canvas, engine, colorConfig, timeConfig, true);
    let minSlider:Nullable<Slider> = guiPanel.getChildByName("min_opacity_slider") as Slider
    let maxSlider:Nullable<Slider> = guiPanel.getChildByName("max_opacity_slider") as Slider
    window.addEventListener('resize', function () {
        engine.resize();
    });

    engine.runRenderLoop(function () {
        divFPS.innerHTML = engine.getFps().toFixed() + " fps";
        scene.render();
        if(!dowloadInProcess && !finishedDownload)        
        {
            dowloadInProcess = true;
            const payload = {
                    "node_indices": node_indices,
                    "level_of_detail": level_of_detail,
                    "batch_size_lod": batch_size_lod,
                    "camera_information": CameraConfig.getInstance().getCameraConfig()
              };
            
            fetch(url + simulationName + "/" + timeConfig.current_snapnum, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'                  
                },
                body: JSON.stringify(payload)
              })
                .then(response => {
                  if (!response.ok) {
                    throw new Error('Network response was not ok');
                  }
                  return response.json();
                })
                .then(data => {
                console.log('Success:', data);
                if ((data.splines as Array<any>).length == 0)
                {
                    divDownloading.innerHTML = "download finished";
                    finishedDownload = true
                    return
                }

                  guiUpdate(data, colorConfig, minSlider, maxSlider);
                  updateMesh(data, pcs, material)
                  updateMetaDataOnClient(data);
                
                  dowloadInProcess = false;
                })
                .catch(error => {
                  console.error('Error:', error);
                  dowloadInProcess = false;
                });
        }        
    });

}

await main();
async function guiUpdate(dataResponse: Record<string,any>, colorConfig: Record<string,any>, minSlider:Nullable<Slider>, maxSlider:Nullable<Slider>) {
    if (colorConfig.min_density != dataResponse.min_density || 
        colorConfig.max_density != dataResponse.max_density)
      {
        colorConfig.min_density = dataResponse.min_density
        colorConfig.max_density = dataResponse.max_density
        if (minSlider && maxSlider)
        {
            minSlider.minimum = colorConfig.min_density
            maxSlider.minimum = colorConfig.min_density
            minSlider.maximum = colorConfig.max_density
            maxSlider.maximum = colorConfig.max_density
        }
      }
}

function updateMetaDataOnClient(data: Record<string,any>) {
    level_of_detail = data.level_of_detail
    node_indices = data.node_indices    
}

let initVector = new Vector3(0,0,0)
function placeholderForShader(particle:CloudPoint, i: number, _s: number){
    particle.position = initVector;
}

async function updateMesh(data: Record<string,any>, pcs: PointsCloudSystem, material: ShaderMaterial) {    
    pcs.addPoints((data.splines as Array<any>).length, placeholderForShader);      
    var pcsMesh = await pcs.buildMeshAsync();
    
    pcsMesh.hasVertexAlpha = true;                                                
    pcsMesh.showBoundingBox = true;
    pcsMesh.material = material;
    pcsMesh.setVerticesData("splines", data.splines, false, 1);
    pcsMesh.setVerticesData("densities", data.densities, false, 1);
}


