import { createScene, CameraConfig } from "./utils/sceneryWithSplines";  

import { Engine, Nullable, Mesh, Color3, ShaderMaterial, PointsCloudSystem, CloudPoint, Vector3, Scene, FloatArray } from "@babylonjs/core";
import { max, number } from "mathjs";
import {StackPanel, Slider} from "@babylonjs/gui"

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
    "minimum_fps": 25
} 

export class DownloadControl{
  public static downloadInProcess = false
  private static _finishedDownload = false
  private static _downloadHTML = document.getElementById("downloading")!;

  public static get finishedDownload() {
    return this._finishedDownload;
  }

  public static set finishedDownload(finishedDownload: boolean) {  
    if (!finishedDownload)
      this._downloadHTML.innerHTML = "Downloading";
    else
      this._downloadHTML.innerHTML = "Download finished";
      
    this._finishedDownload = finishedDownload;
  }

  
}


var colorConfig = {
    "min_color": new Color3(0, 0, 0),
    "max_color": new Color3(1, 1, 1),
    "min_density": 0,
    "max_density": 1e-12,
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
    

    var engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    var [scene, material, guiPanel] = await createScene(canvas, engine, colorConfig, timeConfig, true);
    let minSlider:Nullable<Slider> = guiPanel.getChildByName("min_opacity_slider") as Slider
    let maxSlider:Nullable<Slider> = guiPanel.getChildByName("max_opacity_slider") as Slider
    window.addEventListener('resize', function () {
        engine.resize();
    });

    engine.runRenderLoop(function () {
        divFPS.innerHTML = engine.getFps().toFixed() + " fps";
        scene.render();
        // if (call < 1)
        if(!DownloadControl.downloadInProcess && !DownloadControl.finishedDownload)        
        {
          DownloadControl.downloadInProcess = true;
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
                // console.log('Success:', data);
                if ((data.splines_a as Array<any>).length == 0)
                {                    
                    DownloadControl.finishedDownload = true;
                    DownloadControl.downloadInProcess = false
                    return
                }
                // if (call < 1)
                  guiUpdate(data, colorConfig, minSlider, maxSlider, material);                                    
                  updateMesh(data, material, scene)
                  updateMetaDataOnClient(data);                  
                  DownloadControl.downloadInProcess = false;
                })
                .catch(error => {
                  console.error('Error:', error);
                  DownloadControl.downloadInProcess = false;
                });
        }        
    });

}

await main();
async function guiUpdate(dataResponse: Record<string,any>, colorConfig: Record<string,any>, minSlider:Nullable<Slider>, maxSlider:Nullable<Slider>, material:ShaderMaterial) {
  let change = false  
    if (colorConfig.min_density > dataResponse.min_density)
    {
      colorConfig.min_density = dataResponse.min_density       
      change = true
    }
    else if (colorConfig.max_density  < dataResponse.max_density)
    {      
      colorConfig.max_density = dataResponse.max_density
      material.setFloat("max_dens_in_data", dataResponse.max_density)
      change = true
    }

    if (minSlider && maxSlider && change)
    {
        minSlider.minimum = colorConfig.min_density
        maxSlider.minimum = colorConfig.min_density            
        minSlider.maximum = colorConfig.max_density
        maxSlider.maximum = colorConfig.max_density 
    }
}

function updateMetaDataOnClient(data: Record<string,any>) {
    level_of_detail = data.level_of_detail
    node_indices = data.node_indices    
}
let global_splines_d: Array<any>

function placeholderForShader(particle:CloudPoint, i: number, _s: number){ 
    particle.position = new Vector3(global_splines_d[i * 3], global_splines_d[i * 3 + 1], global_splines_d[i * 3 + 2])
}

let snapPcs:Record<number,PointsCloudSystem> = {};
let call = 0
async function updateMesh(data: Record<string,any>, material: ShaderMaterial, scene:Scene) {         

    global_splines_d = data.splines_d;  
    let pcs2: PointsCloudSystem
    if (snapPcs[timeConfig.current_snapnum + call])
      pcs2 = snapPcs[timeConfig.current_snapnum];
    else
    {
      let pcsName = "pcs" + timeConfig.current_snapnum + call;
      pcs2 = new PointsCloudSystem(pcsName, 20, scene);
      snapPcs[timeConfig.current_snapnum + call++] = pcs2;
      pcs2.addPoints(data.nParticles, placeholderForShader);  
      var pcsMesh = await pcs2.buildMeshAsync(material);
      pcsMesh.hasVertexAlpha = true;                                                
      // pcsMesh.showBoundingBox = true;    
      pcsMesh.setVerticesData("densities", data.densities as FloatArray, false, 2);   
      pcsMesh.setVerticesData("splinesA", data.splines_a as FloatArray, false, 3);
      pcsMesh.setVerticesData("splinesB", data.splines_b as FloatArray, false, 3);
      pcsMesh.setVerticesData("splinesC", data.splines_c as FloatArray, false, 3);      
    }
 
    console.log(call)
    // var pcsMesh = await pcs.buildMeshAsync();

}


