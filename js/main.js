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
   🎯 시점 회전 변수
================================ */
let yaw = 0;
let pitch = 0;

const mouseSensitivity = 0.002;
const touchSensitivity = 0.005;

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
   🖱️ PC 마우스 시점 회전
================================ */
renderer.domElement.addEventListener("click", () => {
  renderer.domElement.requestPointerLock();
});

document.addEventListener("mousemove", (e) => {
  if (document.pointerLockElement !== renderer.domElement) return;

  yaw -= e.movementX * mouseSensitivity;
  pitch -= e.movementY * mouseSensitivity;

  pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
});

/* ===============================
   📱 모바일 시점 회전 (두 손가락)
================================ */
let lookTouchX = 0;
let lookTouchY = 0;

window.addEventListener("touchstart", (e) => {
  if (e.touches.length === 2) {
    lookTouchX = e.touches[1].clientX;
    lookTouchY = e.touches[1].clientY;
  }
});

window.addEventListener("touchmove", (e) => {
  if (e.touches.length === 2) {
    const t = e.touches[1];
    const dx = t.clientX - lookTouchX;
    const dy = t.clientY - lookTouchY;

    yaw -= dx * touchSensitivity;
    pitch -= dy * touchSensitivity;

    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

    lookTouchX = t.clientX;
    lookTouchY = t.clientY;
  }
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

  // 이동 (PC)
  if (keys.w) camera.position.z -= moveSpeed;
  if (keys.s) camera.position.z += moveSpeed;
  if (keys.a) camera.position.x -= moveSpeed;
  if (keys.d) camera.position.x += moveSpeed;

  // 이동 (모바일)
  camera.position.x += moveX * touchSpeed;
  camera.position.z += moveZ * touchSpeed;

  // 시점 회전 적용
  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  renderer.render(scene, camera);
}
animate();
