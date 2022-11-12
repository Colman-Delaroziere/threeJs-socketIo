class Player {
  #players;
  constructor(id, players) {
    this.#players = players;

    this.playerId = id;

    this.position = {
      x: 1,
      y: 0,
      z: 1,
    };
    this.rotation = {
      x: 0,
      y: 0,
      z: 0,
    };
    this.size = {
      x: 1,
      y: 1,
      z: 1,
    };

    this.speed = 0.1;
    this.turnSpeed = 0.05;

    this.init();
  }

  init() {
    this.#players[this.playerId] = this;
  }

  remove() {
    delete this.#players[this.playerId];
  }

  update(data) {
    this.position = {
      x: data.position.x,
      y: data.position.y,
      z: data.position.z,
    };
    this.rotation = {
      x: data.rotation.x,
      y: data.rotation.y,
      z: data.rotation.z,
    };
  }
}

module.exports = Player;
