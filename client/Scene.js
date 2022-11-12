import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls";
import Stats from "three/addons/libs/stats.module";

class Scene {
  constructor() {
    this.scene;
    this.camera;
    this.renderer;

    this.objects = []; // all object geometries for collision detection
    this.otherPlayers = {};
    this.player;
    this.playerData;

    this.init();
  }

  init() {
    // init renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // show fps indicator
    this.stats = Stats();
    document.body.appendChild(this.stats.dom);

    // create scene
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AxesHelper(5));

    // create camera
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    this.camera.position.z = 5;

    // cube
    let geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    let material = new THREE.MeshNormalMaterial();

    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
    this.objects.push(this.mesh);

    window.addEventListener(
      "resize",
      () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
      },
      false
    );
  }

  render(func) {
    requestAnimationFrame(() => this.render(func));

    if (this.player) {
      this.updateCameraPosition();
      this.camera.lookAt(this.player.position);
    }

    func(); // additional client function

    this.stats.update();

    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
  }

  createPlayer(data) {
    this.playerData = data;

    var cube_geometry = new THREE.BoxGeometry(
      data.size.x,
      data.size.y,
      data.size.z
    );
    var cube_material = new THREE.MeshBasicMaterial({
      color: 0x7777ff,
    });
    this.player = new THREE.Mesh(cube_geometry, cube_material);

    this.player.rotation.set(0, 0, 0);

    this.player.position.x = data.position.x;
    this.player.position.y = data.position.y;
    this.player.position.z = data.position.z;

    this.player.playerId = data.playerId;
    this.player.moveSpeed = data.speed;
    this.player.turnSpeed = data.turnSpeed;

    this.updateCameraPosition();

    this.objects.push(this.player);
    this.scene.add(this.player);

    this.camera.lookAt(this.player.position);
  }

  updateCameraPosition() {
    this.camera.position.x =
      this.player.position.x + 6 * Math.sin(this.player.rotation.y);
    this.camera.position.y = this.player.position.y + 6;
    this.camera.position.z =
      this.player.position.z + 6 * Math.cos(this.player.rotation.y);
  }

  addOtherPlayer(data) {
    var cube_geometry = new THREE.BoxGeometry(
      data.size.x,
      data.size.y,
      data.size.z
    );
    var cube_material = new THREE.MeshBasicMaterial({
      color: 0x7777ff,
    });
    var otherPlayer = new THREE.Mesh(cube_geometry, cube_material);

    otherPlayer.position.x = data.position.x;
    otherPlayer.position.y = data.position.y;
    otherPlayer.position.z = data.position.z;

    this.otherPlayers[data.playerId] = otherPlayer;

    this.objects.push(otherPlayer);
    this.scene.add(otherPlayer);
  }

  removeOtherPlayer(data) {
    this.scene.remove(this.otherPlayers[data.playerId]);
  }

  updatePlayerPosition(data) {
    var somePlayer = this.otherPlayers[data.playerId];

    somePlayer.position.x = data.position.x;
    somePlayer.position.y = data.position.y;
    somePlayer.position.z = data.position.z;

    somePlayer.rotation.x = data.rotation.x;
    somePlayer.rotation.y = data.rotation.y;
    somePlayer.rotation.z = data.rotation.z;
  }
}

export default Scene;
