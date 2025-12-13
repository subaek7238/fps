import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

console.log("🔥 Three.js 로드 성공");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 바닥
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshBasicMaterial({ color: 0x333333 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// 타겟 큐브
const target = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
target.position.set(0, 1, -5);
scene.add(target);

// 카메라 위치
camera.position.set(0, 1.6, 5);

// 클릭 = 총 쏘기
window.addEventListener("click", () => {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera({ x: 0, y: 0 }, camera);
  const hits = raycaster.intersectObjects([target]);

  if (hits.length > 0) {
    scene.remove(target);
    console.log("🎯 HIT");
  }
});

// 리사이즈 대응
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 렌더 루프
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
