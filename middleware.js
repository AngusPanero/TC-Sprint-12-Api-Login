const jwt = require("jsonwebtoken");
const { hash } = require("./crypto");

const verificacion = (req, res, next) => {
    const token = req.session.token

    if(!token){
        return res.status(401).json({ mensaje: "No Hay Token" })
    }

    jwt.verify(token, hash, (error, decoded) => {
        if(error){
            return res.status(401).json({ mensaje: `Token Invalido o Expirado` })
        }
        req.user = decoded.user;
        next()
    })
}

module.exports = { verificacion }