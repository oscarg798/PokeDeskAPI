'use strict';

const PokemonGO = require('./../../config/poke.io.js');

var PokemonService = {
    getPokemonsByLocation: getPokemonsByLocation
};

module.exports = PokemonService;


function userAuthenticated(err, account) {
    if (err) {
        sails.log.error(new Error(err));
        return;
    }

    sails.log.info('1[i] Current location: ' + account.playerInfo.locationName);

    sails.log.info('1[i] lat/long/alt: : ' 
        + account.playerInfo.latitude + ' ' 
        + account.playerInfo.longitude + ' ' 
        + account.playerInfo.altitude);

    account.GetProfile(function(err, profile) {
        if (err) throw err;

        sails.log.info('1[i] Username: ' + profile.username);
        sails.log.info('1[i] Poke Storage: ' + profile.poke_storage);
        sails.log.info('1[i] Item Storage: ' + profile.item_storage);

        var poke = 0;
        if (profile.currency[0].amount) {
            poke = profile.currency[0].amount;
        }

        sails.log.info('1[i] Pokecoin: ' + poke);
        sails.log.info('1[i] Stardust: ' + profile.currency[1].amount);

        setInterval(function() {
            account.Heartbeat(function(err, hb) {
                if (err) {
                    sails.log.info(err);
                }

                for (var i = hb.cells.length - 1; i >= 0; i--) {
                    if (hb.cells[i].NearbyPokemon[0]) {
                        sails.log.info('POKEMON LOC: ' + JSON.stringify(hb.cells[i].DecimatedSpawnPoint));
                        var pokemon = account.pokemonlist[parseInt(hb.cells[i].NearbyPokemon[0].PokedexNumber) - 1];
                        // sails.log.info(JSON.stringify(pokemon));
                        //sails.log.info(JSON.stringify(hb.cells[i].NearbyPokemon[0]));
                        sails.log.info('1[+] There is a ' + pokemon.name + ' at ' + hb.cells[i].NearbyPokemon[0].DistanceMeters.toString() + ' meters');
                    }
                }

            });
        }, 100);

    });
}

function getPokemonsByLocation(lat, lng, address, username, password) {
    var account = new PokemonGO.Pokeio();


    const location = {
        type: 'name',
        name: address,
        coords: {
            latitude: lat,
            longitude: lng,
            altitude: 0
        }
    };

    let provider = 'google';


    account.init(username, password, location, provider, function (err) {
        userAuthenticated(err, account);
    });

}