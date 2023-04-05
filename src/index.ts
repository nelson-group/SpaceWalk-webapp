import { createScene, CameraConfig } from "./utils/sceneryWithSplines";  

import { Engine, Nullable, Mesh, Color3, ShaderMaterial, PointsCloudSystem, CloudPoint, Vector3, Scene, FloatArray, Material } from "@babylonjs/core";
import { max, min, number } from "mathjs";
import {StackPanel, Slider, TextBlock} from "@babylonjs/gui"
import { roundNumber } from "./utils/gui";

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
    "minimum_fps": 25,
    "material": null
} 

var colorConfig = {
  "min_color": new Color3(0, 0, 0),
  "max_color": new Color3(1, 1, 1),
  "min_density": 0,
  "max_density": 1e-12,
  "automatic_opacity": false,
  "n_quantiles": 0,
  "quantiles": Array
};

export class DownloadControl{
  public static downloadInProcess = false
  public static batch_size_lod = 500; 
  public static timeConfig:Record<string,any> = {}
  
  private static _finishedDownload = false
  private static _downloadHTML = document.getElementById("downloading")!;
  private static _internalSnapnum = -1
  private static pcsDictonary:Record<number, Array<PointsCloudSystem>> = {}
  private static _node_indices:Record<number, Array<number>> = {};
  private static _level_of_detail:Record<number, Record<number,number>> = {};
  

  public static get_node_indices(snapNum: number) {
    if(!this._node_indices[snapNum])
      this._node_indices[snapNum] = []
    return this._node_indices[snapNum]
  }

  public static set_node_indices(new_node_indices:Array<number>,snapNum: number) {  
      this._node_indices[snapNum] = new_node_indices;
  }

  public static get_level_of_detail(snapNum: number) {
    if(!this._level_of_detail[snapNum])
      this._level_of_detail[snapNum] = {}
    return this._level_of_detail[snapNum]
  }

  public static set_level_of_detail(new_level_of_detail:Record<number,number>,snapNum: number) {  
      this._level_of_detail[snapNum] = new_level_of_detail;
  }

  public static get internalSnapnum() {
    return this._internalSnapnum;
  }

  private static async updatePcsVisibility(oldSnapnum:number, newSnapnum:number)
  { 
    let old_interpolation_state = this.timeConfig.is_active;
    this.timeConfig.is_active = false;

    if(this.pcsDictonary[oldSnapnum])
      this.pcsDictonary[oldSnapnum].forEach(element => {
        if (element.mesh)
          element.mesh.visibility = 0;
      });

    timeConfig.t = 0;
    if(this.pcsDictonary[newSnapnum])
      this.pcsDictonary[newSnapnum].forEach(element => {
        if (element.mesh)
          element.mesh.visibility = 1;
      });

      this.timeConfig.is_active = old_interpolation_state;
  }

  public static set internalSnapnum(newSnapNnum: number) {  
    if(newSnapNnum != this.internalSnapnum)
    {
      this.updatePcsVisibility(this.internalSnapnum, newSnapNnum)
      this._internalSnapnum = newSnapNnum
      this.finishedDownload = false
    }
  }

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

  public static addPcsToDict(pcs:PointsCloudSystem, forSnap:number)
  {
    if(!this.pcsDictonary[forSnap])
      this.pcsDictonary[forSnap] = new Array<PointsCloudSystem>()
    this.pcsDictonary[forSnap].push(pcs);
  }

//   function updateMetaDataOnClient(data: Record<string,any>, current_snapnum:number) {
//     if (!level_of_detail[current_snapnum])
//       level_of_detail[current_snapnum] = {}
//     level_of_detail[current_snapnum] = data.level_of_detail

//     if (!node_indices[current_snapnum])
//     node_indices[current_snapnum] = new Array<number>
//     node_indices = data.node_indices    
// }
  
}

let call = 0;

const url = "http://127.0.0.1:8000/v1/";
let simulationName = "TNG50-4"


async function main() {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    const divFPS = document.getElementById("fps")!;
    const cameraConfig =  CameraConfig.getInstance();
    cameraConfig.setCameraInfoText(document.getElementById("cameraInfo")!);
    DownloadControl.timeConfig = timeConfig;
    
    const response = await fetch(url + "get/init/" + simulationName + "/" + timeConfig.current_snapnum, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'                  
      },
    })
    const initial_data = await response.json()

    var engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    
    colorConfigUpdate(initial_data, colorConfig);
    var [scene, material] = await createScene(canvas, engine, colorConfig, timeConfig, true);   

    window.addEventListener('resize', function () {
        engine.resize();
    });

    engine.runRenderLoop(function () {
        divFPS.innerHTML = engine.getFps().toFixed() + " fps";
        scene.render();

        DownloadControl.internalSnapnum = timeConfig.current_snapnum;                
        if(!DownloadControl.downloadInProcess && !DownloadControl.finishedDownload)        
        {
          DownloadControl.downloadInProcess = true;
            const payload = {
                    "node_indices": DownloadControl.get_node_indices(timeConfig.current_snapnum),
                    "level_of_detail": DownloadControl.get_level_of_detail(timeConfig.current_snapnum),
                    "batch_size_lod": DownloadControl.batch_size_lod,
                    "camera_information": cameraConfig.getCameraConfig()
              };
            
            fetch(url + "get/splines/" + simulationName + "/" + timeConfig.current_snapnum, {
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
                  updateMesh(data, material, scene)                  
                  updateMetaDataOnClient(data, timeConfig.current_snapnum);                  
                  DownloadControl.downloadInProcess = false;
                })
                .catch(error => {
                  console.error('Error:', error);
                  DownloadControl.downloadInProcess = false;
                });
        }        
    });


    window.setInterval(timeClock, 1000 / timeConfig.minimum_fps);
}

await main();

async function timeClock()
{
    if (!timeConfig.is_active)
      return;
    
    timeConfig.t += (1 / timeConfig.number_of_interpolations)
    if (timeConfig.t > 1)            
      timeConfig.current_snapnum += 1
      
    if (timeConfig.material)
      (timeConfig.material as ShaderMaterial).setFloat("t", timeConfig.t);
    
    if (timeConfig.slider_object_snapnum && (timeConfig.slider_object_snapnum as Slider).value != timeConfig.current_snapnum)    
      (timeConfig.slider_object_snapnum as Slider).value = timeConfig.current_snapnum    
    
    if (timeConfig.text_object_interpolation)
      (timeConfig.text_object_interpolation as TextBlock).text = "Interpolation: " + roundNumber(timeConfig.t)
}

function colorConfigUpdate(dataResponse: Record<string,any>, colorConfig: Record<string,any>) {
    let quantiles = dataResponse.density_quantiles
    colorConfig.min_density = min(quantiles)
    colorConfig.max_density = max(quantiles)
    colorConfig.n_quantiles = dataResponse.n_quantiles  
    colorConfig.quantiles = quantiles
}


let global_splines_d: Array<any>

function placeholderForShader(particle:CloudPoint, i: number, _s: number){ 
    particle.position = new Vector3(global_splines_d[i * 3], global_splines_d[i * 3 + 1], global_splines_d[i * 3 + 2])
}

async function updateMesh(data: Record<string,any>, material: ShaderMaterial, scene:Scene) {         
    global_splines_d = data.splines_d;  
    let pcsName = "pcs" + timeConfig.current_snapnum + call++;
    let pcs2 = new PointsCloudSystem(pcsName, 20, scene);
    DownloadControl.addPcsToDict(pcs2, timeConfig.current_snapnum);
    pcs2.addPoints(data.nParticles, placeholderForShader);  
    var pcsMesh = await pcs2.buildMeshAsync(material);
    pcsMesh.hasVertexAlpha = true;                                                
    // pcsMesh.showBoundingBox = true;    
    pcsMesh.setVerticesData("densities", data.densities as FloatArray, false, 2);   
    pcsMesh.setVerticesData("splinesA", data.splines_a as FloatArray, false, 3);
    pcsMesh.setVerticesData("splinesB", data.splines_b as FloatArray, false, 3);
    pcsMesh.setVerticesData("splinesC", data.splines_c as FloatArray, false, 3);      

 
    console.log(call)
    // var pcsMesh = await pcs.buildMeshAsync();
}

function updateMetaDataOnClient(data: Record<string,any>, current_snapnum: number) {
  DownloadControl.set_level_of_detail(data.level_of_detail, current_snapnum)
  DownloadControl.set_node_indices(data.node_indices, current_snapnum)
}

