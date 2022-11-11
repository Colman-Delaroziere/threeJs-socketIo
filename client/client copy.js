import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls";
import Stats from "three/addons/libs/stats.module";
import { GUI } from "dat.gui";
import { TWEEN } from "three/addons/libs/tween.module.min";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
});
const myObject3D = new THREE.Object3D();
myObject3D.position.x = Math.random() * 4 - 2;
myObject3D.position.z = Math.random() * 4 - 2;
const gridHelper = new THREE.GridHelper(10, 10);
gridHelper.position.y = -0.5;
scene.add(gridHelper);
camera.position.z = 4;
window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}
let myId = "";
let timestamp = 0;
const clientCubes = {};

const socket = io();

socket.on("connect", function () {
  console.log("connect");
});

socket.on("disconnect", function (message) {
  console.log("disconnect " + message);
});

socket.on("id", (id) => {
  myId = id;
  setInterval(() => {
    socket.emit("update", {
      t: Date.now(),
      p: myObject3D.position,
      r: myObject3D.rotation,
    });
  }, 50);
});

socket.on("clients", (clients) => {
  let pingStatsHtml = "Socket Ping Stats<br/><br/>";
  Object.keys(clients).forEach((p) => {
    timestamp = Date.now();
    pingStatsHtml += p + " " + (timestamp - clients[p].t) + "ms<br/>";
    if (!clientCubes[p]) {
      clientCubes[p] = new THREE.Mesh(geometry, material);
      clientCubes[p].name = p;
      scene.add(clientCubes[p]);
    } else {
      if (clients[p].p) {
        new TWEEN.Tween(clientCubes[p].position)
          .to(
            {
              x: clients[p].p.x,
              y: clients[p].p.y,
              z: clients[p].p.z,
            },
            50
          )
          .start();
      }
      if (clients[p].r) {
        new TWEEN.Tween(clientCubes[p].rotation)
          .to(
            {
              x: clients[p].r._x,
              y: clients[p].r._y,
              z: clients[p].r._z,
            },
            50
          )
          .start();
      }
    }
  });
  document.getElementById("pingStats").innerHTML = pingStatsHtml;
});

socket.on("removeClient", (id) => {
  scene.remove(scene.getObjectByName(id));
});

const stats = Stats();
document.body.appendChild(stats.dom);

const gui = new GUI();

const cubeFolder = gui.addFolder("Cube");
const cubePositionFolder = cubeFolder.addFolder("Position");
cubePositionFolder.add(myObject3D.position, "x", -5, 5);
cubePositionFolder.add(myObject3D.position, "z", -5, 5);
cubePositionFolder.open();

const cubeRotationFolder = cubeFolder.addFolder("Rotation");
cubeRotationFolder.add(myObject3D.rotation, "x", 0, Math.PI * 2, 0.01);
cubeRotationFolder.add(myObject3D.rotation, "y", 0, Math.PI * 2, 0.01);
cubeRotationFolder.add(myObject3D.rotation, "z", 0, Math.PI * 2, 0.01);
cubeRotationFolder.open();
cubeFolder.open();

const animate = function () {
  requestAnimationFrame(animate);
  controls.update();
  TWEEN.update();
  if (clientCubes[myId]) {
    camera.lookAt(clientCubes[myId].position);
  }
  render();
  stats.update();
};

const render = function () {
  renderer.render(scene, camera);
};

animate();

new Client();
