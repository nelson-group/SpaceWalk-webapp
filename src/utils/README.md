# GUI
The frontend is asynchronous and can be controlled interactively at will. \
The frontend utilizes a canvas from the index.ts, which is used by the engine. The engine allows different layers. One layer is responsible for representing the data, and the other holds the components from the GUI and is not affected by any shaders or postprocessing. 
## UI
![image](https://github.com/user-attachments/assets/8ad61c42-f3e2-409a-a6e1-b052d06aa049)

The representation and some user settings can be manipulated via the GUI to allow an interactive experience. \
The GUI is separated into three parts: \
Memory Information: *Note:* No hardware information is read by the browser. The memory is approximated based on the loaded data. It shows the used and available memory. Available memory can be controlled by the users. \
Debug Information: The debug information is shown at the bottom, which shows the fps, position of the camera, and the target (center of the camera's orbit). \
Main View: Renders the data \
User Controls: Interactive manipulation of settings. The table below describes the different settings: 

<table>
    <thead>
        <tr>
            <th>Component group</th>
            <th>Setting </th>
            <th>Description</th>
            <th colspan=2>Effect</th>            
        </tr>
    </thead>
    <tbody>
        <tr>
            <td rowspan=4>Visualization settings</td>
            <td>Min Color</td>
            <td>Changes the color of the lowest density values</td>
            <td>Red: <img src="https://github.com/user-attachments/assets/8d6d7ba5-da32-47e6-80c1-3d9789cb5d8f"\>
</td>
            <td>Green: <img src="https://github.com/user-attachments/assets/28e70f6b-009a-4352-96c5-8ecb00f8b15d"\>
</td>
        </tr>
        <tr>
            <td>L3 Name B</td>
        </tr>
        <tr>
            <td rowspan=2>L2 Name B</td>
            <td>L3 Name C</td>
        </tr>
        <tr>
            <td>L3 Name D</td>
        </tr>
    </tbody>
</table>
All settings are also shown here as screenshot:
![image](https://github.com/user-attachments/assets/3b6a4a2d-5718-4e9b-b1ba-2112d871cb7c)

## CODE
All GUI elements are included in gui.ts. A sidescroller element allows you to scroll if the window is too small for the settings. Also, a component group can be toggled. For implementation following pattern must be considered: 
### gui.ts
For a complete group, a control panel (*currentPanel*) must be added with the function *createStackPanel*. Additionally, the control to toggle this group must be added (*currentButtonClient*):
```typescript
currentPanel = createStackPanel("Client Settings", parentStackPanel, allPanels);  

let currentButtonClient = Button.CreateImageButton("Client Settings button","Client Settings", "./../pngwing.com.png");         
currentButtonClient.height = "25px";
currentButtonClient.width = "250px";    
currentButtonClient.background = 'lightgray'; 
currentButtonClient.alpha = 0.7;     
currentButtonClient.overlapGroup = 1;     
currentButtonClient._children[1].rotation = pi/2;
currentButtonClient.onPointerClickObservable.add(function(value) { //make anything isntead of button disappear        
    allPanels[3].children.forEach(element => {
        if (element.name != currentButtonClient.name)
            element.isVisible = !element.isVisible;
    });        
    currentButtonClient._children[1].rotation = rotations.filter((x,i)=> x != currentButtonClient._children[1].rotation)[0];
})
currentPanel.addControl(currentButtonClient);
```
In the case of adding a control to a group first a text must be added as the label (*percentage_text*), added to the panel of the group, and then add the control that is needed (*percentage_slide*), which also has to be added to the panel:
```typescript
    let percentage_text = new TextBlock("Download Percentage");
    percentage_text.text = "Download Percentage: " + DownloadControl.percentage;
    percentage_text.height = "30px";    
    percentage_text.color = "lightgray";
    currentPanel.addControl(percentage_text);

    let percentage_slider = new Slider("percentage_slider");
    percentage_slider.minimum = 0;
    percentage_slider.maximum = 1;
    percentage_slider.step = 0.1;
    percentage_slider.value = 0.1
    percentage_slider.height = "20px";
    percentage_slider.width = "200px";
    percentage_slider.onValueChangedObservable.add(function(value) {
	    DownloadControl.percentage = value;
	    percentage_text.text = "Download Percentage: " + value.toFixed(1);
    });
    currentPanel.addControl(percentage_slider);
```
*Note:* The functionality is inline but can be changed at will for your purposes. Here, it is often used to update either the UI itself or update objects that control the rendering.
