const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

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
    const app = express();
    this.server = http.createServer(app);
    const io = new Server(this.server);

    app.use(express.static(path.join(__dirname, "../client")));
    app.get("/", (req, res) => {
      res.sendFile(__dirname + "/index.html");
    });

    // publish server
    this.server.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}. \n`);
    });

    // io
    io.on("connection", (socket) => {
      this.handleUserConnect(socket);
      this.handleUserDisconnect(socket);
    });
  }

  handleUserConnect(user) {
    this.users[user.id] = {};

    console.log(
      `user ${user.id} connected. \n  ${
        Object.keys(this.users).length
      } users online \n`
    );
  }

  handleUserDisconnect(user) {
    user.on("disconnect", () => {
      delete this.users[user.id];
      delete this.players[user.id];

      console.log(
        `user ${user.id} disconnected. \n  ${
          Object.keys(this.users).length
        } users online \n`
      );
    });
  }
}

new App(4000);
