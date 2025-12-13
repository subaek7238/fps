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

/* ===============================
   ✅ WASD 이동 (PC)
================================ */
const keys = { w: false, a: false, s: false, d: false };
const moveSpeed = 0.15;

window.addEventListener("keydown", (e) => {
  if (e.key === "w") keys.w = true;
  if (e.key === "a") keys.a = true;
  if (e.key === "s") keys.s = true;
  if (e.key === "d") keys.d = true;
});

window.addEventListener("keyup", (e) => {
  if (e.key === "w") keys.w = false;
  if (e.key === "a") keys.a = false;
  if (e.key === "s") keys.s = false;
  if (e.key === "d") keys.d = false;
});

/* ===============================
   📱 모바일 터치 이동
================================ */
let touchStartX = 0;
let touchStartY = 0;
let moveX = 0;
let moveZ = 0;
const touchSpeed = 0.002;

window.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
});

window.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  moveX = t.clientX - touchStartX;
  moveZ = t.clientY - touchStartY;
});

window.addEventListener("touchend", () => {
  moveX = 0;
  moveZ = 0;
});

/* ===============================
   🔫 클릭 / 탭 = 총 쏘기
================================ */
window.addEventListener("click", (e) => {
  const mouse = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const hits = raycaster.intersectObjects(scene.children);

  if (hits.length > 0) {
    const obj = hits[0].object;
    if (obj === target) {
      scene.remove(target);
      console.log("🎯 HIT");
    }
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

  // PC 이동
  if (keys.w) camera.position.z -= moveSpeed;
  if (keys.s) camera.position.z += moveSpeed;
  if (keys.a) camera.position.x -= moveSpeed;
  if (keys.d) camera.position.x += moveSpeed;

  // 모바일 이동
  camera.position.x += moveX * touchSpeed;
  camera.position.z += moveZ * touchSpeed;

  renderer.render(scene, camera);
}
animate();
