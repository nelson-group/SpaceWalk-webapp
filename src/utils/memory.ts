import { Nullable } from "@babylonjs/core/types";
import { roundNumber } from "./gui";

export class MemoryConfig {
    private static instance: MemoryConfig;

    public memoryInfoText:Nullable<HTMLElement>
    public maxMemory:number // in mbytes
    public currentMemory:number
    public intervalId:number;
    
    private constructor() {        
        this.maxMemory = 2048;
        this.currentMemory = 0.1;
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

    public updateMemoryInfoText()
    {
        if (!this.memoryInfoText)
        return false;

        this.memoryInfoText.innerHTML = "memory usage: " + this.currentMemory + "/"+ this.maxMemory +"\("+ (this.currentMemory/this.maxMemory * 100).toFixed(3) + "%)" + "(used/max/%)" ;
        return true;
    }

    public memoryWatcher()
    {        
        this.updateMemoryInfoText();
    }
}