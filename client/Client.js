// import * as THREE from "three";
import Controls from "./Controls.js";
import Scene from "./Scene.js";

var client = io();

class App {
  constructor() {
    this.init();
  }

  init() {
    client.on("connect", () => {
      this.scene = new Scene();
      this.controls = new Controls(this.scene, client);

      client.emit("requestOldPlayers");

      client.on("createPlayer", (data) => {
        this.scene.createPlayer(data);
      });

      client.on("addOtherPlayer", (data) => {
        this.scene.addOtherPlayer(data);
      });

      client.on("removeOtherPlayer", (data) => {
        this.scene.removeOtherPlayer(data);
      });

      client.on("updatePosition", (data) => {
        this.scene.updatePlayerPosition(data);
      });

      this.scene.render(() => {
        if (this.scene.player) {
          this.controls.checkKeyStates();
        }
        this.scene.mesh.rotation.x += 0.01;
        this.scene.mesh.rotation.y += 0.02;
      });
    });
  }
}

const app = new App();
