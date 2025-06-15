const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureStreetViewPhotos() {
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
    
    // 武蔵野大学有明キャンパス周辺の撮影ポイント（ユーザー指定座標を基準）
    const viewPoints = [
        { lat: 35.6312519, lng: 139.787512, heading: 0, name: 'main-north' },
        { lat: 35.6312519, lng: 139.787512, heading: 90, name: 'main-east' },
        { lat: 35.6312519, lng: 139.787512, heading: 180, name: 'main-south' },
        { lat: 35.6312519, lng: 139.787512, heading: 270, name: 'main-west' },
        { lat: 35.6310, lng: 139.7873, heading: 45, name: 'corner-sw' },
        { lat: 35.6315, lng: 139.7873, heading: 135, name: 'corner-nw' },
        { lat: 35.6315, lng: 139.7877, heading: 225, name: 'corner-ne' },
        { lat: 35.6310, lng: 139.7877, heading: 315, name: 'corner-se' }
    ];
    
    for (const point of viewPoints) {
        // Street Viewの URL
        const streetViewUrl = `https://www.google.com/maps/@${point.lat},${point.lng},3a,75y,${point.heading}h,90t/data=!3m6!1e1!3m4!1s0x0:0x0!2e0!7i16384!8i8192`;
        
        console.log(`Navigating to Street View: ${point.name}...`);
        await page.goto(streetViewUrl, { waitUntil: 'networkidle2' });
        
        // Street Viewが読み込まれるまで待機
        await page.waitForTimeout(5000);
        
        // UIを非表示にする
        await page.evaluate(() => {
            // Street ViewのUI要素を非表示
            const uiSelectors = [
                '.scene-footer',
                '.widget-scene-canvas',
                '.watermark',
                '.app-viewcard-strip',
                '.widget-titlecard',
                'button[aria-label="戻る"]',
                '.scene-footer-container',
                '[data-tooltip="Street View を閉じる"]'
            ];
            
            uiSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    if (el) el.style.display = 'none';
                });
            });
        });
        
        await page.waitForTimeout(2000);
        
        // スクリーンショットを撮影
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotPath = path.join(__dirname, '..', 'captures', 'streetview', `streetview-${point.name}-${timestamp}.png`);
        
        await page.screenshot({
            path: screenshotPath,
            fullPage: false
        });
        
        console.log(`Street View captured: ${screenshotPath}`);
        
        // 異なる角度での撮影（建物の詳細を捉える）
        const pitchAngles = [0, 15, -15];
        for (const pitch of pitchAngles) {
            // マウスドラッグで視点を調整
            await page.mouse.move(960, 540);
            await page.mouse.down();
            await page.mouse.move(960, 540 + pitch * 10);
            await page.mouse.up();
            await page.waitForTimeout(1000);
            
            const pitchScreenshotPath = path.join(__dirname, '..', 'captures', 'streetview', `streetview-${point.name}-pitch${pitch}-${timestamp}.png`);
            await page.screenshot({
                path: pitchScreenshotPath,
                fullPage: false
            });
            
            console.log(`Pitch angle ${pitch}° captured: ${pitchScreenshotPath}`);
        }
    }
    
    // 建物の詳細撮影（ズームイン）
    console.log('Capturing building details...');
    
    const detailPoints = [
        { lat: 35.6330, lng: 139.7843, name: 'building-1-front' },
        { lat: 35.6328, lng: 139.7841, name: 'building-2-side' },
        { lat: 35.6331, lng: 139.7845, name: 'building-3-entrance' }
    ];
    
    for (const detail of detailPoints) {
        const detailUrl = `https://www.google.com/maps/@${detail.lat},${detail.lng},3a,90y,0h,90t/data=!3m6!1e1!3m4!1s0x0:0x0!2e0!7i16384!8i8192`;
        
        await page.goto(detailUrl, { waitUntil: 'networkidle2' });
        await page.waitForTimeout(4000);
        
        // ズームイン
        await page.keyboard.press('+');
        await page.keyboard.press('+');
        await page.waitForTimeout(1000);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const detailScreenshotPath = path.join(__dirname, '..', 'captures', 'streetview', `detail-${detail.name}-${timestamp}.png`);
        
        await page.screenshot({
            path: detailScreenshotPath,
            fullPage: false
        });
        
        console.log(`Building detail captured: ${detailScreenshotPath}`);
    }
    
    await browser.close();
    console.log('Street View capture completed!');
}

// 実行
captureStreetViewPhotos().catch(console.error);