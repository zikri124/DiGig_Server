require('dotenv').config()
const db = require('../database')

const getUserData = async (req, res, next) => {
    const id = req.user.id
    const [data] = await db.query('select * from users where id = ?', [id])
    if (data.length > 0) {
        res.json({
            "id" : id,
            "userData" : data[0]
        })
    } else {
        res.status(501)
        const error = new Error("Internal server error")
        next(error)
    }
}

const viewWorker = async (req, res, next) => {
    const id = req.params.workerId
    const [rows] = await db.query('select users.name, users.photoProfile, users.city, workers.salary, workers.avgRate, workers.skills, workers.summary from users inner join workers on users.id = workers.userId where users.id = ?', [id])
    if (rows.length > 0) { 
        const [row2] = await db.query("select title, category, jobDesc, rating, review, city, date_format(createdAt, '%e %M %Y') as date from histories where workerId = ?", [id]) 
        res.json({
            "id" : id,
            "user" : rows[0],
            "experience" : row2
        })
    } else {
        res.status(501)
        const error = new Error("Internal server error")
        next(error)
    }
}

const viewWorkerFull = async(req, res,next) => {
    const id = req.params.userId
    const [rows] = await db.query('select users.*, workers.salary, workers.avgRate, workers.bankAcc, workers.skills from users inner join workers on users.id = workers.userId where users.id = ?', [id])
    if (rows.length > 0) { 
        const [row2] = await db.query("select title, category, jobDesc, avgRate, city, date_format(createdAt, '%e %M %Y') as date from histories where workerId = ?", [id]) 
        res.json({
            "id" : id,
            "user" : rows[0],
            "gigs" : row2
        })
    } else {
        res.status(501)
        const error = new Error("Internal server error")
        next(error)
    }
}

const findUser = async (req, res, next) => {
    const name = req.body.name
    var user = ('select id, name, photoProfile from users where name like "'+name+'%"')
    const [found] = await db.query(user)
    if(found.length > 0){
        res.json({
            "found" : found
        })
    } else {
        res.json({
            "message" : ("No Results Found for \""+name+"\"")
        })
    }
}

const updateUserPhoto = (req, res, next) => {
    const userId = req.user.id
    const newPhoto = req.file.originalname
    db.query('update users set photoProfile = ? where id = ?', [newPhoto, userId])
        .then(() => {
            res.json({
                "success": true,
                "message": "Update profile photo success"
            })
        })
        .catch(() => {
            res.status(501)
            const error = new Error("Internal server error")
            next(error)
        })
} 

const updateUserData = (req, res, next) => {
    const userId = req.user.id
    const newName = req.body.name
    const newPhone = req.body.phone
    const newCity = req.body.city
    db.query('update users set name = ?, city = ?, phoneNum = ? where id = ?', [newName, newCity, newPhone, userId])
        .then(() => {
            res.json({
                "success": true,
                "message": "Update user data success"
            })
        })
        .catch(() => {
            res.status(501)
            const error = new Error("Internal server error")
            next(error)
        })
}

const userController = {
    getUserData,
    viewWorker,
    viewWorkerFull,
    findUser,
    updateUserPhoto,
    updateUserData
}

module.exports = userController