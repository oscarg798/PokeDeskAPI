const q = require('q');
const axios = require('axios');

var DirectionService = {
    getDirection: getDirection
};

module.exports = DirectionService;

function getDirection(latlng) {
    sails.log.info('getting directions');

    var deferred = q.defer();
    var urlGoogleApi = sails.config.configProvider.urls.geoCodeApi + latlng.lat + ',' + latlng.lng + '&key=' + sails.config.Secret.geocodeApiKey;

    axios.get(urlGoogleApi).then(function(response) {

        if (response && response.data && response.data.results && response.data.results.length > 0) {
            deferred.resolve(response.data.results[0].formatted_address);
        } else {
            deferred.reject('can not get address');
        }

    }).catch(function(error) {

        sails.log.error(error);
        deferred.reject(error);

    });

    return deferred.promise;


}