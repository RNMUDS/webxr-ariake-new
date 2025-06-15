const puppeteer = require('puppeteer');
const path = require('path');

async function testWebXR() {
    const browser = await puppeteer.launch({ 
        headless: false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // コンソールエラーを監視
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('error', err => console.error('PAGE ERROR:', err));
    
    console.log('Navigating to WebXR scene...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Three.jsシーンが読み込まれるまで待機
    await page.waitForTimeout(5000);
    
    // Three.jsオブジェクトの存在確認
    const hasThree = await page.evaluate(() => {
        return typeof window.THREE !== 'undefined';
    });
    console.log('THREE.js loaded:', hasThree);
    
    const hasCampus = await page.evaluate(() => {
        return typeof window.campus !== 'undefined';
    });
    console.log('Campus object exists:', hasCampus);
    
    // シーンの状態確認
    const sceneInfo = await page.evaluate(() => {
        if (window.campus && window.campus.scene) {
            return {
                children: window.campus.scene.children.length,
                camera: window.campus.camera.position,
                renderer: {
                    width: window.campus.renderer.domElement.width,
                    height: window.campus.renderer.domElement.height
                }
            };
        }
        return null;
    });
    console.log('Scene info:', JSON.stringify(sceneInfo, null, 2));
    
    // スクリーンショット
    const screenshotPath = path.join(__dirname, '..', 'captures', 'webxr', 'test-screenshot.png');
    await page.screenshot({ path: screenshotPath });
    console.log('Screenshot saved:', screenshotPath);
    
    // 30秒待機（デバッグ用）
    console.log('Waiting 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    
    await browser.close();
}

testWebXR().catch(console.error);