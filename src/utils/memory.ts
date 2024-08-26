import { Nullable } from "@babylonjs/core/types";
import { roundNumber } from "./gui";
import { PointsCloudSystem } from "@babylonjs/core";

export class MemoryConfig {
    private static instance: MemoryConfig;

    public memoryInfoText:Nullable<HTMLElement>
    public maxMemory:number // in mbytes
    public currentMemory:number
    public intervalId:number;
    
    private constructor() {        
        this.maxMemory = 2048;
        this.currentMemory = 0;
        this.memoryInfoText = null;
        this.intervalId = 0;
     }

    public static getInstance(): MemoryConfig {
        if (!MemoryConfig.instance) {
            MemoryConfig.instance = new MemoryConfig();
        }

        return MemoryConfig.instance;
    }
        
    public setMemoryInfoText(htmlElement: HTMLElement)
    {
        this.memoryInfoText = htmlElement;
        return true;
    }

    public getMemoryInfoText()
    {        
        return this.memoryInfoText;
    }

    public getCurrentMemory()
    {        
        return this.currentMemory;
    }

    public setMaxMemory(maxMemory:number)
    {
        this.maxMemory = maxMemory;
        return true;
    }

    public updateMemoryInfoText()
    {
        if (!this.memoryInfoText)
        return false;

        this.memoryInfoText.innerHTML = "memory usage: " + this.currentMemory.toFixed(3) + "/"+ this.maxMemory +"\("+ (this.currentMemory/this.maxMemory * 100).toFixed(3) + "%)" + "(used/max/%)" ;
        return true;
    }

    public memoryWatcher(pcsDict: Record<number, Array<PointsCloudSystem>>)
    {       
        let memory = 0; //go through all pcs and calculate memory for it in bytes
        for(const key in pcsDict)
        {
            pcsDict[key].forEach(pcs => {
                memory += pcs.nbParticles * 8 + 100;
            });
        }

        this.currentMemory = memory / 1024 / 1024; // calculate currentMemory in mb
        this.updateMemoryInfoText();
    }
}