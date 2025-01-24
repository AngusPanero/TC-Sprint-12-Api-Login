const express = require("express");
const jwt = require("jsonwebtoken");
const { verificacion } = require("./middleware");
const users = require('./usuarios');
const { hash } = require("./crypto");
const router = express.Router();


router.get("/", (req, res) => {
    const formularioIndex = `
    <h1>Bienvenido a la Api de Rick y Morty!</h1>
    <form action="/login" method="post">
    <label for="username">Usuario</label>
    <input type="text" id="username" name="username" required><br>

    <label for="password">Contraseña</label>
    <input type="text" id="password" name="password" required><br>

    <button type="submit">Iniciar Sesión</button>
    </form>
    `

    res.send(formularioIndex)
})

router.post("/login", (req, res) => {
    const { username, password } = req.body
    const user = users.find((u) => u.password === password && u.username === username);

    if(user){
        const token = jwt.sign({user: user.id}, hash, {expiresIn: "1h"})
        req.session.token = token;
        res.redirect("/api")
    } else{
        res.status(401).json({ mensaje: "Credenciales Invalidas" });
    }
})

router.get("/api", verificacion, (req, res) => {
    const user = users.find((u) => u.id === req.user);
    console.log("req user", req.user)

    if(user){
        const html = `
            <h1>Bienvenido, ${user.name}</h1>
            <p>ID: ${user.id}</p>
        `;
        res.send(html);
    } else{
            res.status(401).json({ mensaje : `Usuario Inexistente`});
        }
})

module.exports = { router }