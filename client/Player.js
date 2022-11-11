import { Vector3 } from "three";

class Player {
  constructor(clientId, position) {
    this.id = clientId;
    this.size = { w: 100, h: 200 };
    this.position = position ? position : new Vector3(0, 100, 0);
    this.rotation = 0;
  }
}

export default Player;
