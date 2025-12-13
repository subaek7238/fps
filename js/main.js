import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

console.log("🔥 Three.js 로드 성공");

/* ===============================
   기본 세팅
================================ */
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

/* ===============================
   바닥
================================ */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshBasicMaterial({ color: 0x333333 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

/* ===============================
   타겟 큐브
================================ */
const target = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
target.position.set(0, 1, -5);
scene.add(target);

/* ===============================
   카메라 위치
================================ */
camera.position.set(0, 1.6, 5);

/* ===============================
   시점 회전 변수
================================ */
let yaw = 0;
let pitch = 0;

const mouseSensitivity = 0.002;
const touchSensitivity = 0.005;

/* ===============================
   이동 변수
================================ */
const keys = { w: false, a: false, s: false, d: false };
const moveSpeed = 0.15;

const forward = new THREE.Vector3();
const right = new THREE.Vector3();

/* ===============================
   WASD
================================ */
window.addEventListener("keydown", (e) => {
  if (keys[e.key] !== undefined) keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
  if (keys[e.key] !== undefined) keys[e.key] = false;
});

/* ===============================
   💻 PC 시점 회전 (우클릭)
================================ */
let rightMouseDown = false;

window.addEventListener("mousedown", (e) => {
  if (e.button === 2) {
    rightMouseDown = true;
    renderer.domElement.requestPointerLock();
  }
  if (e.button === 0) shoot(); // 좌클릭 발사
});

window.addEventListener("mouseup", (e) => {
  if (e.button === 2) {
    rightMouseDown = false;
    document.exitPointerLock();
  }
});

document.addEventListener("mousemove", (e) => {
  if (!rightMouseDown) return;

  yaw -= e.movementX * mouseSensitivity;
  pitch -= e.movementY * mouseSensitivity;
  pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
});

window.addEventListener("contextmenu", (e) => e.preventDefault());

/* ===============================
   📱 모바일 입력
   왼쪽: 이동 / 오른쪽: 시점
================================ */
let touchMoveX = 0;
let touchMoveZ = 0;

let lookX = 0;
let lookY = 0;
let looking = false;

window.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  if (t.clientX < window.innerWidth / 2) {
    touchMoveX = 0;
    touchMoveZ = 0;
  } else {
    looking = true;
    lookX = t.clientX;
    lookY = t.clientY;
  }
});

window.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  if (t.clientX < window.innerWidth / 2) {
    touchMoveX = (t.clientX - window.innerWidth / 4) * 0.002;
    touchMoveZ = (t.clientY - window.innerHeight / 2) * 0.002;
  } else if (looking) {
    yaw -= (t.clientX - lookX) * touchSensitivity;
    pitch -= (t.clientY - lookY) * touchSensitivity;
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
    lookX = t.clientX;
    lookY = t.clientY;
  }
});

window.addEventListener("touchend", () => {
  touchMoveX = 0;
  touchMoveZ = 0;
  looking = false;
});

/* ===============================
   🔫 발사 로직 (공통)
================================ */
function shoot() {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

  const hits = raycaster.intersectObjects(scene.children);
  if (hits.length && hits[0].object === target) {
    scene.remove(target);
    console.log("🎯 HIT");
  }
}

/* ===============================
   📱 모바일 발사 버튼
================================ */
const shootBtn = document.getElementById("shootBtn");
if (shootBtn) {
  shootBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    shoot();
  });
}

/* ===============================
   리사이즈
================================ */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ===============================
   렌더 루프
================================ */
function animate() {
  requestAnimationFrame(animate);

  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();
  right.crossVectors(forward, camera.up).normalize();

  if (keys.w) camera.position.addScaledVector(forward, moveSpeed);
  if (keys.s) camera.position.addScaledVector(forward, -moveSpeed);
  if (keys.a) camera.position.addScaledVector(right, -moveSpeed);
  if (keys.d) camera.position.addScaledVector(right, moveSpeed);

  camera.position.addScaledVector(right, touchMoveX);
  camera.position.addScaledVector(forward, touchMoveZ);

  renderer.render(scene, camera);
}
animate();

