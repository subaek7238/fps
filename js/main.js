import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
console.log("🔥 Three.js 로드 성공");

/* ===============================
   기본 세팅
================================ */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

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
  new THREE.PlaneGeometry(50,50),
  new THREE.MeshStandardMaterial({color:0xffffff})
);
floor.rotation.x=-Math.PI/2;
scene.add(floor);

/* ===============================
   조명
================================ */
const ambientLight = new THREE.AmbientLight(0xffffff,0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff,1);
directionalLight.position.set(5,10,7.5);
scene.add(directionalLight);

/* ===============================
   집 맵 (벽)
================================ */
const wallMaterial = new THREE.MeshStandardMaterial({color:0xffffff});
const wallHeight=5, wallThickness=0.5;

const frontWall = new THREE.Mesh(new THREE.BoxGeometry(20,wallHeight,wallThickness),wallMaterial);
frontWall.position.set(0,wallHeight/2,-10);
scene.add(frontWall);

const backWall = new THREE.Mesh(new THREE.BoxGeometry(20,wallHeight,wallThickness),wallMaterial);
backWall.position.set(0,wallHeight/2,10);
scene.add(backWall);

const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness,wallHeight,20),wallMaterial);
leftWall.position.set(-10,wallHeight/2,0);
scene.add(leftWall);

const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness,wallHeight,20),wallMaterial);
rightWall.position.set(10,wallHeight/2,0);
scene.add(rightWall);

/* ===============================
   빨간 박스 3개
================================ */
const boxMaterial=new THREE.MeshStandardMaterial({color:0xff0000});
const boxes=[];

const boxPositions=[
  new THREE.Vector3(-5,0.5,0),
  new THREE.Vector3(0,0.5,0),
  new THREE.Vector3(5,0.5,0)
];

boxPositions.forEach(pos=>{
  const box=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),boxMaterial);
  box.position.copy(pos);
  scene.add(box);
  boxes.push(box);
});

/* ===============================
   카메라 위치
================================ */
camera.position.set(0,1.6,5);

/* ===============================
   시점 회전 변수
================================ */
let yaw=0, pitch=0;
const mouseSensitivity=0.002, touchSensitivity=0.005;

/* ===============================
   이동 변수
================================ */
const keys={w:false,a:false,s:false,d:false};
const moveSpeed=0.15;
const forward=new THREE.Vector3();
const right=new THREE.Vector3();

/* ===============================
   WASD
================================ */
window.addEventListener("keydown",e=>{if(keys[e.key]!==undefined) keys[e.key]=true;});
window.addEventListener("keyup",e=>{if(keys[e.key]!==undefined) keys[e.key]=false;});

/* ===============================
   💻 PC 시점 회전 (우클릭)
================================ */
let rightMouseDown=false;
window.addEventListener("mousedown",e=>{
  if(e.button===2){rightMouseDown=true; renderer.domElement.requestPointerLock();}
  if(e.button===0) shoot();
});
window.addEventListener("mouseup",e=>{if(e.button===2){rightMouseDown=false; document.exitPointerLock();}});
document.addEventListener("mousemove",e=>{
  if(!rightMouseDown) return;
  yaw-=e.movementX*mouseSensitivity;
  pitch-=e.movementY*mouseSensitivity;
  pitch=Math.max(-Math.PI/2,Math.min(Math.PI/2,pitch));
});
window.addEventListener("contextmenu",e=>e.preventDefault());

/* ===============================
   모바일 조이스틱 이동
================================ */
const joystick=document.getElementById("joystick");
let joyStartX=0,joyStartY=0,joyMoveX=0,joyMoveZ=0,joystickActive=false;

joystick.addEventListener("touchstart",e=>{
  e.preventDefault();
  joystickActive=true;
  const t=e.touches[0];
  joyStartX=t.clientX;
  joyStartY=t.clientY;
});
joystick.addEventListener("touchmove",e=>{
  if(!joystickActive) return;
  const t=e.touches[0];
  joyMoveX=(t.clientX-joyStartX)*0.01;
  joyMoveZ=(t.clientY-joyStartY)*0.01;
});
joystick.addEventListener("touchend",()=>{
  joystickActive=false;
  joyMoveX=0; joyMoveZ=0;
});

/* ===============================
   모바일 화면 우측 터치로 시점
================================ */
let lookX=0, lookY=0, looking=false;
window.addEventListener("touchstart",e=>{
  const t=e.touches[0];
  if(t.clientX>window.innerWidth/2){
    looking=true; lookX=t.clientX; lookY=t.clientY;
  }
});
window.addEventListener("touchmove",e=>{
  if(!looking) return;
  const t=e.touches[0];
  if(t.clientX>window.innerWidth/2){
    yaw-=(t.clientX-lookX)*touchSensitivity;
    pitch-=(t.clientY-lookY)*touchSensitivity;
    pitch=Math.max(-Math.PI/2,Math.min(Math.PI/2,pitch));
    lookX=t.clientX; lookY=t.clientY;
  }
});
window.addEventListener("touchend",()=>{looking=false;});

/* ===============================
   🔫 발사 로직
================================ */
function shoot(){
  const raycaster=new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(0,0),camera);
  const hits=raycaster.intersectObjects(boxes);
  if(hits.length>0){
    const hitBox=hits[0].object;
    scene.remove(hitBox);
    boxes.splice(boxes.indexOf(hitBox),1);
    const newBox=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),boxMaterial);
    const x=(Math.random()-0.5)*18;
    const z=(Math.random()-0.5)*18;
    newBox.position.set(x,0.5,z);
    scene.add(newBox);
    boxes.push(newBox);
    console.log("🎯 HIT BOX");
  }
}

/* ===============================
   모바일 총 버튼
================================ */
const shootBtn=document.getElementById("shootBtn");
if(shootBtn){
  shootBtn.addEventListener("touchstart",e=>{e.preventDefault(); shoot();});
}

/* ===============================
   리사이즈
================================ */
window.addEventListener("resize",()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});

/* ===============================
   벽 충돌
================================ */
const mapLimit={minX:-9.5,maxX:9.5,minZ:-9.5,maxZ:9.5};
function checkCollision(pos){
  if(pos.x<mapLimit.minX) pos.x=mapLimit.minX;
  if(pos.x>mapLimit.maxX) pos.x=mapLimit.maxX;
  if(pos.z<mapLimit.minZ) pos.z=mapLimit.minZ;
  if(pos.z>mapLimit.maxZ) pos.z=mapLimit.maxZ;
}

/* ===============================
   렌더 루프
================================ */
function animate(){
  requestAnimationFrame(animate);
  camera.rotation.order="YXZ";
  camera.rotation.y=yaw;
  camera.rotation.x=pitch;

  camera.getWorldDirection(forward);
  forward.y=0;
  forward.normalize();
  right.crossVectors(forward,camera.up).normalize();

  // PC 이동
  if(keys.w) camera.position.addScaledVector(forward,moveSpeed);
  if(keys.s) camera.position.addScaledVector(forward,-moveSpeed);
  if(keys.a) camera.position.addScaledVector(right,-moveSpeed);
  if(keys.d) camera.position.addScaledVector(right,moveSpeed);

  // 모바일 조이스틱 이동 (Z 반전 적용)
  camera.position.addScaledVector(right,joyMoveX);
  camera.position.addScaledVector(forward,-joyMoveZ);

  // 벽 충돌
  checkCollision(camera.position);

  renderer.render(scene,camera);
}
animate();
