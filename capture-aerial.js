const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureAerialPhotos() {
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
    
    // 武蔵野大学有明キャンパスの座標（ユーザー指定の正確な位置）
    const ariakeLat = 35.6312519;
    const ariakeLng = 139.787512;
    
    // Google Maps航空写真モード
    const mapsUrl = `https://www.google.com/maps/@${ariakeLat},${ariakeLng},18z/data=!3m1!1e3`;
    
    console.log('Navigating to Google Maps...');
    await page.goto(mapsUrl, { waitUntil: 'networkidle2' });
    
    // 衛星写真モードに切り替え
    await page.waitForTimeout(3000);
    
    // UIを非表示にする
    await page.evaluate(() => {
        // サイドバーを閉じる
        const closeButton = document.querySelector('[aria-label="サイドパネルを閉じる"]');
        if (closeButton) closeButton.click();
        
        // その他のUIを非表示
        const uiElements = [
            '.widget-scene-canvas',
            '.app-viewcard-strip',
            '.searchbox',
            '.widget-minimap',
            '.widget-zoom'
        ];
        
        uiElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el) el.style.display = 'none';
            });
        });
    });
    
    await page.waitForTimeout(2000);
    
    // キャンパス全体の撮影
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(__dirname, '..', 'captures', 'aerial', `ariake-campus-${timestamp}.png`);
    
    await page.screenshot({
        path: screenshotPath,
        fullPage: false
    });
    
    console.log(`Aerial photo saved: ${screenshotPath}`);
    
    // 異なるズームレベルでの撮影
    const zoomLevels = [17, 18, 19, 20];
    
    for (const zoom of zoomLevels) {
        const zoomUrl = `https://www.google.com/maps/@${ariakeLat},${ariakeLng},${zoom}z/data=!3m1!1e3`;
        await page.goto(zoomUrl, { waitUntil: 'networkidle2' });
        await page.waitForTimeout(2000);
        
        const zoomScreenshotPath = path.join(__dirname, '..', 'captures', 'aerial', `ariake-campus-zoom${zoom}-${timestamp}.png`);
        await page.screenshot({
            path: zoomScreenshotPath,
            fullPage: false
        });
        
        console.log(`Zoom level ${zoom} captured: ${zoomScreenshotPath}`);
    }
    
    // 周辺エリアの撮影
    const offsets = [
        { lat: 0.002, lng: 0, name: 'north' },
        { lat: -0.002, lng: 0, name: 'south' },
        { lat: 0, lng: 0.002, name: 'east' },
        { lat: 0, lng: -0.002, name: 'west' }
    ];
    
    for (const offset of offsets) {
        const offsetLat = ariakeLat + offset.lat;
        const offsetLng = ariakeLng + offset.lng;
        const offsetUrl = `https://www.google.com/maps/@${offsetLat},${offsetLng},18z/data=!3m1!1e3`;
        
        await page.goto(offsetUrl, { waitUntil: 'networkidle2' });
        await page.waitForTimeout(2000);
        
        const offsetScreenshotPath = path.join(__dirname, '..', 'captures', 'aerial', `ariake-campus-${offset.name}-${timestamp}.png`);
        await page.screenshot({
            path: offsetScreenshotPath,
            fullPage: false
        });
        
        console.log(`${offset.name} area captured: ${offsetScreenshotPath}`);
    }
    
    await browser.close();
    console.log('Aerial photography capture completed!');
}

// 実行
captureAerialPhotos().catch(console.error);