const fs = require('fs');
const path = require('path');

// 簡易的な比較レポート生成
function generateComparisonReport() {
    const capturesDir = path.join(__dirname, '..', 'captures');
    const reportPath = path.join(capturesDir, 'comparisons', 'aframe-comparison-report.json');
    
    const report = {
        timestamp: new Date().toISOString(),
        comparisons: [],
        summary: {
            totalComparisons: 0,
            recommendations: []
        }
    };
    
    // 航空写真の確認
    const aerialPhotos = fs.readdirSync(path.join(capturesDir, 'aerial'))
        .filter(f => f.endsWith('.png'));
    const aframeAerialPhotos = fs.readdirSync(path.join(capturesDir, 'webxr'))
        .filter(f => f.includes('aframe-aerial') && f.endsWith('.png'));
    
    if (aerialPhotos.length > 0 && aframeAerialPhotos.length > 0) {
        report.comparisons.push({
            type: 'aerial',
            realPhoto: aerialPhotos[0],
            virtualPhoto: aframeAerialPhotos[0],
            notes: '航空視点の比較'
        });
    }
    
    // Street Viewの確認
    const streetViewPhotos = fs.readdirSync(path.join(capturesDir, 'streetview'))
        .filter(f => f.endsWith('.png'));
    const aframeGroundPhotos = fs.readdirSync(path.join(capturesDir, 'webxr'))
        .filter(f => f.includes('aframe-ground-level') && f.endsWith('.png'));
    
    streetViewPhotos.forEach((sv, index) => {
        if (index < aframeGroundPhotos.length) {
            report.comparisons.push({
                type: 'street-view',
                realPhoto: sv,
                virtualPhoto: aframeGroundPhotos[index],
                notes: `地上視点の比較 ${index + 1}`
            });
        }
    });
    
    report.summary.totalComparisons = report.comparisons.length;
    
    // 推奨事項
    report.summary.recommendations = [
        "建物の配置を航空写真と照合して微調整",
        "建物の高さと形状を実際の写真に合わせて修正",
        "道路の位置と幅を正確に再現",
        "緑地帯と歩道の配置を追加",
        "建物のテクスチャとマテリアルを実写に近づける",
        "周辺の建物（キャンパス外）も追加検討"
    ];
    
    // レポートを保存
    const comparisonDir = path.join(capturesDir, 'comparisons');
    if (!fs.existsSync(comparisonDir)) {
        fs.mkdirSync(comparisonDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`Comparison report saved: ${reportPath}`);
    
    // レポートの概要を表示
    console.log('\n=== 比較レポート概要 ===');
    console.log(`総比較数: ${report.summary.totalComparisons}`);
    console.log('\n推奨事項:');
    report.summary.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
    });
}

// 実行
generateComparisonReport();