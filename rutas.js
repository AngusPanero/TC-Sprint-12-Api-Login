const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { verificacion } = require("./middleware");
const users = require('./usuarios');
const { hash } = require("./crypto");
const router = express.Router();
const url = `https://rickandmortyapi.com/api/character/`;

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

    <a href="/logout"><button>Cerrar Sesión</button></a>
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

    if(user){
        const html = `
            <h1>Bienvenido, ${user.name}</h1>
            <p>ID: ${user.id}</p>
            <a href="/character"><button>Accede al JSON Completo</button></a>
            <a href="/search"><button>Busca tu Personaje Favorito</button></a>
            <a href="/logout"><button>Cerrar Sesión</button></a>
        `;
        res.send(html);
    } else{
            res.status(401).json({ mensaje : `Usuario Inexistente`});
        }
})

router.get("/character", async (req, res) => {
    try{
        const response = await axios.get(url)
        const personajes = response.data.results;
        const todosLosPersonajes = personajes.map(({ id, image, name, status, species, gender }) => 
            ({ id, image, name, status, species, gender }))

        res.json(todosLosPersonajes);

    } catch(error){
        res.status(404).json({ mensaje: `Error En La Solicitud`})
    }
})

router.get("/search", (req, res) => { // Metí Script Para Manejar Todo Desde el Back
    res.send(`
        <h1>Busca Tu Personaje de Rick & Morty</h1>
        <form id="formBuscador">
            <label for="inputRM">Introduce el Nombre del Personaje</label>
            <input type="text" id="inputRM" name="name" placeholder="C-137" required />
            <button type="submit">Obtener Personaje</button>
        </form>
        <script>
            const form = document.getElementById('formBuscador');
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const input = document.getElementById('inputRM').value;
                const encodedName = encodeURIComponent(input.trim());
                window.location.href = '/search/' + encodedName;
            });
        </script>
        <a href="/logout"><button>Cerrar Sesión</button></a>
    `);
});

router.get(`/search/:nombre`, async (req, res) => {
    const nombre = req.params.nombre;
    const url2 = `https://rickandmortyapi.com/api/character/?name=${encodeURIComponent(nombre)}`;
    
    try {
        const response = await axios.get(url2);
        const personaje = response.data.results[0];

        if (!personaje) {
            res.send(`
                <h2>No se encontró ningún personaje con el nombre "${nombre}"</h2>
                <a href="/search"><button>Volver a buscar</button></a>
            `);
            return;
        }res.send(`
            <h2>${personaje.name}</h2>
            <img src="${personaje.image}" alt="${personaje.name}" />
            <p>ID: ${personaje.id}</p>
            <p>Tipo: ${personaje.species}</p>
            <p>Género: ${personaje.gender}</p>
            <p>Estado: ${personaje.status}</p>
            <br>
            <a href="/search"><button>Busca Otro Personaje<button></a>
            `);

    } catch (error) {
        res.status(404).send(`
            <h2> 404 - No Existe este Personaje ${nombre}</h2>
            <a href="/search"><button>Volver a buscar</button></a>
        `)};
})

router.get("/logout", (req, res) => {
    req.session.destroy()
    res.redirect("/");
})

module.exports = { router }