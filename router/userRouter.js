const router = require('express').Router()
const userController = require('../controller/userController')
const { checkToken } = require('../middleware')
const { upload } = require('../services')

router.get('/search', userController.findUser)

router.get('/worker/:workerId', userController.viewWorker)

//router.get('/view/:id', userController.)

router.put('/update', checkToken, upload.single('photo'), userController.updateUserData)

module.exports = router