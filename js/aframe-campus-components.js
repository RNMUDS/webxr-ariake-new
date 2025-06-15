// 窓を自動生成するコンポーネント
AFRAME.registerComponent('windows', {
    schema: {
        building: {type: 'number', default: 1},
        floors: {type: 'number', default: 10},
        windowsPerFloor: {type: 'number', default: 8}
    },
    
    init: function() {
        const parent = this.el.parentElement;
        const boxes = parent.querySelectorAll('a-box');
        
        if (!boxes || boxes.length === 0) return;
        
        // 各ボックス要素に窓を追加
        boxes.forEach((box, index) => {
            // building-infoを持つメインの建物部分のみに窓を追加
            if (!box.hasAttribute('building-info') && index > 1) return;
            
            const width = parseFloat(box.getAttribute('width'));
            const height = parseFloat(box.getAttribute('height'));
            const depth = parseFloat(box.getAttribute('depth'));
            
            const floorHeight = height / this.data.floors;
            const windowSpacing = width / this.data.windowsPerFloor;
            
            // 前面と背面の窓
            for (let floor = 0; floor < this.data.floors; floor++) {
                for (let col = 0; col < this.data.windowsPerFloor; col++) {
                    const xPos = col * windowSpacing - width / 2 + windowSpacing / 2;
                    const yPos = floor * floorHeight + floorHeight / 2;
                    
                    // 1階はガラス張り
                    if (floor === 0) {
                        // 前面の大きなガラス
                        const glassFront = document.createElement('a-plane');
                        glassFront.setAttribute('position', `${xPos} ${yPos} ${depth / 2 + 0.1}`);
                        glassFront.setAttribute('width', windowSpacing * 0.9);
                        glassFront.setAttribute('height', floorHeight * 0.9);
                        glassFront.setAttribute('material', 'color: #87CEEB; metalness: 0.9; roughness: 0.05; opacity: 0.7; emissive: #111155; emissiveIntensity: 0.3');
                        box.appendChild(glassFront);
                        
                        // 背面の大きなガラス
                        const glassBack = document.createElement('a-plane');
                        glassBack.setAttribute('position', `${xPos} ${yPos} ${-depth / 2 - 0.1}`);
                        glassBack.setAttribute('rotation', '0 180 0');
                        glassBack.setAttribute('width', windowSpacing * 0.9);
                        glassBack.setAttribute('height', floorHeight * 0.9);
                        glassBack.setAttribute('material', 'color: #87CEEB; metalness: 0.9; roughness: 0.05; opacity: 0.7; emissive: #111155; emissiveIntensity: 0.3');
                        box.appendChild(glassBack);
                    } else {
                        // 2階以上は通常の窓
                        // 前面の窓
                        const windowFront = document.createElement('a-plane');
                        windowFront.setAttribute('position', `${xPos} ${yPos} ${depth / 2 + 0.1}`);
                        windowFront.setAttribute('width', '1.5');
                        windowFront.setAttribute('height', '2.5');
                        windowFront.setAttribute('material', 'color: #87CEEB; metalness: 0.8; roughness: 0.1; emissive: #222244; emissiveIntensity: 0.2');
                        box.appendChild(windowFront);
                        
                        // 背面の窓
                        const windowBack = document.createElement('a-plane');
                        windowBack.setAttribute('position', `${xPos} ${yPos} ${-depth / 2 - 0.1}`);
                        windowBack.setAttribute('rotation', '0 180 0');
                        windowBack.setAttribute('width', '1.5');
                        windowBack.setAttribute('height', '2.5');
                        windowBack.setAttribute('material', 'color: #87CEEB; metalness: 0.8; roughness: 0.1; emissive: #222244; emissiveIntensity: 0.2');
                        box.appendChild(windowBack);
                    }
                }
            }
            
            // 側面の窓（メイン建物のみ）
            if (box.hasAttribute('building-info')) {
                const sideWindowsPerFloor = Math.floor(depth / windowSpacing);
                for (let floor = 0; floor < this.data.floors; floor++) {
                    for (let col = 0; col < sideWindowsPerFloor; col++) {
                        const zPos = col * windowSpacing - depth / 2 + windowSpacing / 2;
                        const yPos = floor * floorHeight + floorHeight / 2;
                        
                        if (floor === 0) {
                            // 1階側面のガラス
                            const glassSide1 = document.createElement('a-plane');
                            glassSide1.setAttribute('position', `${width / 2 + 0.1} ${yPos} ${zPos}`);
                            glassSide1.setAttribute('rotation', '0 90 0');
                            glassSide1.setAttribute('width', windowSpacing * 0.9);
                            glassSide1.setAttribute('height', floorHeight * 0.9);
                            glassSide1.setAttribute('material', 'color: #87CEEB; metalness: 0.9; roughness: 0.05; opacity: 0.7');
                            box.appendChild(glassSide1);
                            
                            const glassSide2 = document.createElement('a-plane');
                            glassSide2.setAttribute('position', `${-width / 2 - 0.1} ${yPos} ${zPos}`);
                            glassSide2.setAttribute('rotation', '0 -90 0');
                            glassSide2.setAttribute('width', windowSpacing * 0.9);
                            glassSide2.setAttribute('height', floorHeight * 0.9);
                            glassSide2.setAttribute('material', 'color: #87CEEB; metalness: 0.9; roughness: 0.05; opacity: 0.7');
                            box.appendChild(glassSide2);
                        } else {
                            // 2階以上の側面窓
                            const windowSide1 = document.createElement('a-plane');
                            windowSide1.setAttribute('position', `${width / 2 + 0.1} ${yPos} ${zPos}`);
                            windowSide1.setAttribute('rotation', '0 90 0');
                            windowSide1.setAttribute('width', '1.5');
                            windowSide1.setAttribute('height', '2.5');
                            windowSide1.setAttribute('material', 'color: #87CEEB; metalness: 0.8; roughness: 0.1');
                            box.appendChild(windowSide1);
                            
                            const windowSide2 = document.createElement('a-plane');
                            windowSide2.setAttribute('position', `${-width / 2 - 0.1} ${yPos} ${zPos}`);
                            windowSide2.setAttribute('rotation', '0 -90 0');
                            windowSide2.setAttribute('width', '1.5');
                            windowSide2.setAttribute('height', '2.5');
                            windowSide2.setAttribute('material', 'color: #87CEEB; metalness: 0.8; roughness: 0.1');
                            box.appendChild(windowSide2);
                        }
                    }
                }
            }
        });
    }
});

// 建物情報を表示するコンポーネント
AFRAME.registerComponent('building-info', {
    schema: {
        name: {type: 'string'},
        info: {type: 'string'}
    },
    
    init: function() {
        this.el.addEventListener('click', () => {
            const infoText = document.querySelector('#building-info-text');
            infoText.setAttribute('value', `${this.data.name}\n${this.data.info}`);
            infoText.setAttribute('visible', true);
            
            // 3秒後に非表示
            setTimeout(() => {
                infoText.setAttribute('visible', false);
            }, 3000);
        });
        
        this.el.addEventListener('mouseenter', () => {
            this.el.setAttribute('material', 'emissive', '#444');
            this.el.setAttribute('material', 'emissiveIntensity', '0.2');
        });
        
        this.el.addEventListener('mouseleave', () => {
            this.el.setAttribute('material', 'emissive', '#000');
            this.el.setAttribute('material', 'emissiveIntensity', '0');
        });
    }
});

// 道路標示コンポーネント
AFRAME.registerComponent('road-markings', {
    init: function() {
        // センターライン（東西道路）
        for (let i = -70; i < 70; i += 8) {
            const marking = document.createElement('a-plane');
            marking.setAttribute('position', `${i} 0.02 65`);
            marking.setAttribute('rotation', '-90 0 0');
            marking.setAttribute('width', '2');
            marking.setAttribute('height', '0.3');
            marking.setAttribute('color', 'white');
            this.el.appendChild(marking);
        }
        
        // センターライン（南北道路）
        for (let i = -60; i < 60; i += 8) {
            const marking = document.createElement('a-plane');
            marking.setAttribute('position', `-90 0.02 ${i}`);
            marking.setAttribute('rotation', '-90 90 0');
            marking.setAttribute('width', '2');
            marking.setAttribute('height', '0.3');
            marking.setAttribute('color', 'white');
            this.el.appendChild(marking);
        }
    }
});

// 横断歩道コンポーネント
AFRAME.registerComponent('crosswalk', {
    schema: {
        width: {type: 'number', default: 10},
        length: {type: 'number', default: 8}
    },
    
    init: function() {
        const stripeWidth = 0.5;
        const gap = 0.5;
        const stripeCount = Math.floor(this.data.width / (stripeWidth + gap));
        
        for (let i = 0; i < stripeCount; i++) {
            const stripe = document.createElement('a-plane');
            stripe.setAttribute('position', `${-this.data.width / 2 + i * (stripeWidth + gap) + stripeWidth / 2} 0 0`);
            stripe.setAttribute('rotation', '-90 0 0');
            stripe.setAttribute('width', stripeWidth);
            stripe.setAttribute('height', this.data.length);
            stripe.setAttribute('color', 'white');
            this.el.appendChild(stripe);
        }
    }
});

// 木々を配置するコンポーネント
AFRAME.registerComponent('trees', {
    init: function() {
        const treePositions = [
            // 緑地エリアの木
            { x: -30, y: 0, z: 35 },
            { x: -25, y: 0, z: 25 },
            { x: -35, y: 0, z: 28 },
            { x: -28, y: 0, z: 32 },
            { x: -32, y: 0, z: 22 },
            // 建物周辺
            { x: 30, y: 0, z: 40 },
            { x: 35, y: 0, z: 45 },
            { x: 25, y: 0, z: 35 },
            { x: -60, y: 0, z: 10 },
            { x: -65, y: 0, z: 15 },
            { x: -70, y: 0, z: 5 },
            { x: 40, y: 0, z: -20 },
            { x: 45, y: 0, z: -25 },
            { x: 35, y: 0, z: -15 },
            // 道路沿い
            { x: -80, y: 0, z: 50 },
            { x: -60, y: 0, z: 50 },
            { x: -40, y: 0, z: 50 },
            { x: -20, y: 0, z: 50 },
            { x: 0, y: 0, z: 50 },
            { x: 20, y: 0, z: 50 },
            { x: 40, y: 0, z: 50 },
            { x: 60, y: 0, z: 50 },
            // キャンパス内
            { x: -5, y: 0, z: 10 },
            { x: -15, y: 0, z: 5 },
            { x: 5, y: 0, z: -5 },
            { x: 15, y: 0, z: -10 }
        ];
        
        treePositions.forEach(pos => {
            const tree = document.createElement('a-entity');
            tree.setAttribute('position', pos);
            
            // 幹
            const trunk = document.createElement('a-cylinder');
            trunk.setAttribute('position', '0 2 0');
            trunk.setAttribute('radius', '0.5');
            trunk.setAttribute('height', '4');
            trunk.setAttribute('color', '#8B4513');
            trunk.setAttribute('shadow', 'cast: true');
            
            // 葉
            const leaves = document.createElement('a-sphere');
            leaves.setAttribute('position', '0 5 0');
            leaves.setAttribute('radius', '3');
            leaves.setAttribute('color', '#228B22');
            leaves.setAttribute('segments-width', '8');
            leaves.setAttribute('segments-height', '6');
            leaves.setAttribute('shadow', 'cast: true');
            
            tree.appendChild(trunk);
            tree.appendChild(leaves);
            this.el.appendChild(tree);
        });
    }
});

// 街路灯コンポーネント
AFRAME.registerComponent('street-lights', {
    init: function() {
        const lampPositions = [
            { x: -80, z: 65 },
            { x: -40, z: 65 },
            { x: 0, z: 65 },
            { x: 40, z: 65 },
            { x: 80, z: 65 },
            { x: -90, z: 30 },
            { x: -90, z: 0 },
            { x: -90, z: -30 }
        ];
        
        lampPositions.forEach(pos => {
            const lamp = document.createElement('a-entity');
            lamp.setAttribute('position', `${pos.x} 0 ${pos.z}`);
            
            // ポール
            const pole = document.createElement('a-cylinder');
            pole.setAttribute('position', '0 4 0');
            pole.setAttribute('radius', '0.15');
            pole.setAttribute('height', '8');
            pole.setAttribute('color', '#666');
            pole.setAttribute('shadow', 'cast: true');
            
            // ライト部分
            const lightBox = document.createElement('a-box');
            lightBox.setAttribute('position', '0 8 0');
            lightBox.setAttribute('width', '1');
            lightBox.setAttribute('height', '0.5');
            lightBox.setAttribute('depth', '0.5');
            lightBox.setAttribute('color', 'white');
            lightBox.setAttribute('material', 'emissive: #FFFF99; emissiveIntensity: 0.5');
            
            // 実際の光源
            const light = document.createElement('a-light');
            light.setAttribute('type', 'point');
            light.setAttribute('position', '0 8 0');
            light.setAttribute('intensity', '0.3');
            light.setAttribute('distance', '20');
            light.setAttribute('color', '#FFFFCC');
            
            lamp.appendChild(pole);
            lamp.appendChild(lightBox);
            lamp.appendChild(light);
            this.el.appendChild(lamp);
        });
    }
});