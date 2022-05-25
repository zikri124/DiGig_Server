require('dotenv').config
const express = require('express')
const multer = require('multer')
const multerS3 = require('multer-s3')
const AWS = require('aws-sdk')

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEYID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
    Bucket: "diggigbucket1"
})

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'diggigbucket1',
        metadata: function (req, file, cb) {
            cb(null, {
                fieldName: file.fieldname
            });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString())
        }
    })
})

module.exports = {
    upload
}