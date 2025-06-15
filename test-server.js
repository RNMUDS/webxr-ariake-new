const puppeteer = require('puppeteer');

async function testServer() {
    const browser = await puppeteer.launch({ 
        headless: false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    });
    
    const page = await browser.newPage();
    
    // ネットワークリクエストを監視
    page.on('response', response => {
        console.log(`${response.status()} - ${response.url()}`);
    });
    
    page.on('requestfailed', request => {
        console.log(`FAILED: ${request.url()} - ${request.failure().errorText}`);
    });
    
    console.log('Checking server...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    await page.waitForTimeout(5000);
    await browser.close();
}

testServer().catch(console.error);