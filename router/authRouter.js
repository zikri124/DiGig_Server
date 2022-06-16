const router = require('express').Router()
const authController = require('../controller/authController')
const { checkToken } = require('../middleware')

router.post('/register', authController.registerUser)
router.post('/login', authController.loginUser)


module.exports = router