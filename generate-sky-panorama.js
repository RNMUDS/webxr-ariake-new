const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// 360度パノラマ画像を生成
function generateSkyPanorama() {
    // エクイレクタングラー投影用のキャンバス (2:1の比率)
    const width = 4096;
    const height = 2048;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // グラデーション背景（空）
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    
    // 天頂から地平線へのグラデーション
    gradient.addColorStop(0, '#4A90E2');      // 濃い青（天頂）
    gradient.addColorStop(0.3, '#87CEEB');    // スカイブルー
    gradient.addColorStop(0.5, '#B0E0E6');    // パウダーブルー
    gradient.addColorStop(0.7, '#E0F6FF');    // 薄い青（地平線近く）
    gradient.addColorStop(0.85, '#FFF0E5');   // 地平線の霞
    gradient.addColorStop(1, '#F0E68C');      // 地面近くの黄味
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // 雲を追加
    addClouds(ctx, width, height);
    
    // 太陽を追加
    addSun(ctx, width, height);
    
    // 画像を保存
    const outputPath = path.join(__dirname, '..', 'public', 'textures', 'sky-panorama.jpg');
    const outputDir = path.dirname(outputPath);
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`Sky panorama generated: ${outputPath}`);
    
    // 別バージョン（夕方）も生成
    generateEveningSky();
}

// 雲を追加する関数
function addClouds(ctx, width, height) {
    ctx.globalAlpha = 0.6;
    
    // 複数の雲を配置
    const clouds = [
        { x: width * 0.2, y: height * 0.3, size: 200 },
        { x: width * 0.5, y: height * 0.25, size: 250 },
        { x: width * 0.8, y: height * 0.35, size: 180 },
        { x: width * 0.1, y: height * 0.4, size: 150 },
        { x: width * 0.6, y: height * 0.45, size: 200 },
        { x: width * 0.9, y: height * 0.3, size: 220 },
        { x: width * 0.3, y: height * 0.5, size: 170 },
        { x: width * 0.7, y: height * 0.55, size: 190 }
    ];
    
    clouds.forEach(cloud => {
        drawCloud(ctx, cloud.x, cloud.y, cloud.size);
    });
    
    ctx.globalAlpha = 1;
}

// 個別の雲を描画
function drawCloud(ctx, x, y, size) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // 複数の円を組み合わせて雲の形を作る
    const circles = [
        { dx: 0, dy: 0, r: size * 0.5 },
        { dx: size * 0.3, dy: -size * 0.1, r: size * 0.4 },
        { dx: -size * 0.3, dy: -size * 0.1, r: size * 0.4 },
        { dx: size * 0.5, dy: size * 0.1, r: size * 0.35 },
        { dx: -size * 0.5, dy: size * 0.1, r: size * 0.35 },
        { dx: 0, dy: size * 0.2, r: size * 0.3 }
    ];
    
    circles.forEach(circle => {
        ctx.beginPath();
        ctx.arc(x + circle.dx, y + circle.dy, circle.r, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 太陽を追加
function addSun(ctx, width, height) {
    const sunX = width * 0.75;
    const sunY = height * 0.4;
    const sunRadius = 60;
    
    // 太陽の光輪
    const glowGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 3);
    glowGradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
    glowGradient.addColorStop(0.3, 'rgba(255, 255, 150, 0.4)');
    glowGradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius * 3, 0, Math.PI * 2);
    ctx.fill();
    
    // 太陽本体
    ctx.fillStyle = '#FFFACD';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
}

// 夕方の空を生成
function generateEveningSky() {
    const width = 4096;
    const height = 2048;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // 夕焼けグラデーション
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1e3c72');      // 濃紺（天頂）
    gradient.addColorStop(0.3, '#2a5298');    // 青紫
    gradient.addColorStop(0.5, '#7e8aa2');    // 薄紫
    gradient.addColorStop(0.7, '#ff9248');    // オレンジ
    gradient.addColorStop(0.85, '#ff6b35');   // 濃いオレンジ
    gradient.addColorStop(1, '#c44569');      // 赤紫
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // 夕方の雲（より暗めの色）
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = 'rgba(100, 50, 80, 0.6)';
    
    const clouds = [
        { x: width * 0.3, y: height * 0.6, size: 250 },
        { x: width * 0.7, y: height * 0.65, size: 200 },
        { x: width * 0.5, y: height * 0.7, size: 180 }
    ];
    
    clouds.forEach(cloud => {
        drawCloud(ctx, cloud.x, cloud.y, cloud.size);
    });
    
    // 夕日
    const sunX = width * 0.5;
    const sunY = height * 0.8;
    const sunRadius = 80;
    
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 保存
    const outputPath = path.join(__dirname, '..', 'public', 'textures', 'sky-evening-panorama.jpg');
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`Evening sky panorama generated: ${outputPath}`);
}

// メイン実行
generateSkyPanorama();