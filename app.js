const express = require("express");
const session = require("express-session");
const { router } = require("./rutas");
const { hash } = require("./crypto");
const axios = require("axios");

const app = express();
const PORT = 4008;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: hash,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.use("/", router)

app.use((req, res) => {
    res.send(`<h1>404 - Página No Encontrada</h1>`)
})

app.listen(PORT, () => {
    console.log(`Server Listening On PORT: http://localhost:${PORT}`)
})