'use strict';

const PokemonGO = require('./../../config/poke.io.js');
const q = require('q');

var PokemonService = {
    getPokemonsByLocation: getPokemonsByLocation,
    tryLogIn: tryLogIn,
    getPokemonsByLocationWithToken: getPokemonsByLocationWithToken
};

module.exports = PokemonService;


function userAuthenticated(err, account, id) {
    if (err) {
        sails.log.error(new Error(err));
        if (sails.registerSockets[id]) {
            sails.registerSockets[id].emit("auth", {
                status: 'failed',
                message: 'Something went wrong'
            });
            sails.log.info('auth message error sent');
        }
        return;
    }

    if (sails.registerSockets[id]) {
        sails.registerSockets[id].emit("auth", {
            status: 'success'
        });
        sails.log.info('auth message sent');
    }

    sails.log.info('1[i] Current location: ' + account.playerInfo.locationName);

    sails.log.info('1[i] lat/long/alt: : ' + account.playerInfo.latitude + ' ' + account.playerInfo.longitude + ' ' + account.playerInfo.altitude);

    account.GetProfile(function(err, profile) {
        if (err) {
            sails.log.error(new Error(err));
        }

        sails.log.info('1[i] Username: ' + profile.username);
        sails.log.info('1[i] Poke Storage: ' + profile.poke_storage);
        sails.log.info('1[i] Item Storage: ' + profile.item_storage);

        var poke = 0;
        if (profile.currency[0].amount) {
            poke = profile.currency[0].amount;
        }

        sails.log.info('1[i] Pokecoin: ' + poke);

        sails.log.info('1[i] Stardust: ' + profile.currency[1].amount);

        sails.pokemonSearchIntervals[id] = setInterval(function() {
            if (sails.userLatLng[id] === undefined ||  typeof sails.userLatLng[id] === 'undefined' || sails.userLatLng[id] === null) {
                sails.pokemonSearchIntervals[id] = 0;
                return;
            }
            if (sails.userLatLng[id].lat && sails.userLatLng[id].lng) {
                account.Heartbeat(sails.userLatLng[id].lat, sails.userLatLng[id].lng, function(err, hb) {
                    if (err) {
                        sails.log.info(err);
                    }

                    for (var i = hb.cells.length - 1; i >= 0; i--) {
                        if (hb.cells[i].NearbyPokemon[0]) {
                            sails.log.info('POKEMON LOC: ' + JSON.stringify(hb.cells[i].DecimatedSpawnPoint));
                            var pokeResponse = null;
                            if (hb.cells[i].DecimatedSpawnPoint) {
                                var latlng = hb.cells[i].DecimatedSpawnPoint;
                                if (latlng && latlng.length > 0) {
                                    pokeResponse = {
                                        lat: latlng[0].Latitude,
                                        lng: latlng[0].Longitude
                                    }
                                }

                            }
                            var pokemon = account.pokemonlist[parseInt(hb.cells[i].NearbyPokemon[0].PokedexNumber) - 1];
                            console.log(JSON.stringify(pokemon));
                            if (pokeResponse != null) {
                                pokeResponse.name = pokemon.name;
                                pokeResponse.img = pokemon.img;
                                pokeResponse.num = pokemon.num;
                                sails.registerSockets[id].emit('pokeFound', {
                                    pokemon: pokeResponse
                                });
                            }

                            var pp = '1[+] There is a ' + pokemon.name + ' at ' + hb.cells[i].NearbyPokemon[0].DistanceMeters.toString() + ' meters'
                            console.log('IDS: ' + id);

                            sails.log.info(pp);
                        }
                    }

                });
            } else {
                sails.log.info('not lat lng**********');
            }

        }, 10000);

    });
}

function tryLogIn(user, pass) {
    var deffered = q.defer();
    var account = new PokemonGO.Pokeio();

    account.GetAccessToken(user, pass, function(err, token) {

        if (err) {
            deffered.reject(err);
        } else {
            deffered.resolve(token);
        }
    });

    return deffered.promise;
}

function setLocation(userLat, userLng, address, id) {
    // body...
    const location = {
        type: 'name',
        name: address,
        coords: {
            latitude: userLat,
            longitude: userLng,
            altitude: 0
        }
    };

    sails.userLatLng[id] = {
        lat: userLat,
        lng: userLng
    };

    return location;

}

function getPokemonsByLocationWithToken(userLat, userLng, address, token, id) {
    var account = new PokemonGO.Pokeio();

    let provider = 'google';

    const location = setLocation(userLat, userLng, address, id);

    sails.log.info('user location ' + id + ' saved as: ' + JSON.stringify(sails.userLatLng[id]));

    account.initWithToken(location, provider, token, function(err) {
        if (err) {
            if (sails.registerSockets[id]) {
                sails.registerSockets[id].emit("Error", {
                    message: 'Please review your credentials'
                });
            }
        }

        userAuthenticated(err, account, id);
    });

}

function getPokemonsByLocation(userLat, userLng, address, username, password, id) {
    var account = new PokemonGO.Pokeio();

    let provider = 'google';

    const location = setLocation(userLat, userLng, address, id);

    sails.log.info('user location ' + id + ' saved as: ' + JSON.stringify(sails.userLatLng[id]));

    account.init(username, password, location, provider, function(err) {
        if (err) {
            if (sails.registerSockets[id]) {
                sails.registerSockets[id].emit("Error", {
                    message: 'Please review your credentials'
                });
            }
        }
        userAuthenticated(err, account, id);
    });

}