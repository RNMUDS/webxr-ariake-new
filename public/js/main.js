import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/webxr/VRButton.js';
import { CampusModel } from './campus-model.js';

class AriakeCampus {
    constructor() {
        console.log('AriakeCampus constructor called');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.controls = null;
        this.buildings = [];
        console.log('Starting init...');
        this.init();
    }

    init() {
        // Renderer setup
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.xr.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        // WebXR button
        document.body.appendChild(VRButton.createButton(this.renderer));

        // Camera position
        this.camera.position.set(50, 30, 50);
        this.camera.lookAt(0, 0, 0);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Lighting
        this.setupLighting();

        // Create scene
        this.createGround();
        
        // Use realistic campus model
        this.campusModel = new CampusModel(this.scene);
        this.campusModel.createRealisticCampus();

        // Events
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation
        this.animate();
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Sky
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 100, 500);
    }

    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(300, 300);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x898989 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    /* 古いメソッド - CampusModelに置き換え
    createBuildings() {
        // 武蔵野大学有明キャンパスの主要な建物を配置
        // 実際の配置は航空写真から取得予定
        
        // 1号館 (メインビル)
        this.addBuilding(0, 0, 0, 40, 50, 25, 0xF0F0F0, '1号館');
        
        // 2号館
        this.addBuilding(-50, 0, 0, 30, 40, 20, 0xE8E8E8, '2号館');
        
        // 3号館
        this.addBuilding(50, 0, 0, 30, 35, 20, 0xE8E8E8, '3号館');
        
        // 4号館
        this.addBuilding(0, 0, -40, 35, 30, 25, 0xF5F5F5, '4号館');
    }
    */

    addBuilding(x, y, z, width, height, depth, color, name) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshLambertMaterial({ color: color });
        const building = new THREE.Mesh(geometry, material);
        building.position.set(x, height / 2 + y, z);
        building.castShadow = true;
        building.receiveShadow = true;
        building.userData.name = name;
        
        this.scene.add(building);
        this.buildings.push(building);
        
        // 窓の追加（簡易版）
        this.addWindows(building, width, height, depth);
    }

    addWindows(building, width, height, depth) {
        const windowGeometry = new THREE.PlaneGeometry(2, 3);
        const windowMaterial = new THREE.MeshBasicMaterial({ color: 0x4169E1 });
        
        // 前面と背面の窓
        for (let floor = 0; floor < Math.floor(height / 4); floor++) {
            for (let col = 0; col < Math.floor(width / 5); col++) {
                // 前面
                const windowFront = new THREE.Mesh(windowGeometry, windowMaterial);
                windowFront.position.set(
                    col * 5 - width / 2 + 2.5,
                    floor * 4 - height / 2 + 2,
                    depth / 2 + 0.1
                );
                building.add(windowFront);
                
                // 背面
                const windowBack = new THREE.Mesh(windowGeometry, windowMaterial);
                windowBack.position.set(
                    col * 5 - width / 2 + 2.5,
                    floor * 4 - height / 2 + 2,
                    -depth / 2 - 0.1
                );
                windowBack.rotation.y = Math.PI;
                building.add(windowBack);
            }
        }
    }

    /* 古いメソッド - CampusModelに置き換え
    createRoads() {
        const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        
        // 東西方向の道路
        const roadEW = new THREE.Mesh(
            new THREE.PlaneGeometry(300, 10),
            roadMaterial
        );
        roadEW.rotation.x = -Math.PI / 2;
        roadEW.position.y = 0.01;
        roadEW.position.z = 70;
        this.scene.add(roadEW);
        
        // 南北方向の道路
        const roadNS = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 300),
            roadMaterial
        );
        roadNS.rotation.x = -Math.PI / 2;
        roadNS.position.y = 0.01;
        roadNS.position.x = -90;
        this.scene.add(roadNS);
        
        // 白線
        this.addRoadMarkings(roadEW);
        this.addRoadMarkings(roadNS);
    }

    addRoadMarkings(road) {
        const markingMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const markingGeometry = new THREE.PlaneGeometry(2, 0.3);
        
        for (let i = -140; i < 140; i += 10) {
            const marking = new THREE.Mesh(markingGeometry, markingMaterial);
            marking.position.y = 0.02;
            if (road.geometry.parameters.width > road.geometry.parameters.height) {
                marking.position.x = i;
            } else {
                marking.position.z = i;
                marking.rotation.z = Math.PI / 2;
            }
            road.add(marking);
        }
    }
    */

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        this.renderer.setAnimationLoop(() => {
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        });
    }
}

// Initialize
try {
    const campus = new AriakeCampus();
    window.campus = campus;
    console.log('Campus initialized successfully');
} catch (error) {
    console.error('Error initializing campus:', error);
}