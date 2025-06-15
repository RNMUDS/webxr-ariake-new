// 建物コンポーネント - 窓を含む完全な建物を生成
AFRAME.registerComponent('campus-building', {
    schema: {
        name: {type: 'string'},
        info: {type: 'string'},
        width: {type: 'number', default: 30},
        height: {type: 'number', default: 40},
        depth: {type: 'number', default: 30},
        floors: {type: 'number', default: 10},
        position: {type: 'vec3', default: {x: 0, y: 0, z: 0}},
        hasGlassFirstFloor: {type: 'boolean', default: true}
    },
    
    init: function() {
        const el = this.el;
        const data = this.data;
        
        // メイン建物
        const building = document.createElement('a-box');
        building.setAttribute('position', `${data.position.x} ${data.position.y + data.height/2} ${data.position.z}`);
        building.setAttribute('width', data.width);
        building.setAttribute('height', data.height);
        building.setAttribute('depth', data.depth);
        building.setAttribute('material', 'color: #FAFAFA; roughness: 0.7; metalness: 0.1');
        building.setAttribute('shadow', 'cast: true; receive: true');
        building.setAttribute('class', 'clickable');
        building.setAttribute('building-info', `name: ${data.name}; info: ${data.info}`);
        
        el.appendChild(building);
        
        // 窓を追加
        this.addWindows(building);
    },
    
    addWindows: function(building) {
        const data = this.data;
        const floorHeight = data.height / data.floors;
        const windowsPerFloor = Math.floor(data.width / 4); // 4m間隔で窓
        const windowSpacing = data.width / windowsPerFloor;
        
        // 各階の窓
        for (let floor = 0; floor < data.floors; floor++) {
            const yPos = floor * floorHeight + floorHeight / 2 - data.height / 2;
            
            // 前面と背面
            for (let col = 0; col < windowsPerFloor; col++) {
                const xPos = col * windowSpacing - data.width / 2 + windowSpacing / 2;
                
                if (floor === 0 && data.hasGlassFirstFloor) {
                    // 1階ガラス張り - 前面
                    this.addGlass(building, xPos, yPos, data.depth / 2 + 0.15, 0, windowSpacing * 0.9, floorHeight * 0.9);
                    // 1階ガラス張り - 背面
                    this.addGlass(building, xPos, yPos, -data.depth / 2 - 0.15, 180, windowSpacing * 0.9, floorHeight * 0.9);
                } else {
                    // 通常の窓 - 前面
                    this.addWindow(building, xPos, yPos, data.depth / 2 + 0.15, 0);
                    // 通常の窓 - 背面
                    this.addWindow(building, xPos, yPos, -data.depth / 2 - 0.15, 180);
                }
            }
            
            // 側面
            const sideWindowsPerFloor = Math.floor(data.depth / 4);
            for (let col = 0; col < sideWindowsPerFloor; col++) {
                const zPos = col * 4 - data.depth / 2 + 2;
                
                if (floor === 0 && data.hasGlassFirstFloor) {
                    // 1階ガラス張り - 右側面
                    this.addGlass(building, data.width / 2 + 0.15, yPos, zPos, 90, 3.6, floorHeight * 0.9);
                    // 1階ガラス張り - 左側面
                    this.addGlass(building, -data.width / 2 - 0.15, yPos, zPos, -90, 3.6, floorHeight * 0.9);
                } else {
                    // 通常の窓 - 右側面
                    this.addWindow(building, data.width / 2 + 0.15, yPos, zPos, 90);
                    // 通常の窓 - 左側面
                    this.addWindow(building, -data.width / 2 - 0.15, yPos, zPos, -90);
                }
            }
        }
    },
    
    addWindow: function(parent, x, y, z, rotY) {
        const window = document.createElement('a-plane');
        window.setAttribute('position', `${x} ${y} ${z}`);
        window.setAttribute('rotation', `0 ${rotY} 0`);
        window.setAttribute('width', '1.5');
        window.setAttribute('height', '2.5');
        window.setAttribute('material', 'color: #4169E1; metalness: 0.8; roughness: 0.1; emissive: #222244; emissiveIntensity: 0.2');
        parent.appendChild(window);
    },
    
    addGlass: function(parent, x, y, z, rotY, width, height) {
        const glass = document.createElement('a-plane');
        glass.setAttribute('position', `${x} ${y} ${z}`);
        glass.setAttribute('rotation', `0 ${rotY} 0`);
        glass.setAttribute('width', width);
        glass.setAttribute('height', height);
        glass.setAttribute('material', 'color: #87CEEB; metalness: 0.9; roughness: 0.05; opacity: 0.8; emissive: #111155; emissiveIntensity: 0.3');
        parent.appendChild(glass);
    }
});