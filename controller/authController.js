require('dotenv').config()
const db = require('../database')
const bcrypt = require('bcryptjs')
const validator = require('validator');
const jwt = require('jsonwebtoken');
const JWT_KEY = process.env.JWT_KEY

const registerUser = async (req, res, next) => {
    const name = req.body.name
    const gender = req.body.gender
    const birthday = req.body.birthday
    const city = req.body.city
    const phoneNum = req.body.phoneNum
    const password = req.body.password
    const email = req.body.email
    const isEmail = validator.isEmail(email)

    if (isEmail) {
        const [rows] = await db.query('select * from users where email = ? limit 1', [email])

        if (name.length == 0 || gender.length == 0 || birthday.length == 0 || city.length == 0 || phoneNum.length == 0 || password.length == 0) {
            res.status(409)
            const error = new Error("Please enter all the field")
            next(error)
            /*} else if (password.length < 8){
                res.status(409)
                const error = new Error("Minimum password length is 8")
                next(error)*/
        } else if (rows.length == 0) {
            const [rows2] = await db.query('select * from users where name = ? limit 1', [name])
            if (rows2.length == 0) {
                const [rows] = await db.query('select * from users where phoneNum = ? limit 1', [phoneNum])
                if (rows.length == 0) {
                    const hashedPassword = await bcrypt.hash(password, 11)

                    const isRegistered = await db.query("insert into users(name, gender, birthday, city, email, phoneNum, hashedPassword) values(?,?,str_to_date(?, '%d-%m-%Y'),?,?,?,?)", [name, gender, birthday, city, email, phoneNum, hashedPassword])

                    if (isRegistered) {
                        const [lastId] = await db.query('select Auto_increment from information_schema.TABLES where TABLE_NAME = "users" and TABLE_SCHEMA = '+ process.env.DB_HOST)

                        const payload = {
                            "id": lastId[0].Auto_increment,
                            "name": name,
                            "email": email
                        }
                        const token = await jwt.sign(payload, JWT_KEY)

                        if (token) {
                            res.json({
                                "success": true,
                                "token": token,
                                "message": "Success Login"
                            })
                        } else {
                            res.status(500)
                            const error = new Error("JWT Error, cant create token")
                            next(error)
                        }
                    } else {
                        res.status(500)
                        const error = new Error("Error when register")
                        next(error)
                    }
                } else {
                    res.status(409)
                    const error = new Error("Phone number already registered")
                    next(error)
                }
            } else {
                res.status(409)
                const error = new Error("Name already registered")
                next(error)
            }
        } else {
            res.status(409)
            const error = new Error("Email already exist")
            next(error)
        }
    } else {
        res.status(409)
        const error = new Error("Invalid Email")
        next(error)
    }
}

const loginUser = async (req, res, next) => {
    const email = req.body.email
    const [rows] = await db.query('select * from users where email = ?',
        [email])
    if (rows.length != 0) {
        const user = rows[0]
        const password = req.body.password
        bcrypt.compare(password, user.hashedPassword)
            .then(async () => {
                const payload = {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name
                }
                const token = await jwt.sign(payload, JWT_KEY)
                if (token) {
                    res.json({
                        "success": true,
                        "message": "Login successfully!",
                        "token": token,
                        "id": user.id
                    })
                } else {
                    res.status(500)
                    const error = new Error("JWT Error, cant create token")
                    next(error)
                }
            })
            .catch(() => {
                res.status(406)
                const error = new Error("Incorrect password")
                next(error)
            })
    } else {
        res.status(406)
        const error = new Error("Incorrect email")
        next(error)
    }
}

const authController = {
    registerUser,
    loginUser
}

module.exports = authController