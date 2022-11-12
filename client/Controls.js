import * as THREE from "three";

class Controls {
  constructor(scene, socketClient) {
    this.scene = scene;
    this.client = socketClient;

    this.keyState = {};

    this.init();
  }

  init() {
    this.client.on("updatePosition", (data) => {
      this.updatePlayerPosition(data);
    });

    this.raycaster = new THREE.Raycaster();

    document.addEventListener("click", (e) => this.onMouseClick(e), false);
    document.addEventListener("keydown", (e) => this.onKeyDown(e), false);
    document.addEventListener("keyup", (e) => this.onKeyUp(e), false);
  }

  updatePlayerPosition(data) {
    var somePlayer = this.scene.otherPlayers[data.playerId];

    somePlayer.position.x = data.position.x;
    somePlayer.position.y = data.position.y;
    somePlayer.position.z = data.position.z;

    somePlayer.rotation.x = data.rotation.x;
    somePlayer.rotation.y = data.rotation.y;
    somePlayer.rotation.z = data.rotation.z;
  }

  onMouseClick(event) {
    let intersects = this.calculateIntersects(event);

    if (intersects.length > 0) {
      //If object is intersected by mouse pointer, do something
      if (intersects[0].object == this.scene.sphere) {
        alert("This is a sphere!");
      }
    }
  }

  onKeyDown(event) {
    this.keyState[event.keyCode || event.which] = true;
  }

  onKeyUp(event) {
    this.keyState[event.keyCode || event.which] = false;
  }

  checkKeyStates() {
    if (this.keyState[38] || this.keyState[87]) {
      // up arrow or 'w' - move forward
      this.scene.player.position.x -=
        this.scene.player.moveSpeed * Math.sin(this.scene.player.rotation.y);
      this.scene.player.position.z -=
        this.scene.player.moveSpeed * Math.cos(this.scene.player.rotation.y);
      this.updatePlayerData();
      this.client.emit("updatePosition", this.scene.playerData);
    }
    if (this.keyState[40] || this.keyState[83]) {
      // down arrow or 's' - move backward
      this.scene.player.position.x +=
        this.scene.player.moveSpeed * Math.sin(this.scene.player.rotation.y);
      this.scene.player.position.z +=
        this.scene.player.moveSpeed * Math.cos(this.scene.player.rotation.y);
      this.updatePlayerData();
      this.client.emit("updatePosition", this.scene.playerData);
    }
    if (this.keyState[37] || this.keyState[65]) {
      // left arrow or 'a' - rotate left
      this.scene.player.rotation.y += this.scene.player.turnSpeed;
      this.updatePlayerData();
      this.client.emit("updatePosition", this.scene.playerData);
    }
    if (this.keyState[39] || this.keyState[68]) {
      // right arrow or 'd' - rotate right
      this.scene.player.rotation.y -= this.scene.player.turnSpeed;
      this.updatePlayerData();
      this.client.emit("updatePosition", this.scene.playerData);
    }
    if (this.keyState[81]) {
      // 'q' - strafe left
      this.scene.player.position.x -=
        this.scene.player.moveSpeed * Math.cos(this.scene.player.rotation.y);
      this.scene.player.position.z +=
        this.scene.player.moveSpeed * Math.sin(this.scene.player.rotation.y);
      this.updatePlayerData();
      this.client.emit("updatePosition", this.scene.playerData);
    }
    if (this.keyState[69]) {
      // 'e' - strafe right
      this.scene.player.position.x +=
        this.scene.player.moveSpeed * Math.cos(this.scene.player.rotation.y);
      this.scene.player.position.z -=
        this.scene.player.moveSpeed * Math.sin(this.scene.player.rotation.y);
      this.updatePlayerData();
      this.client.emit("updatePosition", this.scene.playerData);
    }
  }

  calculateIntersects(event) {
    //Determine objects intersected by raycaster
    event.preventDefault();

    var vector = new THREE.Vector3();
    vector.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
      0.5
    );
    vector.unproject(this.scene.camera);

    this.raycaster.ray.set(
      this.scene.camera.position,
      vector.sub(this.scene.camera.position).normalize()
    );

    var intersects = this.raycaster.intersectObjects(this.scene.objects);

    return intersects;
  }

  updatePlayerData() {
    this.scene.playerData.position.x = this.scene.player.position.x;
    this.scene.playerData.position.y = this.scene.player.position.y;
    this.scene.playerData.position.z = this.scene.player.position.z;

    this.scene.playerData.rotation.x = this.scene.player.rotation.x;
    this.scene.playerData.rotation.y = this.scene.player.rotation.y;
    this.scene.playerData.rotation.z = this.scene.player.rotation.z;
  }
}

export default Controls;
