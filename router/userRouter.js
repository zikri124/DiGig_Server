const router = require('express').Router()
const userController = require('../controller/userController')
const { checkToken } = require('../middleware')
const { upload } = require('../services')

router.get('/profile', checkToken, userController.getUserData)

router.get('/search', userController.findUser)

router.get('/worker/:workerId', userController.viewWorker)

router.put('/update/photo', checkToken, upload.single('photo'), userController.updateUserPhoto)

router.put('/update', checkToken, userController.updateUserData)

module.exports = router