const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureAerialPhotos() {
    try {
        console.log('Starting aerial photo capture...');
        
        const browser = await puppeteer.launch({ 
            headless: false,
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        
        // ユーザー指定のURL
        const mapsUrl = 'https://www.google.com/maps/@35.6312519,139.787512,212m/data=!3m1!1e3';
        
        console.log('Navigating to Google Maps...');
        await page.goto(mapsUrl, { waitUntil: 'networkidle2', timeout: 60000 });
        
        console.log('Waiting for map to load...');
        await page.waitForTimeout(5000);
        
        // スクリーンショットを撮影
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotPath = path.join(__dirname, '..', 'captures', 'aerial', `ariake-campus-${timestamp}.png`);
        
        console.log('Taking screenshot...');
        await page.screenshot({
            path: screenshotPath,
            fullPage: false
        });
        
        console.log(`Aerial photo saved: ${screenshotPath}`);
        
        await browser.close();
        console.log('Aerial photography capture completed!');
        
    } catch (error) {
        console.error('Error capturing aerial photos:', error);
    }
}

// 実行
captureAerialPhotos();