const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const Player = require("./Player");

class App {
  server;
  port;

  constructor(port) {
    this.port = port;
    this.users = {};
    this.players = {};

    this.init();
  }

  init() {
    // create server
    const expressApp = express();
    this.server = http.createServer(expressApp);
    this.io = new Server(this.server);

    expressApp.use(express.static(path.join(__dirname, "../client")));
    expressApp.get("/", (req, res) => {
      res.sendFile(__dirname + "/index.html");
    });

    // show server
    this.server.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}. \n`);
    });

    // Handle user connection
    this.handleConnection();
  }

  handleConnection() {
    this.io.on("connection", (user) => {
      const app = this;

      // create new player
      const player = new Player(user.id, this.players);

      user.emit("createPlayer", player);
      user.broadcast.emit("addOtherPlayer", player);

      console.log(
        `user ${user.id} connected. \n  ${
          Object.keys(this.players).length
        } users online \n`
      );

      this.getOldPlayers(user, player);

      this.handleUpdate(user, player);

      this.handleDisconnection(user, player);
    });
  }

  getOldPlayers(user) {
    user.on("requestOldPlayers", () => {
      if (this.players) {
        Object.keys(this.players).forEach((playerId) => {
          if (playerId != user.id)
            user.emit("addOtherPlayer", this.players[playerId]);
        });
      }
    });
  }

  handleDisconnection(user, player) {
    user.on("disconnect", () => {
      user.broadcast.emit("removeOtherPlayer", player);
      player.remove();

      console.log(
        `user ${user.id} disconnected. \n  ${
          Object.keys(this.players).length
        } users online \n`
      );
    });
  }

  handleUpdate(user, player) {
    user.on("updatePosition", (data) => {
      player.update(data);
      user.broadcast.emit("updatePosition", player);
    });
  }
}

new App(8080);
