const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureStreetViewPhotos() {
    try {
        console.log('Starting Street View capture...');
        
        const browser = await puppeteer.launch({ 
            headless: false,
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        
        // キャンパス周辺のStreet Viewポイント
        const viewPoints = [
            { lat: 35.631436, lng: 139.787314, name: 'campus-front' },
            { lat: 35.631021, lng: 139.787716, name: 'campus-side' },
            { lat: 35.631654, lng: 139.788100, name: 'campus-back' },
            { lat: 35.631875, lng: 139.787468, name: 'campus-corner' }
        ];
        
        for (const point of viewPoints) {
            const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${point.lat},${point.lng}`;
            
            console.log(`Navigating to Street View: ${point.name}...`);
            await page.goto(streetViewUrl, { waitUntil: 'networkidle2', timeout: 60000 });
            
            console.log('Waiting for Street View to load...');
            await page.waitForTimeout(8000);
            
            // スクリーンショットを撮影
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const screenshotPath = path.join(__dirname, '..', 'captures', 'streetview', `streetview-${point.name}-${timestamp}.png`);
            
            console.log('Taking screenshot...');
            await page.screenshot({
                path: screenshotPath,
                fullPage: false
            });
            
            console.log(`Street View captured: ${screenshotPath}`);
        }
        
        await browser.close();
        console.log('Street View capture completed!');
        
    } catch (error) {
        console.error('Error capturing Street View photos:', error);
    }
}

// 実行
captureStreetViewPhotos();