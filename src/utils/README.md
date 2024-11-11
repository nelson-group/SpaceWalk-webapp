# GUI
The frontend is asynchronous and can be controlled interactively at will. \
The frontend utilizes a canvas from the index.ts, which is used by the engine. The engine allows different layers. One layer is responsible for representing the data, and the other holds the components from the GUI and is not affected by any shaders or postprocessing. 
## UI
![image](https://github.com/user-attachments/assets/8ad61c42-f3e2-409a-a6e1-b052d06aa049)

The representation and some user settings can be manipulated via the GUI to allow an interactive experience. \
The GUI is separated into three parts: \
Memory Information: *Note:* The browser reads no hardware information. The memory is approximated based on the loaded data. It shows the used and available memory. The users can control available memory. \
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
            <td rowspan=3>Visualization settings</td>
            <td>Min color</td>
            <td>Changes the color of the lowest density values (Default: Red)</td>
            <td>Red: <img src="https://github.com/user-attachments/assets/8d6d7ba5-da32-47e6-80c1-3d9789cb5d8f"\>
</td>
            <td>Green: <img src="https://github.com/user-attachments/assets/28e70f6b-009a-4352-96c5-8ecb00f8b15d"\>
</td>
        </tr>
        <tr>
            <td>Max color</td>
		<td> Changes the color of the highest density values (Default: Yellow)</td>
		<td>Yellow: <img src="https://github.com/user-attachments/assets/8d6d7ba5-da32-47e6-80c1-3d9789cb5d8f"\>
		<td>White: <img src="https://github.com/user-attachments/assets/aa4c27f4-5ecb-4b95-ba5c-f3fbf5b62f0f"\>
</td>
        </tr>  
	            <tr>
            <td>Min/Max Density</td>
		<td> Changes the lower and upper border for the color settings. E.g. all densities above Max Density are yellow, all below Min Density are red. (Scale is separated in quantiles)</td>
		<td>Yellow: <img src="https://github.com/user-attachments/assets/8d6d7ba5-da32-47e6-80c1-3d9789cb5d8f"\>
		<td>White: <img src="https://github.com/user-attachments/assets/aa4c27f4-5ecb-4b95-ba5c-f3fbf5b62f0f"\>
</td>
        </tr> 
        <tr>
            <td rowspan=4>Simulation Settings (Controls over all four dimensions)</td>
            <td>Snapnum</td>
	    <td>Shows the currently visualized snapnum of the dataset (left border: minimum preprocessed snapnum, right border: maximum preprocessed snapnum)</td>		
        </tr>
	    <tr>
            <td>Interpolation settings (4th dimension)</td>
	    <td>Interpolation per second (ips): Amount of interpolations per second. Controls the "speed" of the simulation.<br>
		    Interpolationsteps: Describes the resolution of the time discretization. Controls the delta of a step.<br> 
		    Interpolation (t): Shows the current interpolation (t). Controls the current interpolation of two snapnums. I.e. t=0 equals the snapnum, t=1 equals the snapnum + 1.</td>
		    <td>t=0.255<img src="https://github.com/user-attachments/assets/b4d58b54-de81-4695-bef5-f5c62ebd5723"\></td>
		    <td>t=0.700<img src="https://github.com/user-attachments/assets/7f4f8a0b-b9b3-467c-9e40-e1af42485493"\></td>
        </tr>
	    <tr>
            <td>Interpolation start/stop</td>
		    <td>Checkbox to toggle (start/stop) the simulation or interpolation respectively</td>
        </tr>
	    <tr>
            <td>Camera position</td>
            <td>Can be used to change the camera position within the complete simulation space (3D)</td>
        </tr>
    <tr>
            <td rowspan=4>Rendering Settings</td>
	    <td>Kernel scale</td>	
		<td>The kernel scale represents the percentage of a gl_points primitive that is rendered. (This is needed because usually a gl_points is a rectangle not a point/sphere (Can be seen if kernel scale is set to 1) Default: 0.5) Practically, it changes the shape from a rectangle to a circle.</td>	
	    <td>Kernel scale=0.6<img src="https://github.com/user-attachments/assets/00220f15-6678-4ed1-a1e5-9c19a6ab304f"\>
</td>
	    <td>Kernel scale=0.2<img src="https://github.com/user-attachments/assets/8a22ef56-16aa-404c-9bb9-d8ec59fdfd93"\>
</td>
        </tr>
<tr>
	<td>Voronio size scale</td>
	<td>Intial size of the primitive like used in webGL (Default: 12).</td>
	<td>Voronoi size=12 <img src="https://github.com/user-attachments/assets/8a22ef56-16aa-404c-9bb9-d8ec59fdfd93"\>
	<td>Voronoi size=30 <img src="https://github.com/user-attachments/assets/edaeca62-da8f-4cf5-8322-ed9871d718a0"\>
</td>
</tr>	
<tr>
	<td>Distance scale</td>
	<td>Changes the impact of the distance between the particle and the camera (Default: 1).</td>
	<td>Distance scale=1 <img src="https://github.com/user-attachments/assets/736cf50e-20bf-4967-8aac-a382d4ae879f"\>
	<td>Distance scale=30 <img src="https://github.com/user-attachments/assets/c7f86fb5-a8f4-4e32-bd05-54866dfc3933"\>
</td>
</tr>	 
<tr>
	<td>Blending Modes</td>
	<td>Changes the art of blending like webGL. (Default: Alpha_ADD)</td>
</td>
</tr>	 
<tr>
<td rowspan=2>Client Settings</td>
<td>Maximal memory usage</td>
<td>Controls the maximum memory that can be used by the application. It is not regulated by real hardware information. I.e. the user is in response to proper management. No possibility is given to set the max memory below the already used memory. To reduce memory usage, the website must be refreshed. The calculation of used memory is an approximation. (Default: 2048MB)</td>
</td>	
</tr>		 
<tr>
	<td> Download percentage</td>
	<td>Controls how much data is downloaded from the server. E.g. the client only downloads 5% (0.05) of the data available on the server. This is not reversible, i.e. if the data is downloaded this setting only applies to the new data to be downloaded in the future. Additionally,  the setting only applies during download. </td>
</tr>
    </tbody>
</table>


All settings are also shown here as screenshot:
![image](https://github.com/user-attachments/assets/3b6a4a2d-5718-4e9b-b1ba-2112d871cb7c)

## CODE
All GUI elements are included in gui.ts. A sidescroller element allows you to scroll if the window is too small for the settings. Also, a component group can be toggled. For implementation, the following pattern must be considered: 
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

### sceneryWithSplines

sceneryWithSplines is the initial code for the scene. It controls the camera and the scene itself. Herby, the file is separeted into 3 main parts: the camera, the materias and the scnene. 

**The camera** is realized by an singleton export class *CameraConfig*. It holds the position, the target position of the center of the viewbox) and the radius (size of the viewbox). The viewbox is the calculated visible area within the simulation space. The coordinates are in space coordinates of the simulation. An ArcRotateCamera is used (see https://doc.babylonjs.com/features/featuresDeepDive/cameras).

The Camera position is updated with the **onViewMatrixChangeObservable** which is automatically started by the Babylonengines as soon the camera is moved (and therefore the vie matrix changes). **onViewMatrixChangeObservable** is able to push new information to the material, like the camera positon or the farplane (maximal visible area). Additionally, the funtion checks if the camera is moved to another position and the new viewbox is aligned with the current one. The box did not move (like possible with an rotation) nothiung is done, but if the viewbox moves, new data may be loaded and thus the download process is reactivated.

Finally, there is a guiCamera, that has an own layer for the gui such that the gui is not effected by postprocessing effects.

**The scene** create initializes the camera, the gui and the post processing. The postprocessing is only used for a proper fluidrendering, which is currently not available. 

**The material** initialzes the material, i.e. the shader for the particles in our case. The material is called shaderMaterial and is based on https://doc.babylonjs.com/features/featuresDeepDive/materials/shaders/shaderMaterial. The most commen usage is to initilize the uniforms, the attributes and the defines. Also is create a material, that can be applied to a new pcs. Thus, we have full control on the appearance of the particles. It also initilizes the depthShaderMaterial which is used to calcuate the proper z-values (High interest for proper fluid rendering). Most uniforms are used to push the user settings from the gui to the shaders. In *index.ts:updateMesh* the material is connected to the pcs. Two shaders are used to impact the appearance of the particles: The vertexshader *splineInterpolator.vertex.fx* and the fragmentshader *splineInterpolator.fragment.fx*

### Shader

#### Vertex Shader
Main focus is the interpolation based on t to interpolate between two snapshots. the Formular is based on the usual hermit-spline calculation. The spline-coefficionts are precalculated, downloaded from the server and used as attributes for each particle.

Also, the *gl_pointSize* is calculated, which changes the size based on the initial size and the distance scale. 
Finally, the normalized depth is forwarded to the fragment shader.

**Depth** uses the same vertex shader.

#### Fragment Shader
Main focus is to change the appearance in fluid like rendering that can destinguish between very high and very low densities. This can be archieved with different steps: 
1. The appearance is changed such that the gl_primitive point is rendered as circle and not as square. All parts of the fragment that are not within this circle are ignored. (Line 19-23)
2. A linear interpolation between the initial density and the final density is done based on t. (line 25-29)
3. Based on the density a color is calculated. (line 30)
4. The fragment is colored and the alpha is calculated based on the position of the primitive (gets less alpha on the outside to simulate a blur). (line 33) This might be different for the fluidrendering. The final alpha is based on the alpha setting in the gui. Default is alpha_add (see: https://doc.babylonjs.com/features/featuresDeepDive/materials/using/blendModes).

**Depth** is using the *depth.fragment.fx to calculate a proper depth that can be logarithmic if wanted. The depthBuffer can be used in the postprocessing, e.g. fluidrendering and is normalized between 0 and 1 based on the farplane.
