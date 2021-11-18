const axios = require('axios')
require('dotenv').config();

const key = process.env.TOKEN_GMAPS;

async function getLocaleByCEP(address) {

    let addressMaps = address.logradouro + ', ' + address.numero + ' - ' + address.bairro + ', ' + address.municipio + ' - ' + address.estado + ', ' + address.cep;
    addressMaps = addressMaps.replace(/[^a-zA-Z ]/g, "")

    try {
        const data = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${addressMaps}&key=${key}`
        )
       return data.data.results[0].geometry.location;

    }
    catch (err) {
        console.log('ERRO AO BUSCAR LOCALE POR CEP -> ' + err);
        return null;
    }

}

async function getLocale(search) {

    try {
        const neighborhood = 'chelsea'
        const borough = 'manhattan'
        const city = 'new+york+city'
        const category = 'burgers'

        const { data } = await axios.get(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${category}+${neighborhood}+${borough}+${city}&type=restaurant&key=${key}`
        )
        
        res.json(data)
    }
    catch (err) {
        next(err)
    }

}

module.exports = {
    getLocaleByCEP,
    getLocale
  }