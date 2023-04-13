import {
    Color3,
    Color4,
    Engine,
    Material,
    ShaderMaterial,
    Vector3,
    double
} from "@babylonjs/core";

import {RadioButton, Checkbox, AdvancedDynamicTexture, StackPanel, Control, TextBlock, ColorPicker, Slider, Button, InputText } from "@babylonjs/gui";

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

export function buildGUI(gui_texture: AdvancedDynamicTexture , currentMaterial:ShaderMaterial, colorConfig: Record<string,any>, timeConfig:Record<string,any>, cameraConfig: CameraConfig) {
    let panel = new StackPanel();
    panel.width = "400px";
    panel.isVertical = true;
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    gui_texture.addControl(panel);

    let min_color_text_block = new TextBlock();
    min_color_text_block.text = "Min color:";
    min_color_text_block.height = "30px";
    min_color_text_block.color = "lightgray";
    panel.addControl(min_color_text_block);     

    let min_color_picker = new ColorPicker();
    let min_arr: Array<number> = [];
    colorConfig.min_color.toArray(min_arr);
    min_color_picker.value = Color3.FromArray(min_arr);
    min_color_picker.height = "150px";
    min_color_picker.width = "150px";
    min_color_picker.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    min_color_picker.onValueChangedObservable.add(function(value) { // value is a color3
        colorConfig.min_color.copyFrom(value);
        currentMaterial.setColor3("min_color", colorConfig.min_color);
    });

    panel.addControl(min_color_picker);

    let max_color_text_block = new TextBlock();
    max_color_text_block.text = "Max color:";
    max_color_text_block.height = "30px";
    max_color_text_block.color = "lightgray";
    panel.addControl(max_color_text_block);

    let max_color_picker = new ColorPicker();
    let max_arr: Array<number> = [];
    colorConfig.max_color.toArray(max_arr);
    max_color_picker.value = Color3.FromArray(max_arr);
    max_color_picker.height = "150px";
    max_color_picker.width = "150px";
    max_color_picker.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    max_color_picker.onValueChangedObservable.add(function(value) { // value is a color3
        colorConfig.max_color.copyFrom(value);      
        currentMaterial.setColor3("max_color", colorConfig.max_color);
    });
    panel.addControl(max_color_picker);

    let min_opacity_text = new TextBlock();
    min_opacity_text.text = "Min Density: " + colorConfig.quantiles[colorConfig.start_quantile].toFixed(11);
    min_opacity_text.height = "30px";    
    min_opacity_text.color = "lightgray";
    panel.addControl(min_opacity_text);

    let min_slider = new Slider("min_opacity_slider");
    min_slider.minimum = 0;
    min_slider.maximum = colorConfig.n_quantiles - 1;
    min_slider.step = 1;
    min_slider.value = colorConfig.start_quantile;
    min_slider.height = "20px";
    min_slider.width = "200px";
    min_slider.onValueChangedObservable.add(function(value) {
        let density = colorConfig.quantiles[value]
        min_opacity_text.text = "Min Density: " + density.toFixed(12);        
        currentMaterial.setFloat("min_density", density); 
    });
    panel.addControl(min_slider);

    let max_opacity_text = new TextBlock();
    max_opacity_text.text = "Max Density: " + colorConfig.quantiles[colorConfig.start_quantile].toFixed(11);
    max_opacity_text.height = "30px";
    max_opacity_text.color = "lightgray";
    panel.addControl(max_opacity_text);

    let max_slider = new Slider("max_opacity_slider");
    max_slider.minimum = 0;
    max_slider.maximum = colorConfig.n_quantiles - 1;
    max_slider.step = 1;
    max_slider.value = colorConfig.start_quantile;
    max_slider.height = "20px";
    max_slider.width = "200px";
    max_slider.onValueChangedObservable.add(function(value) {
        let density = colorConfig.quantiles[value]
        max_opacity_text.text = "Max Density: " + density.toFixed(12);        
        currentMaterial.setFloat("max_density", density); 
    });
    panel.addControl(max_slider);

    let snapnum_text = new TextBlock("snapnumText");
    snapnum_text.text = "Snapnum: " + timeConfig.current_snapnum;
    snapnum_text.height = "30px";
    snapnum_text.color = "lightgray";
    panel.addControl(snapnum_text);
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
    panel.addControl(snapnum_slider); 
    
    let kernel_text = new TextBlock("kernel");
    kernel_text.text = "Kernel scale: " + 12;
    kernel_text.height = "30px";
    kernel_text.color = "lightgray";
    panel.addControl(kernel_text);
    var kernel_slider = new Slider();
    kernel_slider.minimum = 1;
    kernel_slider.maximum = 40;
    kernel_slider.value = 12;
    kernel_slider.height = "20px";
    kernel_slider.width = "200px";
    kernel_slider.step = 0.5;
    kernel_slider.onValueChangedObservable.add(function(value) {            
        currentMaterial.setFloat("kernel_scale", value);
        kernel_text.text = "Kernel scale: " + value.toFixed(2);
    });
    panel.addControl(kernel_slider);  

    let point_text = new TextBlock("point");
    point_text.text = "Point size: " + 12;
    point_text.height = "30px";
    point_text.color = "lightgray";
    panel.addControl(point_text);
    var point_slider = new Slider();
    point_slider.minimum = 1;
    point_slider.maximum = 70;
    point_slider.value = 12;
    point_slider.height = "20px";
    point_slider.width = "200px";
    point_slider.step = 0.5;
    point_slider.onValueChangedObservable.add(function(value) {            
        currentMaterial.setFloat("point_size", value);
        point_text.text = "Point size: " + value.toFixed(2);
    });
    panel.addControl(point_slider);  

    let scale_text = new TextBlock("scale");
    scale_text.text = "Point scale size: " + 100;
    scale_text.height = "30px";
    scale_text.color = "lightgray";
    panel.addControl(scale_text);
    var scale_slider = new Slider();
    scale_slider.minimum = 0;
    scale_slider.maximum = 1000;
    scale_slider.value = 100;
    scale_slider.height = "20px";
    scale_slider.width = "200px";
    scale_slider.step = 10;
    scale_slider.onValueChangedObservable.add(function(value) {            
        currentMaterial.setFloat("scale", value);
        scale_text.text = "Point scale Size: " + value
    });
    panel.addControl(scale_slider);  

    let interpolation_text = new TextBlock("InterpolationText");
    interpolation_text.text = "Interpolation: " + timeConfig.t;
    interpolation_text.height = "30px";    
    interpolation_text.color = "lightgray";
    panel.addControl(interpolation_text);

    var interpolate_checkbox = new Checkbox();
    interpolate_checkbox.width = "20px";
    interpolate_checkbox.height = "20px";
    interpolate_checkbox.isChecked = timeConfig.is_active;
    interpolate_checkbox.color = "green";
    interpolate_checkbox.onIsCheckedChangedObservable.add(function(value) {
        interpolate_checkbox.color = interpolate_checkbox.isChecked ? "green" : "red";
        timeConfig.is_active = interpolate_checkbox.isChecked;           
    });
    panel.addControl(interpolate_checkbox); 

    timeConfig.text_object_interpolation = interpolation_text;
    timeConfig.text_object_snapnum = snapnum_text;
    timeConfig.slider_object_snapnum = snapnum_slider;

    let camera_text = new TextBlock("CameraPositionText");
    camera_text.text = "Cameraposition: ";
    camera_text.height = "30px";
    camera_text.color = "lightgray";
    panel.addControl(camera_text); 

    let camera_text_x = new TextBlock("CameraPositionTextX");
    camera_text_x.text = "x: ";
    camera_text_x.height = "30px";
    camera_text_x.color = "lightgray";
    panel.addControl(camera_text_x); 
    let camera_input_x = new InputText()
    camera_input_x.height = "30px";
    camera_input_x.width = "80%";
    camera_input_x.color = "white";
    camera_input_x.text = "" + cameraConfig.viewboxCenter.x;
    panel.addControl(camera_input_x);     

    let camera_text_y = new TextBlock("CameraPositionTextY");
    camera_text_y.text = "y: ";
    camera_text_y.height = "30px";
    camera_text_y.color = "lightgray";
    panel.addControl(camera_text_y); 
    let camera_input_y = new InputText()
    camera_input_y.height = "30px";
    camera_input_y.width = "80%";
    camera_input_y.color = "white"
    camera_input_y.text = "" + cameraConfig.viewboxCenter.y;
    panel.addControl(camera_input_y);     

    let camera_text_z = new TextBlock("CameraPositionTextZ");
    camera_text_z.text = "z: ";
    camera_text_z.height = "30px";  
    camera_text_z.color = "lightgray";
    panel.addControl(camera_text_z); 

    let camera_input_z = new InputText()
    camera_input_z.height = "30px";
    camera_input_z.width = "80%";
    camera_input_z.color = "white"
    camera_input_z.text = "" + cameraConfig.viewboxCenter.z;
    panel.addControl(camera_input_z);     

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

    panel.addControl(camera_update_button); 

    var textblock = new TextBlock();
    textblock.height = "30px";
    textblock.text = "Blending Modes:"    
    textblock.color = "lightgray";
    panel.addControl(textblock);         

    var addRadio = function(text:[string, number, boolean], parent:StackPanel) {

        var button = new RadioButton();
        button.width = "20px";
        button.height = "20px";
        button.color = "white";
        button.background = "green";     
        button.isChecked = text[2];

        button.onIsCheckedChangedObservable.add(function(state){
            if(state)
                timeConfig.material.alphaMode = text[1]
        })

        var header = Control.AddHeader(button, text[0], "200px", { isHorizontal: true, controlFirst: true });
        header.height = "30px";
        header.color = "lightgray"        

        parent.addControl(header);    
    }

    colorConfig.blendig_modes.forEach((element:[string,number, boolean]) => {
        addRadio(element, panel)
    });
    




    return panel
}


export function roundNumber(number: number) {
    return (Math.round(number * 100) / 100).toFixed(2);
}
