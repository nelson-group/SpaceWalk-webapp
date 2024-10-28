# GUI
The frontend is asynchronous and can be controlled interactively at will. 
The frontend utilizes a canvas from the index.ts, which is used by the engine. The engine allows different layers. One layer is responsible for representing the data, and the other holds the components from the GUI and is not affected by any shaders or postprocessing. 
## UI
![image](https://github.com/user-attachments/assets/8ad61c42-f3e2-409a-a6e1-b052d06aa049)

The representation and some user settings can be manipulated via the GUI to allow an interactive experience. 
The GUI is separated into three parts:
Memory Information: *Note:* No hardware information is read by the browser. The memory is approximated based on the loaded data. It shows the used and available memory. Available memory can be controlled by the users.
Debug Information: The debug information is shown at the bottom, which shows the fps, position of the camera, and the target (center of the camera's orbit). 
Main View: Renders the data
User Controls: Interactive manipulation of settings. The table below describes the different settings: 

<table>
    <thead>
        <tr>
            <th>Component group</th>
            <th>Setting </th>
            <the colspan=2>Effect</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td rowspan=4></td>
            <td rowspan=2>L2 Name A</td>
            <td>L3 Name A</td>
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
