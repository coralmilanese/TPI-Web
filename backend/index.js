const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hola mundo desde el backend!");
});

app.listen(3002, () => {
  console.log("Escuchando en el puerto 3002");
});
