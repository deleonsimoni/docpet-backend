const axios = require('axios')
require('dotenv').config();

const key = process.env.TOKEN_GMAPS;

if(!key){
    throw "NÃO FOI POSSÍVEL LOCALIZAR A CHAVE DO GOOGLE MAPS";
}

async function getLocaleByCEP(address) {

    let addressMaps = address.logradouro + ', ' + address.numero + ' - ' + address.bairro + ', ' + address.municipio + ' - ' + address.estado + ', ' + address.cep;
    addressMaps = addressMaps.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

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

async function getLocaleFromPlaceID(placeID) {

    try {
        
        const data = await axios.get(
            `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeID}&key=${key}&language=pt_BR`
        )

        return data.data.result.geometry.location;
    }
    catch (err) {
        console.log('ERRO AO BUSCAR LOCALE POR PLACEID -> ' + err);
        return null;
    }

}
async function getLocaleFromDescription(description) {

    try {
         console.log(description); 
        const data = await axios.get(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${description}&key=${key}`
        )
        if(!data.data){
            throw "NÃO POSSÍVEL ENCOTRAR LOCALIZAÇÃO PELO ENDEREÇO INFORMADO";
        } 
        
        return data.data.results[0];
    }
    catch (err) {
        console.log('ERRO AO BUSCAR LOCALE POR DESCRIÇÃO -> ' + err);
        return null;
    }

}

async function getLocale(search) {

    let response = [];

    try {
        var headers = {
            'User-Agent': 'Super Agent/0.0.1',
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        const data = await axios
            .request({
                url: 'https://maps.googleapis.com/maps/api/place/autocomplete/json?language=pt_BR',
                method: 'GET',
                headers: headers,
                params: {
                    key: key,
                    input: search,
                    types: ['geocode'],
                    componentRestrictions: { country: 'pt_BR' }
                },
            })

            if(data.data && data.data.predictions){
                for (var i of data.data.predictions) {
                    response.push({description: i.description, placeId: i.place_id, main_text: i.structured_formatting.main_text})
                  }
            }
            
          return response;

    }
    catch (err) {
        console.log('ERRO AO BUSCAR LOCALE -> ' + err);
        return null;
    }

}

module.exports = {
    getLocaleByCEP,
    getLocale,
    getLocaleFromPlaceID,
    getLocaleFromDescription
}