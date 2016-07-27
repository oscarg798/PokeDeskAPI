const q = require('q');
const jwt = require('jsonwebtoken');

var SecurityProvider = {
	verifyToken:verifyToken
};

module.exports = SecurityProvider;

function verifyToken(token) {

	var deferred = q.defer();

	jwt.verify(token,  sails.config.Secret.jwtSecret, function (err, decode) {
		
		if(err){
			 deferred.reject(err);
		}else{
			deferred.resolve(decode);
		}


	});

	return deferred.promise;
}

