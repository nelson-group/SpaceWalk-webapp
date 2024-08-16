import {
    Color3,
    Color4,
    Engine,
    Material,
    ShaderMaterial,
    Vector3,
    double
} from "@babylonjs/core";

import {Container, ScrollViewer, RadioButton, Checkbox, AdvancedDynamicTexture, StackPanel, Control, TextBlock, ColorPicker, Slider, Button, InputText } from "@babylonjs/gui";

import { min, max, forEach } from "mathjs";
import { CameraConfig } from "./sceneryWithSplines";


export function calcColor(config: Record<string,any>, density: number) {
    let tmp: number = 1.0 - density;    
    let one_minus_d = new Color3(tmp, tmp, tmp);
    let d = new Color3(density, density, density);

    let color = config.min_color.multiply(one_minus_d).add(config.max_color.multiply(d));
    let color4 = color.toColor4(min(max(0, density - config.min_density) / (config.max_density - config.min_density), 1));
    return color4;
}

export function buildGUI(gui_texture: AdvancedDynamicTexture , currentMaterial:ShaderMaterial[], colorConfig: Record<string,any>, timeConfig:Record<string,any>, cameraConfig: CameraConfig) {
    //scrollViewIfControllsAreToLarge: consider optimization: https://doc.babylonjs.com/features/featuresDeepDive/gui/scrollViewer    
    const myScrollViewer = new ScrollViewer("customer settings");  
    
    gui_texture.addControl(myScrollViewer);
    let parentStackPanel = new StackPanel("customer settings panel");
    parentStackPanel.width = "400px";
    parentStackPanel.isVertical = true;
    parentStackPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    parentStackPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;     
    myScrollViewer.addControl(parentStackPanel);

    gui_texture.onBeginRenderObservable.addOnce(() => 
    {
        gui_texture.moveToNonOverlappedPosition(1,1,1); });

    let allPanels = new Array<StackPanel>;

    // visualization settings //
    let currentPanel = createStackPanel("Visuzalization Settings", parentStackPanel, allPanels);        
    
    let min_color_text_block = new TextBlock();
    min_color_text_block.text = "Min color:";
    min_color_text_block.height = "30px";
    min_color_text_block.color = "lightgray";
    currentPanel.addControl(min_color_text_block);    
    

    let min_color_picker = new ColorPicker();
    let min_arr: Array<number> = [];
    colorConfig.min_color.toArray(min_arr);
    min_color_picker.value = Color3.FromArray(min_arr);
    min_color_picker.height = "150px";
    min_color_picker.width = "150px";
    min_color_picker.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    min_color_picker.onValueChangedObservable.add(function(value) { // value is a color3
        colorConfig.min_color.copyFrom(value);
        currentMaterial[0].setColor3("min_color", colorConfig.min_color);
    });

    currentPanel.addControl(min_color_picker);

    let max_color_text_block = new TextBlock();
    max_color_text_block.text = "Max color:";
    max_color_text_block.height = "30px";
    max_color_text_block.color = "lightgray";
    currentPanel.addControl(max_color_text_block);

    let max_color_picker = new ColorPicker();
    let max_arr: Array<number> = [];
    colorConfig.max_color.toArray(max_arr);
    max_color_picker.value = Color3.FromArray(max_arr);
    max_color_picker.height = "150px";
    max_color_picker.width = "150px";
    max_color_picker.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    max_color_picker.onValueChangedObservable.add(function(value) { // value is a color3
        colorConfig.max_color.copyFrom(value);      
        currentMaterial[0].setColor3("max_color", colorConfig.max_color);
    });
    currentPanel.addControl(max_color_picker);

    let min_opacity_text = new TextBlock();
    min_opacity_text.text = "Min Density: " + colorConfig.quantiles[colorConfig.start_quantile-10].toFixed(11);
    min_opacity_text.height = "30px";    
    min_opacity_text.color = "lightgray";
    currentPanel.addControl(min_opacity_text);

    let min_slider = new Slider("min_opacity_slider");
    min_slider.minimum = 0;
    min_slider.maximum = colorConfig.n_quantiles - 1;
    min_slider.step = 1;
    min_slider.value = colorConfig.start_quantile-10;
    min_slider.height = "20px";
    min_slider.width = "200px";
    min_slider.onValueChangedObservable.add(function(value) {
        let density = colorConfig.quantiles[value]
        min_opacity_text.text = "Min Density: " + density.toFixed(12);        
        currentMaterial[0].setFloat("min_density", density); 
    });
    currentPanel.addControl(min_slider);

    let max_opacity_text = new TextBlock();
    max_opacity_text.text = "Max Density: " + colorConfig.quantiles[colorConfig.start_quantile+10].toFixed(11);
    max_opacity_text.height = "30px";
    max_opacity_text.color = "lightgray";
    currentPanel.addControl(max_opacity_text);

    let max_slider = new Slider("max_opacity_slider");
    max_slider.minimum = 0;
    max_slider.maximum = colorConfig.n_quantiles - 1;
    max_slider.step = 1;
    max_slider.value = colorConfig.start_quantile+10;
    max_slider.height = "20px";
    max_slider.width = "200px";
    max_slider.onValueChangedObservable.add(function(value) {
        let density = colorConfig.quantiles[value]
        max_opacity_text.text = "Max Density: " + density.toFixed(12);        
        currentMaterial[0].setFloat("max_density", density); 
    });
    currentPanel.addControl(max_slider);

    // simulation settings // 
    currentPanel = createStackPanel("Simulation Settings", parentStackPanel, allPanels);   

    let snapnum_text = new TextBlock("snapnumText");
    snapnum_text.text = "Snapnum: " + timeConfig.current_snapnum;
    snapnum_text.height = "30px";
    snapnum_text.color = "lightgray";
    currentPanel.addControl(snapnum_text);
    var snapnum_slider = new Slider();
    snapnum_slider.minimum = 0;
    snapnum_slider.maximum = timeConfig.n_available_snaps - 1;
    snapnum_slider.value = 0;
    snapnum_slider.height = "20px";
    snapnum_slider.width = "200px";
    snapnum_slider.step = 1;
    snapnum_slider.onValueChangedObservable.add(function(value) {   
        let actual_snapnum = timeConfig.available_snaps[value]     
        snapnum_text.text = "Snapnum: " + actual_snapnum;
        timeConfig.current_snapnum = actual_snapnum
        timeConfig.t = 0
    });
    currentPanel.addControl(snapnum_slider);  

    let interpolation_text = new TextBlock("InterpolationText");
    interpolation_text.text = "Interpolation: " + timeConfig.t;
    interpolation_text.height = "30px";    
    interpolation_text.color = "lightgray";
    currentPanel.addControl(interpolation_text);

    var interpolate_checkbox = new Checkbox();
    interpolate_checkbox.width = "20px";
    interpolate_checkbox.height = "20px";
    interpolate_checkbox.isChecked = timeConfig.is_active;
    interpolate_checkbox.color = "green";
    interpolate_checkbox.onIsCheckedChangedObservable.add(function(value) {
        interpolate_checkbox.color = interpolate_checkbox.isChecked ? "green" : "red";
        timeConfig.is_active = interpolate_checkbox.isChecked;           
    });
    currentPanel.addControl(interpolate_checkbox); 

    timeConfig.text_object_interpolation = interpolation_text;
    timeConfig.text_object_snapnum = snapnum_text;
    timeConfig.slider_object_snapnum = snapnum_slider;

    let camera_text = new TextBlock("CameraPositionText");
    camera_text.text = "Cameraposition: ";
    camera_text.height = "30px";
    camera_text.color = "lightgray";
    currentPanel.addControl(camera_text); 

    let camera_text_x = new TextBlock("CameraPositionTextX");
    camera_text_x.text = "x: ";
    camera_text_x.height = "30px";
    camera_text_x.color = "lightgray";
    currentPanel.addControl(camera_text_x); 
    let camera_input_x = new InputText()
    camera_input_x.height = "30px";
    camera_input_x.width = "80%";
    camera_input_x.color = "white";
    camera_input_x.text = "" + cameraConfig.viewboxCenter.x;
    currentPanel.addControl(camera_input_x);     

    let camera_text_y = new TextBlock("CameraPositionTextY");
    camera_text_y.text = "y: ";
    camera_text_y.height = "30px";
    camera_text_y.color = "lightgray";
    currentPanel.addControl(camera_text_y); 
    let camera_input_y = new InputText()
    camera_input_y.height = "30px";
    camera_input_y.width = "80%";
    camera_input_y.color = "white"
    camera_input_y.text = "" + cameraConfig.viewboxCenter.y;
    currentPanel.addControl(camera_input_y);     

    let camera_text_z = new TextBlock("CameraPositionTextZ");
    camera_text_z.text = "z: ";
    camera_text_z.height = "30px";  
    camera_text_z.color = "lightgray";
    currentPanel.addControl(camera_text_z); 

    let camera_input_z = new InputText()
    camera_input_z.height = "30px";
    camera_input_z.width = "80%";
    camera_input_z.color = "white"
    camera_input_z.text = "" + cameraConfig.viewboxCenter.z;
    currentPanel.addControl(camera_input_z);     

    const camera_update_button = Button.CreateSimpleButton("camera_update_button", "update camera target");
    camera_update_button.height = "30px";
    camera_update_button.width = "80%";
    camera_update_button.background = "gray";
    camera_update_button.onPointerClickObservable.add(function(value) {
        let x:number = +camera_input_x.text
        let y:number = +camera_input_y.text
        let z:number = +camera_input_z.text        
        if (cameraConfig.camera)
        {
            let raduisTmp = cameraConfig.cameraRadius;
            cameraConfig.camera.target = new Vector3(x, y, z);
            cameraConfig.camera.position = cameraConfig.camera.target.subtract(new Vector3(raduisTmp.x, 0, 0));
            cameraConfig.camera.update();
        }
    })

    currentPanel.addControl(camera_update_button); 

    // Rendering Settings //
    currentPanel = createStackPanel("Rendering Settings", parentStackPanel, allPanels);  

    let kernel_text = new TextBlock("kernel");
    kernel_text.text = "Kernel scale: " + 0.5.toFixed(2) +" (percentage)";
    kernel_text.height = "30px";
    kernel_text.color = "lightgray";
    currentPanel.addControl(kernel_text);
    var kernel_slider = new Slider();
    kernel_slider.minimum = 0;
    kernel_slider.maximum = 1;
    kernel_slider.value = 0.5;
    kernel_slider.height = "20px";
    kernel_slider.width = "200px";
    kernel_slider.step = 0.05;
    kernel_slider.onValueChangedObservable.add(function(value) {            
        currentMaterial[0].setFloat("kernel_scale", value);
        currentMaterial[1].setFloat("kernel_scale", value);
        kernel_text.text = "Kernel scale: " + value.toFixed(2) +" (percentage)";
    });
    currentPanel.addControl(kernel_slider);  

    let point_text = new TextBlock("point");
    point_text.text = "Voronoi size scale: " + 12;
    point_text.height = "30px";
    point_text.color = "lightgray";
    currentPanel.addControl(point_text);
    var point_slider = new Slider();
    point_slider.minimum = 1;
    point_slider.maximum = 70;
    point_slider.value = 12;
    point_slider.height = "20px";
    point_slider.width = "200px";
    point_slider.step = 0.5;
    point_slider.onValueChangedObservable.add(function(value) {            
        currentMaterial[0].setFloat("point_size", value);
        currentMaterial[1].setFloat("point_size", value);
        point_text.text = "Voronoi size scale: " + value.toFixed(2);
    });
    currentPanel.addControl(point_slider);  

    let scale_text = new TextBlock("scale");
    scale_text.text = "Distance scale: " + 1;
    scale_text.height = "30px";
    scale_text.color = "lightgray";
    currentPanel.addControl(scale_text);
    var scale_slider = new Slider();
    scale_slider.minimum = 0;
    scale_slider.maximum = 10;
    scale_slider.value = 1;
    scale_slider.height = "20px";
    scale_slider.width = "200px";
    scale_slider.step = 0.5;
    scale_slider.onValueChangedObservable.add(function(value) {            
        currentMaterial[0].setFloat("scale", value);
        currentMaterial[1].setFloat("scale", value);
        scale_text.text = "Distance scale: " + value
    });
    currentPanel.addControl(scale_slider); 

    var textblock = new TextBlock();
    textblock.height = "30px";
    textblock.text = "Blending Modes:"    
    textblock.color = "lightgray";
    currentPanel.addControl(textblock);         

    var addRadio = function(text:[string, number, boolean], parent:StackPanel) {

        var button = new RadioButton();
        button.width = "20px";
        button.height = "20px";
        button.color = "white";
        button.background = "green";     
        button.isChecked = text[2];

        button.onIsCheckedChangedObservable.add(function(state){
            if(state)
                {
                timeConfig.material[0].alphaMode = text[1];
                timeConfig.material[1].alphaMode = text[1];
                }
        })

        var header = Control.AddHeader(button, text[0], "200px", { isHorizontal: true, controlFirst: true });
        header.height = "30px";
        header.color = "lightgray"        

        parent.addControl(header);    
    }

    colorConfig.blendig_modes.forEach((element:[string,number, boolean]) => {
        addRadio(element, currentPanel)
    });
    
    return currentPanel
}


export function roundNumber(number: number) {
    return (Math.round(number * 100) / 100).toFixed(2);
}
function createStackPanel(panelName: string, parent:Container, allPanels:Array<StackPanel>):StackPanel {
    let panel = new StackPanel(panelName);
    panel.width = "400px";
    panel.isVertical = true;
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER; 
    panel.overlapGroup = 1;
    parent.addControl(panel);
    allPanels.push(panel);
    return panel;
}

