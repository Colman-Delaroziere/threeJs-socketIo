import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TWEEN } from "three/addons/libs/tween.module.min";
import { GUI } from "dat.gui";
import Player from "./Player.js";

const socket = io();

class Client {
  constructor() {
    this.players = {};

    socket.on("connect", () => {
      this.createScene(); // floor and walls
      this.createControls();
      this.createPlayer(); // new Player

      setInterval(() => {
        socket.emit("update", {
          time: Date.now(),
          position: this.player.position,
          rotation: this.player.rotation,
        });
      }, 100);

      socket.on("players", (players) => {
        let pingStatsHtml = "Socket Ping Stats<br/><br/>";
        Object.keys(players).forEach((playerId, i) => {
          const timestamp = Date.now();

          pingStatsHtml +=
            playerId + " " + (timestamp - players[playerId].time) + "ms<br/>";

          if (!this.players[playerId]) {
            const geometry = new THREE.BoxGeometry(100, 200, 100);
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            this.players[playerId] = new THREE.Mesh(geometry, material);
            this.players[playerId].position.set(
              players[playerId].position.x,
              players[playerId].position.y,
              players[playerId].position.z
            );

            this.scene.add(this.players[playerId]);

            if (playerId == socket.id) {
              this.createCameras();

              const gui = new GUI();

              const cubeFolder = gui.addFolder("Cube");
              const cubePositionFolder = cubeFolder.addFolder("Position");
              cubePositionFolder.add(this.player.position, "x", -500, 500);
              cubePositionFolder.add(this.player.position, "z", -500, 500);
              cubePositionFolder.open();

              cubeFolder.open();
            }
          } else {
            if (players[playerId].position) {
              new TWEEN.Tween(this.players[playerId].position)
                .to(
                  {
                    x: players[playerId].position.x,
                    y: players[playerId].position.y,
                    z: players[playerId].position.z,
                  },
                  50
                )
                .start();
            }
            // TODO : add rotation
          }
          document.getElementById("pingStats").innerHTML = pingStatsHtml;
        });
      });

      this.animate(); // start the render
    });
  }

  createControls() {
    var controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.maxDistance = 100;
    controls.minDistance = 100;
    //controls.maxPolarAngle = (Math.PI / 4) * 3;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = 0;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0;
    controls.rotateSpeed = 0.4;
    controls.enableDamping = false;
    controls.dampingFactor = 0.1;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minAzimuthAngle = -Math.PI / 2; // radians
    controls.maxAzimuthAngle = Math.PI / 4; // radians
  }

  createCameras() {
    // define back camera
    const back = new THREE.Object3D();
    back.position.set(0, 300, -600);
    back.parent = this.players[socket.id];

    this.player.cameras = { back };

    // set active camera
    this.player.cameras.active = this.player.cameras.back;
  }

  createScene() {
    // create a renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.domElement.id = "gameContainer";
    document.body.appendChild(this.renderer.domElement);

    window.addEventListener(
      "resize",
      () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
      },
      false
    );

    // create a scene that will be rendered in render.render()
    this.scene = new THREE.Scene();

    // camera
    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1;
    const far = 5000;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(112, 100, 600);

    // create a light
    let light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 200, 0);
    this.scene.add(light);

    const shadowSize = 200;
    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 200, 100);
    light.castShadow = true;
    light.shadow.camera.top = shadowSize;
    light.shadow.camera.bottom = -shadowSize;
    light.shadow.camera.left = -shadowSize;
    light.shadow.camera.right = shadowSize;
    this.scene.add(light);
    this.sun = light;

    // floor
    var mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(10000, 10000),
      new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    // grid floor
    var grid = new THREE.GridHelper(5000, 40, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    this.scene.add(grid);

    // walls
    let geometry = new THREE.BoxGeometry(500, 400, 500);
    let material = new THREE.MeshBasicMaterial({
      color: 0x222222,
    });

    this.colliders = [];

    for (let x = -5000; x < 5000; x += 1000) {
      for (let z = -5000; z < 5000; z += 1000) {
        if (x == 0 && z == 0) continue;
        const box = new THREE.Mesh(geometry, material);
        box.position.set(x, 200, z);
        this.scene.add(box);
        this.colliders.push(box);
      }
    }
  }

  createPlayer() {
    this.player = new Player(socket.id, new THREE.Vector3(0, 100, 0));
    socket.emit("newPlayer", this.player);
  }

  // render scene
  animate(t) {
    requestAnimationFrame((t) => {
      this.animate(t);
    });

    TWEEN.update(t);

    if (
      this.players[socket.id] &&
      this.player.cameras != undefined &&
      this.player.cameras.active != undefined
    ) {
      this.camera.position.lerp(
        this.player.cameras.active.getWorldPosition(new THREE.Vector3()),
        1
      );

      // look above player
      const pos = this.player.position.clone();
      pos.y += 200;
      this.camera.lookAt(pos);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new Client();
});
