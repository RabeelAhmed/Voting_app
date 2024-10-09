const jwt = require("jsonwebtoken")

const jwtAuthMiddleware = (req, res, next) => {

    const authorization = req.headers.authorization
    if (!authorization)  return res.status(401).send({err: "Token Not Found"})

    const token = req.headers.authorization.split(' ')[1]

    if(!token) return res.status(401).json({error: 'Unathorized'})

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded

        next()

    }catch(err){
        return res.status(500).json({error: 'Invalid token'})
    }

}

const generateToken = (userData) => {
    return jwt.sign({userData}, process.env.JWT_SECRET, {expiresIn: 30000})
}

module.exports = {jwtAuthMiddleware, generateToken}