// Transportation Animation Components for WebXR Ariake
// モノレール、車両、その他の交通手段のアニメーション

// ゆりかもめ線モノレールコンポーネント
AFRAME.registerComponent('yurikamome-monorail', {
  schema: {
    speed: {type: 'number', default: 20}, // 時速20km程度
    route: {type: 'string', default: 'main'}, // ルート種別
    direction: {type: 'string', default: 'clockwise'} // 時計回り/反時計回り
  },

  init: function() {
    this.setupMonorailRoute();
    this.createMonorailCar();
    this.startAnimation();
  },

  setupMonorailRoute: function() {
    // ゆりかもめ線の実際のルート（有明キャンパス周辺を正確に再現）
    this.waypoints = [
      {x: -200, y: 18, z: 0},   // 新橋方面から（高度18m）
      {x: -150, y: 18, z: 15},  // 汐留エリア
      {x: -100, y: 18, z: 30},  // 竹芝・日の出方面
      {x: -50, y: 18, z: 45},   // 芝浦ふ頭エリア
      {x: 0, y: 18, z: 60},     // お台場海浜公園方面
      {x: 50, y: 18, z: 45},    // 台場・フジテレビ方面（曲線）
      {x: 100, y: 18, z: 30},   // 船の科学館・テレコムセンター方面
      {x: 150, y: 18, z: 15},   // 青海・国際展示場正門方面
      {x: 180, y: 18, z: -15},  // 有明テニスの森駅（キャンパス最寄り）
      {x: 200, y: 18, z: -45},  // 有明駅方面
      {x: 170, y: 18, z: -80},  // 有明国際展示場方面（Uターン開始）
      {x: 120, y: 18, z: -95},  // 東雲方面
      {x: 70, y: 18, z: -80},   // 豊洲方面への接続
    ];

    if (this.data.direction === 'counterclockwise') {
      this.waypoints.reverse();
    }

    this.currentWaypoint = 0;
    this.totalWaypoints = this.waypoints.length;
  },

  createMonorailCar: function() {
    // モノレール車両の作成
    const car = document.createElement('a-entity');
    car.setAttribute('id', 'yurikamome-car');
    
    // 車体
    const body = document.createElement('a-box');
    body.setAttribute('width', '15');
    body.setAttribute('height', '3');
    body.setAttribute('depth', '3');
    body.setAttribute('color', '#0066cc'); // ゆりかもめブルー
    body.setAttribute('metalness', '0.8');
    body.setAttribute('roughness', '0.2');
    car.appendChild(body);

    // 窓
    for (let i = 0; i < 6; i++) {
      const window = document.createElement('a-plane');
      window.setAttribute('width', '2');
      window.setAttribute('height', '1.5');
      window.setAttribute('color', '#87ceeb');
      window.setAttribute('transparent', 'true');
      window.setAttribute('opacity', '0.7');
      window.setAttribute('position', `${-6 + i * 2.5} 0.5 1.55`);
      car.appendChild(window);
    }

    // ライト
    const frontLight = document.createElement('a-sphere');
    frontLight.setAttribute('radius', '0.3');
    frontLight.setAttribute('color', '#ffffff');
    frontLight.setAttribute('position', '7.5 0 1.2');
    frontLight.setAttribute('light', 'type: point; intensity: 0.8; distance: 20');
    car.appendChild(frontLight);

    this.car = car;
    this.el.appendChild(car);

    // 初期位置設定
    const startPos = this.waypoints[0];
    car.setAttribute('position', `${startPos.x} ${startPos.y} ${startPos.z}`);
  },

  startAnimation: function() {
    this.animateToNextWaypoint();
  },

  animateToNextWaypoint: function() {
    const currentPos = this.waypoints[this.currentWaypoint];
    const nextIndex = (this.currentWaypoint + 1) % this.totalWaypoints;
    const nextPos = this.waypoints[nextIndex];

    // 距離計算
    const dx = nextPos.x - currentPos.x;
    const dy = nextPos.y - currentPos.y;
    const dz = nextPos.z - currentPos.z;
    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

    // 所要時間計算（km/h → m/s変換）
    const speedMs = this.data.speed * 1000 / 3600;
    const duration = (distance / speedMs) * 1000; // ミリ秒

    // 車両の向き計算
    const angle = Math.atan2(dx, dz) * 180 / Math.PI;

    // アニメーション実行
    this.car.setAttribute('animation__position', {
      property: 'position',
      to: `${nextPos.x} ${nextPos.y} ${nextPos.z}`,
      dur: duration,
      easing: 'linear'
    });

    this.car.setAttribute('animation__rotation', {
      property: 'rotation',
      to: `0 ${angle} 0`,
      dur: 1000,
      easing: 'easeInOutQuad'
    });

    // 次のウェイポイントへ
    setTimeout(() => {
      this.currentWaypoint = nextIndex;
      this.animateToNextWaypoint();
    }, duration);
  }
});

// 車両交通コンポーネント
AFRAME.registerComponent('traffic-system', {
  schema: {
    density: {type: 'number', default: 0.3}, // 交通密度
    speed: {type: 'number', default: 40}, // 平均速度
    types: {type: 'array', default: ['car', 'truck', 'bus']} // 車両タイプ
  },

  init: function() {
    this.vehicles = [];
    this.setupRoads();
    this.spawnVehicles();
  },

  setupRoads: function() {
    // 有明キャンパス周辺の主要道路
    this.roads = {
      // 国道357号（湾岸道路）- 東西方向
      route357: {
        lanes: [
          // 東行き車線
          {
            start: {x: -200, y: 0.5, z: -60},
            end: {x: 200, y: 0.5, z: -60},
            direction: 'east'
          },
          // 西行き車線  
          {
            start: {x: 200, y: 0.5, z: -65},
            end: {x: -200, y: 0.5, z: -65},
            direction: 'west'
          }
        ]
      },
      // 首都高速湾岸線 - 南北方向
      shutoko: {
        lanes: [
          // 北行き車線
          {
            start: {x: 80, y: 12, z: 200},
            end: {x: 80, y: 12, z: -200},
            direction: 'north'
          },
          // 南行き車線
          {
            start: {x: 85, y: 12, z: -200},
            end: {x: 85, y: 12, z: 200},
            direction: 'south'
          }
        ]
      },
      // 有明通り - キャンパス前のメイン道路
      ariake_street: {
        lanes: [
          // 北行き車線
          {
            start: {x: -20, y: 0.5, z: 150},
            end: {x: -20, y: 0.5, z: -150},
            direction: 'north'
          },
          // 南行き車線
          {
            start: {x: -25, y: 0.5, z: -150},
            end: {x: -25, y: 0.5, z: 150},
            direction: 'south'
          }
        ]
      }
    };
  },

  spawnVehicles: function() {
    Object.keys(this.roads).forEach(roadKey => {
      const road = this.roads[roadKey];
      road.lanes.forEach((lane, laneIndex) => {
        this.spawnVehicleOnLane(roadKey, laneIndex, lane);
      });
    });
  },

  spawnVehicleOnLane: function(roadKey, laneIndex, lane) {
    const vehicleCount = Math.floor(Math.random() * 5) + 2; // 2-6台
    
    for (let i = 0; i < vehicleCount; i++) {
      setTimeout(() => {
        this.createVehicle(roadKey, laneIndex, lane);
      }, i * (Math.random() * 10000 + 5000)); // 5-15秒間隔
    }
  },

  createVehicle: function(roadKey, laneIndex, lane) {
    const vehicleTypes = this.data.types;
    const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
    
    const vehicle = document.createElement('a-entity');
    vehicle.setAttribute('id', `vehicle-${roadKey}-${laneIndex}-${Date.now()}`);

    let geometry, color, scale;
    switch(vehicleType) {
      case 'bus':
        geometry = 'primitive: box; width: 8; height: 3; depth: 2.5';
        color = '#228B22'; // 都バスグリーン
        scale = '1 1 1';
        break;
      case 'truck':
        geometry = 'primitive: box; width: 6; height: 3.5; depth: 2.2';
        color = '#696969';
        scale = '1 1 1';
        break;
      default: // car
        geometry = 'primitive: box; width: 4; height: 1.5; depth: 2';
        color = this.getRandomCarColor();
        scale = '1 1 1';
    }

    vehicle.setAttribute('geometry', geometry);
    vehicle.setAttribute('material', `color: ${color}; metalness: 0.6; roughness: 0.4`);
    vehicle.setAttribute('scale', scale);

    // ライト追加
    if (Math.random() < 0.8) { // 80%の確率でライト点灯
      const light = document.createElement('a-light');
      light.setAttribute('type', 'point');
      light.setAttribute('intensity', '0.3');
      light.setAttribute('distance', '15');
      light.setAttribute('color', '#fff8dc');
      light.setAttribute('position', '0 0 1.5');
      vehicle.appendChild(light);
    }

    // 初期位置
    vehicle.setAttribute('position', `${lane.start.x} ${lane.start.y} ${lane.start.z}`);
    
    // 向きの計算
    const dx = lane.end.x - lane.start.x;
    const dz = lane.end.z - lane.start.z;
    const angle = Math.atan2(dx, dz) * 180 / Math.PI;
    vehicle.setAttribute('rotation', `0 ${angle} 0`);

    this.el.appendChild(vehicle);
    this.vehicles.push(vehicle);

    // アニメーション開始
    this.animateVehicle(vehicle, lane);
  },

  animateVehicle: function(vehicle, lane) {
    const dx = lane.end.x - lane.start.x;
    const dy = lane.end.y - lane.start.y;
    const dz = lane.end.z - lane.start.z;
    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

    // 速度にランダム性を追加（±20%）
    const randomSpeed = this.data.speed * (0.8 + Math.random() * 0.4);
    const speedMs = randomSpeed * 1000 / 3600;
    const duration = (distance / speedMs) * 1000;

    vehicle.setAttribute('animation', {
      property: 'position',
      to: `${lane.end.x} ${lane.end.y} ${lane.end.z}`,
      dur: duration,
      easing: 'linear'
    });

    // アニメーション完了後に車両を削除し、新しい車両をスポーン
    setTimeout(() => {
      if (vehicle.parentNode) {
        vehicle.parentNode.removeChild(vehicle);
      }
      const index = this.vehicles.indexOf(vehicle);
      if (index > -1) {
        this.vehicles.splice(index, 1);
      }
      
      // 新しい車両をスポーン（確率的）
      if (Math.random() < this.data.density) {
        setTimeout(() => {
          const roadKey = vehicle.id.split('-')[1];
          const laneIndex = parseInt(vehicle.id.split('-')[2]);
          this.createVehicle(roadKey, laneIndex, lane);
        }, Math.random() * 15000 + 5000); // 5-20秒後
      }
    }, duration);
  },

  getRandomCarColor: function() {
    const colors = [
      '#000000', '#FFFFFF', '#C0C0C0', '#808080', // モノトーン系
      '#FF0000', '#0000FF', '#008000', '#800080', // 基本色
      '#FFA500', '#FFFF00', '#00FFFF', '#FF69B4', // 明るい色
      '#8B4513', '#006400', '#8B0000', '#000080'  // 深い色
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
});

// 歩行者システムコンポーネント
AFRAME.registerComponent('pedestrian-system', {
  schema: {
    count: {type: 'number', default: 20},
    speed: {type: 'number', default: 5} // km/h
  },

  init: function() {
    this.pedestrians = [];
    this.setupWalkways();
    this.spawnPedestrians();
  },

  setupWalkways: function() {
    // 歩道と横断歩道の設定
    this.walkways = [
      // キャンパス周辺の歩道
      {
        start: {x: -30, y: 0.1, z: -100},
        end: {x: -30, y: 0.1, z: 100},
        type: 'sidewalk'
      },
      {
        start: {x: -15, y: 0.1, z: -100},
        end: {x: -15, y: 0.1, z: 100},
        type: 'sidewalk'
      },
      // 横断歩道
      {
        start: {x: -50, y: 0.1, z: -62},
        end: {x: 10, y: 0.1, z: -62},
        type: 'crosswalk'
      }
    ];
  },

  spawnPedestrians: function() {
    for (let i = 0; i < this.data.count; i++) {
      setTimeout(() => {
        this.createPedestrian();
      }, i * 2000 + Math.random() * 5000);
    }
  },

  createPedestrian: function() {
    const pedestrian = document.createElement('a-entity');
    pedestrian.setAttribute('id', `pedestrian-${Date.now()}`);

    // シンプルな人型
    const body = document.createElement('a-cylinder');
    body.setAttribute('radius', '0.3');
    body.setAttribute('height', '1.7');
    body.setAttribute('color', this.getRandomClothingColor());
    pedestrian.appendChild(body);

    // 頭
    const head = document.createElement('a-sphere');
    head.setAttribute('radius', '0.15');
    head.setAttribute('color', '#FFDBAC');
    head.setAttribute('position', '0 1 0');
    pedestrian.appendChild(head);

    const walkway = this.walkways[Math.floor(Math.random() * this.walkways.length)];
    pedestrian.setAttribute('position', `${walkway.start.x} ${walkway.start.y} ${walkway.start.z}`);

    this.el.appendChild(pedestrian);
    this.pedestrians.push(pedestrian);

    this.animatePedestrian(pedestrian, walkway);
  },

  animatePedestrian: function(pedestrian, walkway) {
    const dx = walkway.end.x - walkway.start.x;
    const dz = walkway.end.z - walkway.start.z;
    const distance = Math.sqrt(dx*dx + dz*dz);

    const speedMs = this.data.speed * 1000 / 3600;
    const duration = (distance / speedMs) * 1000;

    // 向きの設定
    const angle = Math.atan2(dx, dz) * 180 / Math.PI;
    pedestrian.setAttribute('rotation', `0 ${angle} 0`);

    // 歩行アニメーション
    pedestrian.setAttribute('animation__walk', {
      property: 'position',
      to: `${walkway.end.x} ${walkway.end.y} ${walkway.end.z}`,
      dur: duration,
      easing: 'linear'
    });

    // ボディの上下運動（歩行感）
    pedestrian.setAttribute('animation__bob', {
      property: 'position.y',
      to: walkway.start.y + 0.1,
      dur: 500,
      direction: 'alternate',
      loop: Math.floor(duration / 500),
      easing: 'easeInOutSine'
    });

    setTimeout(() => {
      if (pedestrian.parentNode) {
        pedestrian.parentNode.removeChild(pedestrian);
      }
      const index = this.pedestrians.indexOf(pedestrian);
      if (index > -1) {
        this.pedestrians.splice(index, 1);
      }

      // 新しい歩行者をスポーン
      if (Math.random() < 0.7) {
        setTimeout(() => {
          this.createPedestrian();
        }, Math.random() * 10000 + 3000);
      }
    }, duration);
  },

  getRandomClothingColor: function() {
    const colors = [
      '#000080', '#008000', '#800000', '#008080',
      '#000000', '#FFFFFF', '#808080', '#C0C0C0',
      '#FF0000', '#0000FF', '#FFFF00', '#FF69B4'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
});

// モノレール高架橋コンポーネント
AFRAME.registerComponent('monorail-tracks', {
  init: function() {
    this.createTracks();
    this.createStations();
  },

  createTracks: function() {
    // 実際の写真に基づいた高架橋の柱（太くて頑丈な構造）
    const pillarPositions = [
      {x: -200, z: 0}, {x: -160, z: 12}, {x: -120, z: 24}, {x: -80, z: 36},
      {x: -40, z: 48}, {x: 0, z: 60}, {x: 40, z: 48}, {x: 80, z: 36},
      {x: 120, z: 24}, {x: 160, z: 12}, {x: 180, z: -15}, {x: 200, z: -45},
      {x: 170, z: -80}, {x: 120, z: -95}, {x: 70, z: -80}
    ];

    pillarPositions.forEach(pos => {
      // 支柱（太くて頑丈）
      const pillar = document.createElement('a-cylinder');
      pillar.setAttribute('radius', '2.5');  // より太く
      pillar.setAttribute('height', '18');   // より高く
      pillar.setAttribute('color', '#F5F5DC'); // ベージュ/クリーム色
      pillar.setAttribute('material', 'roughness: 0.7; metalness: 0.1');
      pillar.setAttribute('position', `${pos.x} 9 ${pos.z}`);
      pillar.setAttribute('shadow', 'cast: true; receive: true');
      this.el.appendChild(pillar);

      // 支柱の基礎部分
      const base = document.createElement('a-cylinder');
      base.setAttribute('radius', '3.5');
      base.setAttribute('height', '2');
      base.setAttribute('color', '#D3D3D3');
      base.setAttribute('position', `${pos.x} 0 ${pos.z}`);
      base.setAttribute('shadow', 'receive: true');
      this.el.appendChild(base);
    });

    // 高架橋の軌道桁（中央1本のガイドウェイ）
    for (let i = 0; i < pillarPositions.length - 1; i++) {
      const start = pillarPositions[i];
      const end = pillarPositions[i + 1];
      
      const dx = end.x - start.x;
      const dz = end.z - start.z;
      const distance = Math.sqrt(dx*dx + dz*dz);
      const angle = Math.atan2(dx, dz) * 180 / Math.PI;

      // 軌道桁（ガイドウェイ）
      const guideway = document.createElement('a-box');
      guideway.setAttribute('width', '2.5');
      guideway.setAttribute('height', '1.2');
      guideway.setAttribute('depth', distance);
      guideway.setAttribute('color', '#F5F5DC');
      guideway.setAttribute('material', 'roughness: 0.6; metalness: 0.2');
      guideway.setAttribute('position', `${(start.x + end.x) / 2} 18 ${(start.z + end.z) / 2}`);
      guideway.setAttribute('rotation', `0 ${angle} 0`);
      guideway.setAttribute('shadow', 'cast: true; receive: true');
      this.el.appendChild(guideway);

      // 側面の手すり
      const railing1 = document.createElement('a-box');
      railing1.setAttribute('width', '0.2');
      railing1.setAttribute('height', '1.5');
      railing1.setAttribute('depth', distance);
      railing1.setAttribute('color', '#E0E0E0');
      railing1.setAttribute('position', `${(start.x + end.x) / 2 + 1.5} 19 ${(start.z + end.z) / 2}`);
      railing1.setAttribute('rotation', `0 ${angle} 0`);
      this.el.appendChild(railing1);

      const railing2 = document.createElement('a-box');
      railing2.setAttribute('width', '0.2');
      railing2.setAttribute('height', '1.5');
      railing2.setAttribute('depth', distance);
      railing2.setAttribute('color', '#E0E0E0');
      railing2.setAttribute('position', `${(start.x + end.x) / 2 - 1.5} 19 ${(start.z + end.z) / 2}`);
      railing2.setAttribute('rotation', `0 ${angle} 0`);
      this.el.appendChild(railing2);
    }
  },

  createStations: function() {
    // 有明テニスの森駅（想定位置）
    const station = document.createElement('a-entity');
    
    const platform = document.createElement('a-box');
    platform.setAttribute('width', '30');
    platform.setAttribute('height', '1');
    platform.setAttribute('depth', '8');
    platform.setAttribute('color', '#F5F5DC');
    platform.setAttribute('position', '150 15.5 60');
    station.appendChild(platform);

    const roof = document.createElement('a-box');
    roof.setAttribute('width', '35');
    roof.setAttribute('height', '0.5');
    roof.setAttribute('depth', '12');
    roof.setAttribute('color', '#4169E1');
    roof.setAttribute('position', '150 19 60');
    station.appendChild(roof);

    this.el.appendChild(station);
  }
});

console.log('Transportation components loaded successfully!');