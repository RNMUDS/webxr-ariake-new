// Simplified Transportation Animation Components for WebXR Ariake
// シンプルで確実に動作するモノレールと車両のアニメーション

// ゆりかもめ線モノレールコンポーネント（シンプル版）
AFRAME.registerComponent('yurikamome-simple', {
  schema: {
    speed: {type: 'number', default: 30},
    direction: {type: 'number', default: 1} // 1: 時計回り, -1: 反時計回り
  },

  init: function() {
    this.createMonorailCar();
    this.setupRoute();
    this.startMovement();
  },

  createMonorailCar: function() {
    // シンプルなモノレール車両
    const car = document.createElement('a-entity');
    
    // 車体（青いボックス）
    const body = document.createElement('a-box');
    body.setAttribute('width', '12');
    body.setAttribute('height', '3');
    body.setAttribute('depth', '3');
    body.setAttribute('color', '#0066CC');
    body.setAttribute('position', '0 1.5 0');
    car.appendChild(body);

    // 前照灯
    const light1 = document.createElement('a-sphere');
    light1.setAttribute('radius', '0.3');
    light1.setAttribute('color', '#FFFFFF');
    light1.setAttribute('position', '6 1.5 1');
    car.appendChild(light1);

    const light2 = document.createElement('a-sphere');
    light2.setAttribute('radius', '0.3');
    light2.setAttribute('color', '#FFFFFF');
    light2.setAttribute('position', '6 1.5 -1');
    car.appendChild(light2);

    // 初期位置（有明テニスの森駅付近）
    car.setAttribute('position', '180 18 -15');
    
    this.car = car;
    this.el.appendChild(car);
  },

  setupRoute: function() {
    // シンプルな楕円形ルート
    this.radius = 150;
    this.centerX = 50;
    this.centerZ = 0;
    this.angle = 0;
    this.height = 18;
  },

  startMovement: function() {
    this.moveMonorail();
  },

  moveMonorail: function() {
    // 楕円形の軌道を描く
    const x = this.centerX + this.radius * Math.cos(this.angle);
    const z = this.centerZ + (this.radius * 0.6) * Math.sin(this.angle);
    
    // 車両の向きを進行方向に設定
    const rotationY = (this.angle * 180 / Math.PI) + 90;
    
    this.car.setAttribute('position', `${x} ${this.height} ${z}`);
    this.car.setAttribute('rotation', `0 ${rotationY} 0`);
    
    // 角度を更新
    this.angle += (this.data.speed * this.data.direction) * 0.0003;
    if (this.angle > Math.PI * 2) this.angle -= Math.PI * 2;
    if (this.angle < 0) this.angle += Math.PI * 2;
    
    // 次のフレームで再実行
    requestAnimationFrame(() => this.moveMonorail());
  }
});

// シンプルな車両交通システム
AFRAME.registerComponent('simple-traffic', {
  schema: {
    carCount: {type: 'number', default: 8}
  },

  init: function() {
    this.cars = [];
    this.createCars();
    this.animateCars();
  },

  createCars: function() {
    for (let i = 0; i < this.data.carCount; i++) {
      this.createCar(i);
    }
  },

  createCar: function(index) {
    const car = document.createElement('a-entity');
    
    // 車体
    const body = document.createElement('a-box');
    body.setAttribute('width', '4');
    body.setAttribute('height', '1.5');
    body.setAttribute('depth', '2');
    body.setAttribute('color', this.getRandomCarColor());
    body.setAttribute('position', '0 0.75 0');
    car.appendChild(body);

    // ヘッドライト
    const light = document.createElement('a-light');
    light.setAttribute('type', 'point');
    light.setAttribute('intensity', '0.5');
    light.setAttribute('distance', '10');
    light.setAttribute('position', '2 0.5 0');
    car.appendChild(light);

    // 初期位置（道路上に配置）
    const lanes = [
      {x: -200, z: -62, dir: 1},  // 東行き
      {x: 200, z: -67, dir: -1},  // 西行き
      {x: -22, z: -150, dir: 1},  // 北行き
      {x: -18, z: 150, dir: -1}   // 南行き
    ];
    
    const lane = lanes[index % lanes.length];
    car.setAttribute('position', `${lane.x + (index * 30)} 1 ${lane.z}`);
    car.setAttribute('rotation', `0 ${lane.dir === 1 ? 0 : 180} 0`);
    
    car.userData = {
      lane: lane,
      speed: 20 + Math.random() * 20,
      direction: lane.dir
    };

    this.cars.push(car);
    this.el.appendChild(car);
  },

  animateCars: function() {
    this.cars.forEach(car => {
      const pos = car.getAttribute('position');
      const userData = car.userData;
      
      // X方向の移動（東西道路）
      if (Math.abs(userData.lane.z + 62) < 10 || Math.abs(userData.lane.z + 67) < 10) {
        pos.x += userData.speed * userData.direction * 0.1;
        
        // 道路の端に達したら反対側から再出現
        if (pos.x > 250) pos.x = -250;
        if (pos.x < -250) pos.x = 250;
      }
      // Z方向の移動（南北道路）
      else {
        pos.z += userData.speed * userData.direction * 0.1;
        
        // 道路の端に達したら反対側から再出現
        if (pos.z > 200) pos.z = -200;
        if (pos.z < -200) pos.z = 200;
      }
      
      car.setAttribute('position', pos);
    });

    // 次のフレームで再実行
    requestAnimationFrame(() => this.animateCars());
  },

  getRandomCarColor: function() {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF', '#000000'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
});

// モノレール軌道コンポーネント（シンプル版）
AFRAME.registerComponent('monorail-tracks-simple', {
  init: function() {
    this.createTracks();
    this.createStation();
  },

  createTracks: function() {
    // 高架橋の支柱を等間隔で配置
    const pillarCount = 12;
    const radius = 150;
    const centerX = 50;
    const centerZ = 0;

    for (let i = 0; i < pillarCount; i++) {
      const angle = (i / pillarCount) * Math.PI * 2;
      const x = centerX + radius * Math.cos(angle);
      const z = centerZ + (radius * 0.6) * Math.sin(angle);

      // 支柱
      const pillar = document.createElement('a-cylinder');
      pillar.setAttribute('radius', '2');
      pillar.setAttribute('height', '18');
      pillar.setAttribute('color', '#F5F5DC');
      pillar.setAttribute('position', `${x} 9 ${z}`);
      this.el.appendChild(pillar);

      // 基礎
      const base = document.createElement('a-cylinder');
      base.setAttribute('radius', '3');
      base.setAttribute('height', '2');
      base.setAttribute('color', '#D3D3D3');
      base.setAttribute('position', `${x} 1 ${z}`);
      this.el.appendChild(base);
    }

    // 軌道桁（簡易版）
    const trackRadius = radius + 5;
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2;
      const x = centerX + trackRadius * Math.cos(angle);
      const z = centerZ + (trackRadius * 0.6) * Math.sin(angle);

      const trackSegment = document.createElement('a-box');
      trackSegment.setAttribute('width', '3');
      trackSegment.setAttribute('height', '1');
      trackSegment.setAttribute('depth', '8');
      trackSegment.setAttribute('color', '#F5F5DC');
      trackSegment.setAttribute('position', `${x} 18 ${z}`);
      
      // 軌道の向きを調整
      const rotationY = angle * 180 / Math.PI;
      trackSegment.setAttribute('rotation', `0 ${rotationY} 0`);
      
      this.el.appendChild(trackSegment);
    }
  },

  createStation: function() {
    // 有明テニスの森駅（簡易版）
    const platform = document.createElement('a-box');
    platform.setAttribute('width', '25');
    platform.setAttribute('height', '1');
    platform.setAttribute('depth', '8');
    platform.setAttribute('color', '#F0F0F0');
    platform.setAttribute('position', '180 18.5 -15');
    this.el.appendChild(platform);

    // 駅の屋根
    const roof = document.createElement('a-box');
    roof.setAttribute('width', '30');
    roof.setAttribute('height', '0.5');
    roof.setAttribute('depth', '12');
    roof.setAttribute('color', '#4169E1');
    roof.setAttribute('position', '180 22 -15');
    this.el.appendChild(roof);

    // 駅名標
    const sign = document.createElement('a-text');
    sign.setAttribute('value', '有明テニスの森');
    sign.setAttribute('position', '180 20 -10');
    sign.setAttribute('rotation', '0 180 0');
    sign.setAttribute('color', '#000000');
    sign.setAttribute('align', 'center');
    this.el.appendChild(sign);
  }
});

console.log('Simplified transportation components loaded!');