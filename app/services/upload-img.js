require('dotenv').config();
mongoose = require('mongoose');
var modelUpload = mongoose.model('Upload');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const aws = require('aws-sdk');
const s3 = new aws.S3();

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DAFAULT_REGION, S3_BUCKET = 'vetzco-img' } = process.env;

async function removeImg(id) {
    try {
        const arquivo = await modelUpload.findById(id);

        await modelUpload.deleteOne({ _id: arquivo.id })
            .then(function() {
                    if (process.env.STORAGE_TYPE === 'local') {
                        var pathDir = path.resolve(__dirname, '..', '..', '..', 'public', 'uploads', arquivo.key);
                        console.log(pathDir);
                        fs.unlink(pathDir, (err) => {
                            if (err) throw err;
                            console.log(pathDir);
                        })
                    } else if (process.env.STORAGE_TYPE === 's3') {
                        const params = {
                            Bucket: S3_BUCKET,
                            Key: arquivo.key
                        }
                        return s3.deleteObject(params).promise();
                    }
                    return arquivo.key;
                },
                function(error) {
                    console.log(error);
                })

    } catch (err) {
        console.log('ERRO AO EXCLUIR IMAGEM' + err);
        return null;
    }
}

/**
 *
 * @param  {string}  base64 Data
 * @return {string}  Image url
 */
const imageUpload = async(base64) => {

    require('dotenv').config();
    const crypto = require('crypto');
    const AWS = require('aws-sdk');

    const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DAFAULT_REGION, S3_BUCKET = 'vetzco-img' } = process.env;

    const s3 = new AWS.S3();

    const base64Data = new Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');

    const type = base64.split(';')[0].split('/')[1];

    const userId = crypto.randomBytes(16).toString('hex');

    const params = {
        Bucket: S3_BUCKET,
        Key: `${userId}.${type}`,
        Body: base64Data,
        ContentEncoding: 'base64', // required
        ContentType: `image/${type}` // required. Notice the back ticks
    }

    let location = '';
    let key = '';
    let data = {};
    try {
        const { Location, Key } = await s3.upload(params).promise();
        location = Location;
        key = Key;

        return await sizeOf(Key, S3_BUCKET).then((size) => {
            return data = { location, key, size: size }
        })

        console.log(data);
    } catch (error) {
        console.log(error)
    }

    return data;

}

function sizeOf(key, bucket) {
    require('dotenv').config();

    const AWS = require('aws-sdk');
    const s3 = new AWS.S3();

    return s3.headObject({ Key: key, Bucket: bucket })
        .promise()
        .then(res => res.ContentLength);
}


module.exports = {
    removeImg,
    imageUpload
}