/**
 * PokemonController
 *
 * @description :: Server-side logic for managing Pokemons
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var q = require('q');
var fs = require('fs');




var PokemonController = {
    load: tryLoadPokemons,
    getByName: getByName,
    getAll:getAll
};


module.exports = PokemonController;

function getByName(req, res) {
    if (!req.param('name')) {
        return res.json(412, {
            status: 'failed',
            message: 'you must send a name'
        });
    }

    Pokemon.findOne({name:req.param('name')}, function(err, pokemon) {
        if (err) {
            return res.json(500, {
                status: 'failed',
                message: 'Something went wrong. \n' + err
            });
        }

        if(!pokemon){
        	return res.json(200,{
        		status:'failed',
        		message:'not pokemon founded'
        	});
        }
        return res.json(200, {
        	status:'success',
        	pokemon:pokemon
        });
    });
}

function getAll(req, res) {
	var pagination = req.param('pagination') || 1;
	var skip = req.param('skip') || 0;

	Pokemon.find({}).paginate({page:pagination, limit:skip})
	.exec(function (err, pokemons) {
		  if (err) {
            return res.json(500, {
                status: 'failed',
                message: 'Something went wrong. \n' + err
            });
        }

        return res.json(200, {
        	status:'success',
        	page: pagination,
        	limit:skip,
        	pokemon:pokemons
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
                name: jsonData[i].name,
                attacks: jsonData[i].moves,
                type: jsonData[i].type,
                image:jsonData[i].image || null
            }
            console.log(JSON.stringify(pokemon) + '\n\n');
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