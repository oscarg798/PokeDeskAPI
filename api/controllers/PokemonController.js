/**
 * PokemonController
 *
 * @description :: Server-side logic for managing Pokemons
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict';
var q = require('q');

const fs = require('fs');

var PokemonController = {
    load: tryLoadPokemons,
    getByName: getByName,
    getAll: getAll,
    getNearbyPokemons: getNearbyPokemons,
    updateLatlng: updateLatlng,
    getAccessToken:getAccessToken
};


module.exports = PokemonController;

function getByName(req, res) {
    if (!req.param('name')) {
        return res.json(412, {
            status: 'failed',
            message: 'you must send a name'
        });
    }

    Pokemon.findOne({
        name: req.param('name')
    }, function(err, pokemon) {
        if (err) {
            return res.json(500, {
                status: 'failed',
                message: 'Something went wrong. \n' + err
            });
        }

        if (!pokemon) {
            return res.json(200, {
                status: 'failed',
                message: 'not pokemon founded'
            });
        }
        return res.json(200, {
            status: 'success',
            pokemon: pokemon
        });
    });
}

function getAll(req, res) {
    var pagination = req.param('pagination') || 1;
    var skip = req.param('skip') || 0;

    Pokemon.find({}).paginate({
        page: pagination,
        limit: skip
    })
        .exec(function(err, pokemons) {
            if (err) {
                return res.json(500, {
                    status: 'failed',
                    message: 'Something went wrong. \n' + err
                });
            }

            return res.json(200, {
                status: 'success',
                page: pagination,
                limit: skip,
                pokemon: pokemons
            });
        })

}


function validatePokemons() {
    var prom = q.defer();
    Pokemon.find({}, function(err, pokemons) {

        if (err) {
            prom.reject(err);
        } else if (pokemons &&  pokemons.length !== 0) {
            prom.resolve(true);
        } else {
            prom.resolve(false);
        }


    });

    return prom.promise;
}

function loadPokemons(res) {


    console.log('sended');
    var path = './pokeDeskTemplate.json'
    fs.readFile(path, 'utf8', function(err, data) {
        if (err) {
            return res.json(err);
        }

        var pokemonList = [];
        var pokemon = {};
        var jsonData = JSON.parse(data);
        for (var i = 0; i < jsonData.length; i++) {
            pokemon = {
                number: jsonData[i].number || null,
                name: jsonData[i].name,
                attacks: jsonData[i].moves,
                type: jsonData[i].type,
                image: jsonData[i].image || null,
                weaknesses: jsonData[i].weaknesses || null,
                evolutions: jsonData[i].evolutions ||  null,
                pre_evolutions: jsonData[i].pre_evolutions || null,
                height: jsonData[i].height || null,
                weight: jsonData[i].weight || null,

            }
            pokemonList.push(pokemon);
        }

        Pokemon.create(pokemonList, function(err, pokemons) {
            if (err) {
                return res.json(err);
            }

            res.json(201, pokemons);
        });

    });
}

function tryLoadPokemons(req, res) {

    validatePokemons().then(function(response) {
        if (response) {
            res.json('we have pokemons');
        } else {
            loadPokemons(res);
        }
    }).catch(function(err) {
        sails.info.error(err);
    });

}

function updateLatlng(req, res) {
    const params = ['lat', 'lng', 'id'];
    if (!Utils.validateParams(req, params)) {
        return res.json(400, Utils.getErrorPayload('you must send params'));
    }


    sails.userLatLng[req.param('id')].lat = req.param('lat');
    sails.userLatLng[req.param('id')].lng = req.param('lng');

    return res.json(200, {
        status: 'success',
        message: 'location updated to ' + sails.userLatLng[req.param('id')]
    });
}

function getSocketID(req, res) {
    console.log('llego request');
    if (!req.isSocket) {
        console.log('Bad Request');
        return res.badRequest();
    }

    var socketId = sails.sockets.getId(req);

    sails.sockets.broadcast('pokeFound', {
        pokemon: 'Hola!'
    });


    sails.log('My socket ID is: ' + socketId);

    return res.json(socketId);
}

function getAccessToken(req, res) {
    const params = ['username', 'password'];

    if (!Utils.validateParams(req, params)) {
        return res.json(400, Utils.getErrorPayload('you must send params'));
    }

    PokemonService.tryLogIn(req.param('username'), req.param('password'))
        .then(function(token) {
            res.json(200, {
                status: 'success'
            });
        }).catch(function(err) {
            res.json(403, {
                status: 'failed',
                message: 'invalid credentials'
            });
        });

}

function getNearbyPokemons(req, res) {
    const params = ['lat', 'lng', 'username', 'password', 'id'];
    if (!Utils.validateParams(req, params)) {
        return res.json(400, Utils.getErrorPayload('you must send params'));
    }

    console.log(req.param('id'));

    sails.log.info('We are going to  get the address from user lat lng');

    DirectionService.getDirection({
        lat: req.param('lat'),
        lng: req.param('lng')
    })
        .then(function(response) {
            PokemonService.getPokemonsByLocation(req.param('lat'),
                req.param('lng'), response, req.param('username'),
                req.param('password'), req.param('id'));

            res.json(200, {
                status: 'success',
                message: 'searching'
            });
        })
        .catch(function(err) {
            sails.log.error(new Error(err));
            res.json(500, {
                status: 'failed',
                message: err
            });
        });





}