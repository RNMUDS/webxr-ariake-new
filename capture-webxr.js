const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureWebXRScreenshots() {
    const browser = await puppeteer.launch({ 
        headless: false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote'
        ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // ローカルサーバーに接続
    console.log('Navigating to WebXR scene...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Three.jsシーンが読み込まれるまで待機
    await page.waitForTimeout(5000);
    
    // シーンの初期化を待つ
    await page.waitForFunction(() => {
        return window.campus && window.campus.scene && window.campus.scene.children.length > 0;
    }, { timeout: 10000 });
    
    // UIを非表示
    await page.evaluate(() => {
        const info = document.getElementById('info');
        const vrButton = document.getElementById('vr-button');
        if (info) info.style.display = 'none';
        if (vrButton) vrButton.style.display = 'none';
    });
    
    // カメラ位置とアングルの定義
    const cameraPositions = [
        { x: 50, y: 30, z: 50, lookAtX: 0, lookAtY: 0, lookAtZ: 0, name: 'overview' },
        { x: 0, y: 100, z: 0, lookAtX: 0, lookAtY: 0, lookAtZ: 0, name: 'aerial' },
        { x: 0, y: 1.6, z: 100, lookAtX: 0, lookAtY: 10, lookAtZ: 0, name: 'ground-south' },
        { x: 100, y: 1.6, z: 0, lookAtX: 0, lookAtY: 10, lookAtZ: 0, name: 'ground-east' },
        { x: 0, y: 1.6, z: -100, lookAtX: 0, lookAtY: 10, lookAtZ: 0, name: 'ground-north' },
        { x: -100, y: 1.6, z: 0, lookAtX: 0, lookAtY: 10, lookAtZ: 0, name: 'ground-west' },
        { x: 30, y: 20, z: 30, lookAtX: 0, lookAtY: 15, lookAtZ: 0, name: 'building-1-angle' },
        { x: -70, y: 20, z: 30, lookAtX: -50, lookAtY: 15, lookAtZ: 0, name: 'building-2-angle' },
        { x: 70, y: 20, z: 30, lookAtX: 50, lookAtY: 15, lookAtZ: 0, name: 'building-3-angle' }
    ];
    
    for (const pos of cameraPositions) {
        // カメラ位置を設定
        await page.evaluate((position) => {
            if (window.campus) {
                window.campus.camera.position.set(position.x, position.y, position.z);
                window.campus.camera.lookAt(position.lookAtX, position.lookAtY, position.lookAtZ);
                window.campus.camera.updateProjectionMatrix();
                window.campus.controls.target.set(position.lookAtX, position.lookAtY, position.lookAtZ);
                window.campus.controls.update();
            }
        }, pos);
        
        await page.waitForTimeout(1000);
        
        // スクリーンショットを撮影
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotPath = path.join(__dirname, '..', 'captures', 'webxr', `webxr-${pos.name}-${timestamp}.png`);
        
        await page.screenshot({
            path: screenshotPath,
            fullPage: false
        });
        
        console.log(`WebXR view captured: ${screenshotPath}`);
    }
    
    // 異なる時間帯のライティングをシミュレート
    const lightingConditions = [
        { name: 'morning', intensity: 0.6, color: 0xFFE4B5 },
        { name: 'noon', intensity: 1.0, color: 0xFFFFFF },
        { name: 'evening', intensity: 0.4, color: 0xFFB347 },
        { name: 'night', intensity: 0.2, color: 0x6495ED }
    ];
    
    for (const lighting of lightingConditions) {
        await page.evaluate((light) => {
            if (window.campus && window.campus.scene) {
                // 環境光を調整
                const ambientLight = window.campus.scene.children.find(child => child.type === 'AmbientLight');
                if (ambientLight) {
                    ambientLight.intensity = light.intensity * 0.6;
                    ambientLight.color.setHex(light.color);
                }
                
                // 方向光を調整
                const directionalLight = window.campus.scene.children.find(child => child.type === 'DirectionalLight');
                if (directionalLight) {
                    directionalLight.intensity = light.intensity * 0.8;
                }
                
                // 背景色を調整
                if (light.name === 'night') {
                    window.campus.scene.background = new THREE.Color(0x191970);
                    window.campus.scene.fog.color.setHex(0x191970);
                } else if (light.name === 'evening') {
                    window.campus.scene.background = new THREE.Color(0xFF6347);
                    window.campus.scene.fog.color.setHex(0xFF6347);
                } else {
                    window.campus.scene.background = new THREE.Color(0x87CEEB);
                    window.campus.scene.fog.color.setHex(0x87CEEB);
                }
            }
        }, lighting);
        
        await page.waitForTimeout(1000);
        
        // 各ライティング条件でスクリーンショット
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const lightingScreenshotPath = path.join(__dirname, '..', 'captures', 'webxr', `webxr-lighting-${lighting.name}-${timestamp}.png`);
        
        await page.screenshot({
            path: lightingScreenshotPath,
            fullPage: false
        });
        
        console.log(`${lighting.name} lighting captured: ${lightingScreenshotPath}`);
    }
    
    await browser.close();
    console.log('WebXR screenshots captured successfully!');
}

// 実行
captureWebXRScreenshots().catch(console.error);