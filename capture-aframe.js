const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureAFrameScreenshots() {
    const browser = await puppeteer.launch({ 
        headless: false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--ignore-certificate-errors'
        ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // コンソールログを監視
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    console.log('Navigating to A-Frame scene...');
    await page.goto('https://localhost:3000/', { waitUntil: 'networkidle2' });
    
    // A-Frameシーンが読み込まれるまで待機
    console.log('Waiting for A-Frame to initialize...');
    await page.waitForTimeout(8000);
    
    // A-Frameシーンの存在確認
    const hasAFrame = await page.evaluate(() => {
        return typeof AFRAME !== 'undefined' && 
               document.querySelector('a-scene') && 
               document.querySelector('a-scene').hasLoaded;
    });
    console.log('A-Frame loaded:', hasAFrame);
    
    // UIを非表示
    await page.evaluate(() => {
        const infoPanel = document.getElementById('info-panel');
        if (infoPanel) infoPanel.style.display = 'none';
    });
    
    // カメラ位置とアングルの定義
    const cameraPositions = [
        { x: 0, y: 50, z: 100, rotX: -30, rotY: 0, name: 'overview-south' },
        { x: 0, y: 100, z: 0, rotX: -90, rotY: 0, name: 'aerial-top' },
        { x: 100, y: 30, z: 0, rotX: -15, rotY: -90, name: 'overview-east' },
        { x: -100, y: 30, z: 0, rotX: -15, rotY: 90, name: 'overview-west' },
        { x: 0, y: 30, z: -100, rotX: -15, rotY: 180, name: 'overview-north' },
        { x: 0, y: 1.6, z: 40, rotX: 0, rotY: 0, name: 'ground-level-south' },
        { x: -30, y: 1.6, z: 0, rotX: 0, rotY: 90, name: 'ground-level-building1' },
        { x: 50, y: 1.6, z: 10, rotX: 0, rotY: -90, name: 'ground-level-building3' },
        { x: 0, y: 20, z: 50, rotX: -10, rotY: 0, name: 'mid-level-campus' }
    ];
    
    for (const pos of cameraPositions) {
        // カメラ位置を設定
        await page.evaluate((position) => {
            const rig = document.querySelector('#rig');
            const camera = document.querySelector('[camera]');
            if (rig) {
                rig.setAttribute('position', `${position.x} ${position.y} ${position.z}`);
            }
            if (camera) {
                camera.setAttribute('rotation', `${position.rotX} ${position.rotY} 0`);
            }
        }, pos);
        
        await page.waitForTimeout(2000);
        
        // スクリーンショットを撮影
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotPath = path.join(__dirname, '..', 'captures', 'webxr', `aframe-${pos.name}-${timestamp}.png`);
        
        await page.screenshot({
            path: screenshotPath,
            fullPage: false
        });
        
        console.log(`A-Frame view captured: ${screenshotPath}`);
    }
    
    // 異なる時間帯のライティング
    const lightingConditions = [
        { name: 'morning', ambient: '#FFE4B5', intensity: 0.4, dirColor: '#FFFACD' },
        { name: 'noon', ambient: '#FFFFFF', intensity: 0.6, dirColor: '#FFFFFF' },
        { name: 'evening', ambient: '#FFB347', intensity: 0.3, dirColor: '#FF8C00' },
        { name: 'night', ambient: '#4169E1', intensity: 0.2, dirColor: '#6495ED' }
    ];
    
    // overview位置に戻す
    await page.evaluate(() => {
        const rig = document.querySelector('#rig');
        if (rig) {
            rig.setAttribute('position', '0 50 100');
        }
    });
    
    for (const lighting of lightingConditions) {
        await page.evaluate((light) => {
            // アンビエントライト
            const ambientLight = document.querySelector('a-light[type="ambient"]');
            if (ambientLight) {
                ambientLight.setAttribute('color', light.ambient);
                ambientLight.setAttribute('intensity', light.intensity);
            }
            
            // ディレクショナルライト
            const dirLight = document.querySelector('a-light[type="directional"]');
            if (dirLight) {
                dirLight.setAttribute('color', light.dirColor);
                dirLight.setAttribute('intensity', light.intensity * 1.3);
            }
            
            // 環境を更新
            const env = document.querySelector('[environment]');
            if (env) {
                if (light.name === 'night') {
                    env.setAttribute('environment', 'preset: starry; groundColor: #223');
                } else if (light.name === 'evening') {
                    env.setAttribute('environment', 'preset: goldenhour; groundColor: #553');
                } else {
                    env.setAttribute('environment', 'preset: japan; groundColor: #445');
                }
            }
        }, lighting);
        
        await page.waitForTimeout(2000);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const lightingScreenshotPath = path.join(__dirname, '..', 'captures', 'webxr', `aframe-lighting-${lighting.name}-${timestamp}.png`);
        
        await page.screenshot({
            path: lightingScreenshotPath,
            fullPage: false
        });
        
        console.log(`${lighting.name} lighting captured: ${lightingScreenshotPath}`);
    }
    
    await browser.close();
    console.log('A-Frame screenshots captured successfully!');
}

// 実行
captureAFrameScreenshots().catch(console.error);