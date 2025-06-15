import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class CampusModel {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        this.roads = [];
    }

    createRealisticCampus() {
        // 航空写真に基づいた実際の建物配置
        // 武蔵野大学有明キャンパスの建物
        
        // 1号館（西側の大きな建物）
        this.addComplexBuilding({
            position: { x: -40, z: 0 },
            sections: [
                { width: 35, height: 40, depth: 50, offsetX: 0, offsetZ: 0 },
                { width: 25, height: 40, depth: 30, offsetX: 20, offsetZ: 10 },
                { width: 20, height: 35, depth: 25, offsetX: -15, offsetZ: 20 }
            ],
            color: 0xE8E8E8,
            name: '1号館'
        });

        // 2号館（北側の建物）
        this.addComplexBuilding({
            position: { x: 20, z: -35 },
            sections: [
                { width: 45, height: 35, depth: 25, offsetX: 0, offsetZ: 0 },
                { width: 30, height: 35, depth: 20, offsetX: 15, offsetZ: -10 }
            ],
            color: 0xF0F0F0,
            name: '2号館'
        });

        // 3号館（東側の建物）
        this.addComplexBuilding({
            position: { x: 50, z: 10 },
            sections: [
                { width: 30, height: 45, depth: 35, offsetX: 0, offsetZ: 0 }
            ],
            color: 0xF5F5F5,
            name: '3号館'
        });

        // 4号館（南東の建物）
        this.addBuilding(70, 0, 35, 25, 30, 20, 0xEBEBEB, '4号館');

        // 5号館（中央の低層建物）
        this.addBuilding(0, 0, 0, 30, 15, 25, 0xF8F8F8, '5号館');

        // 駐車場構造物
        this.addParkingStructure(-70, 0, -30, 40, 8, 50);

        // 実際の道路配置
        this.createRealisticRoads();

        // 歩道と緑地
        this.createSidewalksAndGreenery();

        // 街路灯と詳細
        this.addStreetDetails();
    }

    addComplexBuilding(config) {
        const group = new THREE.Group();
        
        config.sections.forEach(section => {
            const geometry = new THREE.BoxGeometry(section.width, section.height, section.depth);
            const material = new THREE.MeshLambertMaterial({ color: config.color });
            const building = new THREE.Mesh(geometry, material);
            
            building.position.set(
                section.offsetX,
                section.height / 2,
                section.offsetZ
            );
            
            building.castShadow = true;
            building.receiveShadow = true;
            
            // 窓の追加
            this.addRealisticWindows(building, section.width, section.height, section.depth);
            
            group.add(building);
        });
        
        group.position.set(config.position.x, 0, config.position.z);
        group.userData.name = config.name;
        
        this.scene.add(group);
        this.buildings.push(group);
    }

    addBuilding(x, y, z, width, height, depth, color, name) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshLambertMaterial({ color: color });
        const building = new THREE.Mesh(geometry, material);
        building.position.set(x, height / 2 + y, z);
        building.castShadow = true;
        building.receiveShadow = true;
        building.userData.name = name;
        
        this.addRealisticWindows(building, width, height, depth);
        
        this.scene.add(building);
        this.buildings.push(building);
    }

    addRealisticWindows(building, width, height, depth) {
        const windowGeometry = new THREE.PlaneGeometry(1.5, 2.5);
        const windowMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x87CEEB,
            emissive: 0x222222,
            specular: 0xFFFFFF,
            shininess: 100
        });
        
        const floorHeight = 3.5;
        const windowSpacing = 3;
        const floors = Math.floor(height / floorHeight);
        const windowsPerFloor = Math.floor(width / windowSpacing);
        
        // 前面と背面の窓
        for (let floor = 0; floor < floors; floor++) {
            for (let col = 0; col < windowsPerFloor; col++) {
                const xPos = col * windowSpacing - width / 2 + windowSpacing / 2;
                const yPos = floor * floorHeight - height / 2 + floorHeight / 2;
                
                // 前面
                const windowFront = new THREE.Mesh(windowGeometry, windowMaterial);
                windowFront.position.set(xPos, yPos, depth / 2 + 0.1);
                building.add(windowFront);
                
                // 背面
                const windowBack = new THREE.Mesh(windowGeometry, windowMaterial);
                windowBack.position.set(xPos, yPos, -depth / 2 - 0.1);
                windowBack.rotation.y = Math.PI;
                building.add(windowBack);
            }
        }
        
        // 側面の窓
        const sideWindowsPerFloor = Math.floor(depth / windowSpacing);
        for (let floor = 0; floor < floors; floor++) {
            for (let col = 0; col < sideWindowsPerFloor; col++) {
                const zPos = col * windowSpacing - depth / 2 + windowSpacing / 2;
                const yPos = floor * floorHeight - height / 2 + floorHeight / 2;
                
                // 右側面
                const windowRight = new THREE.Mesh(windowGeometry, windowMaterial);
                windowRight.position.set(width / 2 + 0.1, yPos, zPos);
                windowRight.rotation.y = Math.PI / 2;
                building.add(windowRight);
                
                // 左側面
                const windowLeft = new THREE.Mesh(windowGeometry, windowMaterial);
                windowLeft.position.set(-width / 2 - 0.1, yPos, zPos);
                windowLeft.rotation.y = -Math.PI / 2;
                building.add(windowLeft);
            }
        }
    }

    addParkingStructure(x, y, z, width, height, depth) {
        // 駐車場の基本構造
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshLambertMaterial({ color: 0xCCCCCC });
        const parking = new THREE.Mesh(geometry, material);
        parking.position.set(x, height / 2, z);
        parking.castShadow = true;
        parking.receiveShadow = true;
        
        // 駐車場の開口部
        const openingGeometry = new THREE.BoxGeometry(width * 0.9, height * 0.8, 2);
        const openingMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
        
        for (let i = 0; i < 3; i++) {
            const opening = new THREE.Mesh(openingGeometry, openingMaterial);
            opening.position.set(0, 0, depth / 2 - i * (depth / 3));
            parking.add(opening);
        }
        
        this.scene.add(parking);
    }

    createRealisticRoads() {
        const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        
        // メイン道路（東西）
        const mainRoad = new THREE.Mesh(
            new THREE.PlaneGeometry(200, 12),
            roadMaterial
        );
        mainRoad.rotation.x = -Math.PI / 2;
        mainRoad.position.set(0, 0.01, 65);
        this.scene.add(mainRoad);
        
        // サブ道路（南北）
        const subRoad = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 150),
            roadMaterial
        );
        subRoad.rotation.x = -Math.PI / 2;
        subRoad.position.set(-90, 0.01, 0);
        this.scene.add(subRoad);
        
        // キャンパス内道路
        const campusRoad1 = new THREE.Mesh(
            new THREE.PlaneGeometry(8, 100),
            new THREE.MeshLambertMaterial({ color: 0x666666 })
        );
        campusRoad1.rotation.x = -Math.PI / 2;
        campusRoad1.position.set(10, 0.02, 0);
        this.scene.add(campusRoad1);
        
        // 道路標示
        this.addRoadMarkings(mainRoad);
        this.addRoadMarkings(subRoad);
        
        // 横断歩道
        this.addCrosswalk(0, 0.03, 59, 12, 8);
        this.addCrosswalk(-84, 0.03, 0, 8, 10);
    }

    addRoadMarkings(road) {
        const markingMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const centerLineGeometry = new THREE.PlaneGeometry(2, 0.3);
        const edgeLineGeometry = new THREE.PlaneGeometry(road.geometry.parameters.width * 0.95, 0.2);
        
        // センターライン
        for (let i = -70; i < 70; i += 8) {
            const marking = new THREE.Mesh(centerLineGeometry, markingMaterial);
            marking.position.y = 0.01;
            if (road.geometry.parameters.width > road.geometry.parameters.height) {
                marking.position.x = i;
            } else {
                marking.position.z = i;
                marking.rotation.z = Math.PI / 2;
            }
            road.add(marking);
        }
        
        // エッジライン
        const edgeLine1 = new THREE.Mesh(edgeLineGeometry, markingMaterial);
        const edgeLine2 = new THREE.Mesh(edgeLineGeometry, markingMaterial);
        edgeLine1.position.y = 0.01;
        edgeLine2.position.y = 0.01;
        
        if (road.geometry.parameters.width > road.geometry.parameters.height) {
            edgeLine1.position.z = road.geometry.parameters.height / 2 - 0.5;
            edgeLine2.position.z = -road.geometry.parameters.height / 2 + 0.5;
        } else {
            edgeLine1.position.x = road.geometry.parameters.width / 2 - 0.5;
            edgeLine2.position.x = -road.geometry.parameters.width / 2 + 0.5;
            edgeLine1.rotation.z = Math.PI / 2;
            edgeLine2.rotation.z = Math.PI / 2;
        }
        
        road.add(edgeLine1);
        road.add(edgeLine2);
    }

    addCrosswalk(x, y, z, width, length) {
        const stripeWidth = 0.5;
        const gap = 0.5;
        const stripeCount = Math.floor(width / (stripeWidth + gap));
        
        for (let i = 0; i < stripeCount; i++) {
            const stripe = new THREE.Mesh(
                new THREE.PlaneGeometry(stripeWidth, length),
                new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
            );
            stripe.rotation.x = -Math.PI / 2;
            stripe.position.set(
                x - width / 2 + i * (stripeWidth + gap) + stripeWidth / 2,
                y,
                z
            );
            this.scene.add(stripe);
        }
    }

    createSidewalksAndGreenery() {
        // 歩道
        const sidewalkMaterial = new THREE.MeshLambertMaterial({ color: 0xAAAAAA });
        
        const sidewalk1 = new THREE.Mesh(
            new THREE.PlaneGeometry(200, 4),
            sidewalkMaterial
        );
        sidewalk1.rotation.x = -Math.PI / 2;
        sidewalk1.position.set(0, 0.02, 57);
        this.scene.add(sidewalk1);
        
        // 緑地
        const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x3A5F3A });
        
        const greenArea1 = new THREE.Mesh(
            new THREE.PlaneGeometry(30, 20),
            grassMaterial
        );
        greenArea1.rotation.x = -Math.PI / 2;
        greenArea1.position.set(-30, 0.02, 30);
        this.scene.add(greenArea1);
        
        // 木を追加
        this.addTrees();
    }

    addTrees() {
        const treePositions = [
            { x: -30, z: 35 },
            { x: -25, z: 25 },
            { x: -35, z: 28 },
            { x: 30, z: 40 },
            { x: 35, z: 45 },
            { x: -60, z: 10 },
            { x: -65, z: 15 }
        ];
        
        treePositions.forEach(pos => {
            const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 4);
            const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.set(pos.x, 2, pos.z);
            trunk.castShadow = true;
            
            const foliageGeometry = new THREE.SphereGeometry(3, 8, 6);
            const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.set(pos.x, 5, pos.z);
            foliage.castShadow = true;
            
            this.scene.add(trunk);
            this.scene.add(foliage);
        });
    }

    addStreetDetails() {
        // 街路灯
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
            // ポール
            const poleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 8);
            const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
            const pole = new THREE.Mesh(poleGeometry, poleMaterial);
            pole.position.set(pos.x, 4, pos.z);
            pole.castShadow = true;
            
            // ライト部分
            const lightGeometry = new THREE.BoxGeometry(1, 0.5, 0.5);
            const lightMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xFFFFFF,
                emissive: 0xFFFF99,
                emissiveIntensity: 0.3
            });
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.set(pos.x, 8, pos.z);
            
            this.scene.add(pole);
            this.scene.add(light);
        });
    }
}