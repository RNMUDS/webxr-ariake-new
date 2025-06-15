const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

class ImageComparison {
    constructor() {
        this.capturesDir = path.join(__dirname, '..', 'captures');
        this.comparisonDir = path.join(this.capturesDir, 'comparisons');
        
        // 比較ディレクトリを作成
        if (!fs.existsSync(this.comparisonDir)) {
            fs.mkdirSync(this.comparisonDir, { recursive: true });
        }
    }

    async compareImages(realImagePath, virtualImagePath, outputName) {
        try {
            const realImage = await loadImage(realImagePath);
            const virtualImage = await loadImage(virtualImagePath);
            
            // キャンバスサイズを設定（両画像を並べて表示）
            const width = Math.max(realImage.width, virtualImage.width) * 2;
            const height = Math.max(realImage.height, virtualImage.height);
            
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');
            
            // 背景を白に
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            
            // 実写真を左側に描画
            ctx.drawImage(realImage, 0, 0);
            
            // バーチャル画像を右側に描画
            ctx.drawImage(virtualImage, realImage.width, 0);
            
            // ラベルを追加
            ctx.fillStyle = 'black';
            ctx.font = 'bold 30px Arial';
            ctx.fillText('Real', 20, 40);
            ctx.fillText('Virtual', realImage.width + 20, 40);
            
            // 比較画像を保存
            const outputPath = path.join(this.comparisonDir, `${outputName}.png`);
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(outputPath, buffer);
            
            console.log(`Comparison saved: ${outputPath}`);
            
            // 差分分析
            await this.analyzeDifferences(realImage, virtualImage, outputName);
            
        } catch (error) {
            console.error(`Error comparing images: ${error.message}`);
        }
    }

    async analyzeDifferences(realImage, virtualImage, outputName) {
        const diffCanvas = createCanvas(realImage.width, realImage.height);
        const ctx = diffCanvas.getContext('2d');
        
        // 差分マップを作成
        ctx.drawImage(realImage, 0, 0);
        const realData = ctx.getImageData(0, 0, realImage.width, realImage.height);
        
        ctx.clearRect(0, 0, realImage.width, realImage.height);
        ctx.drawImage(virtualImage, 0, 0, realImage.width, realImage.height);
        const virtualData = ctx.getImageData(0, 0, realImage.width, realImage.height);
        
        // 差分を計算
        const diffData = ctx.createImageData(realImage.width, realImage.height);
        let totalDiff = 0;
        
        for (let i = 0; i < realData.data.length; i += 4) {
            const rDiff = Math.abs(realData.data[i] - virtualData.data[i]);
            const gDiff = Math.abs(realData.data[i + 1] - virtualData.data[i + 1]);
            const bDiff = Math.abs(realData.data[i + 2] - virtualData.data[i + 2]);
            
            const avgDiff = (rDiff + gDiff + bDiff) / 3;
            totalDiff += avgDiff;
            
            // 差分を赤色で表示
            diffData.data[i] = avgDiff * 2;     // R
            diffData.data[i + 1] = 0;           // G
            diffData.data[i + 2] = 0;           // B
            diffData.data[i + 3] = avgDiff;     // A
        }
        
        ctx.putImageData(diffData, 0, 0);
        
        // 差分マップを保存
        const diffPath = path.join(this.comparisonDir, `${outputName}-diff.png`);
        const buffer = diffCanvas.toBuffer('image/png');
        fs.writeFileSync(diffPath, buffer);
        
        // 差分スコアを計算
        const avgScore = totalDiff / (realData.data.length / 4) / 255 * 100;
        console.log(`Difference score: ${avgScore.toFixed(2)}%`);
        
        // レポートを生成
        this.generateReport(outputName, avgScore);
    }

    generateReport(outputName, diffScore) {
        const reportPath = path.join(this.comparisonDir, `${outputName}-report.json`);
        
        const report = {
            timestamp: new Date().toISOString(),
            comparisonName: outputName,
            differenceScore: diffScore.toFixed(2),
            recommendations: []
        };
        
        // 差分スコアに基づく推奨事項
        if (diffScore > 50) {
            report.recommendations.push("Major differences detected. Review building geometry and positions.");
        }
        if (diffScore > 30) {
            report.recommendations.push("Moderate differences. Check building details and textures.");
        }
        if (diffScore > 20) {
            report.recommendations.push("Minor differences. Fine-tune colors and lighting.");
        }
        
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`Report saved: ${reportPath}`);
    }

    async compareAllImages() {
        // 航空写真の比較
        const aerialFiles = fs.readdirSync(path.join(this.capturesDir, 'aerial'));
        const webxrAerialFiles = fs.readdirSync(path.join(this.capturesDir, 'webxr'))
            .filter(f => f.includes('aerial'));
        
        if (aerialFiles.length > 0 && webxrAerialFiles.length > 0) {
            await this.compareImages(
                path.join(this.capturesDir, 'aerial', aerialFiles[0]),
                path.join(this.capturesDir, 'webxr', webxrAerialFiles[0]),
                'aerial-comparison'
            );
        }
        
        // Street Viewの比較
        const streetviewFiles = fs.readdirSync(path.join(this.capturesDir, 'streetview'));
        const webxrGroundFiles = fs.readdirSync(path.join(this.capturesDir, 'webxr'))
            .filter(f => f.includes('ground'));
        
        for (let i = 0; i < Math.min(streetviewFiles.length, webxrGroundFiles.length); i++) {
            await this.compareImages(
                path.join(this.capturesDir, 'streetview', streetviewFiles[i]),
                path.join(this.capturesDir, 'webxr', webxrGroundFiles[i]),
                `streetview-comparison-${i}`
            );
        }
    }
}

// Canvas モジュールの簡易実装（実際にはnpm install canvasが必要）
if (require.main === module) {
    console.log('Note: This script requires the "canvas" package.');
    console.log('Please run: npm install canvas');
    console.log('');
    console.log('After installing canvas, the comparison will analyze differences between real and virtual images.');
    
    // const comparison = new ImageComparison();
    // comparison.compareAllImages().catch(console.error);
}