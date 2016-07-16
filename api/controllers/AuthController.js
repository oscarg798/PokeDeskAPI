/**
 * AuthController
 *
 * @description :: Server-side logic for managing Auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const paramsNames = ['username', 'password'];
const jwt = require('jsonwebtoken');
const verifyTokenParams = ['token'];

var AuthController = {
    logIn: logIn,
    verifyToken: verifyToken

};

module.exports = AuthController;

function verifyToken(req, res) {
    
    if (!Utils.validateParams(req, verifyTokenParams)) {
        return res.json(400, Utils.getErrorPayload('you must send params'));
    }

    SecurityProvider.verifyToken(req.param('token'))
    .then(function (response) {
    	res.json(response);
    }).catch(function (err){
    	sails.log.error(err);
    	res.json(400, Utils.getErrorPayload('token error: ' + err.message))
    });


}

function logIn(req, res) {

    if (!Utils.validateParams(req, paramsNames)) {
        return res.json(400, Utils.getErrorPayload('you must send params'));
    }

    User.findOne({
        username: req.param('username')
    }, function(err, user) {
        if (err) {
            sails.log.error(err);
            return res.json(500, Utils.getErrorPayload(err));
        }

        if (!user) {
            return res.json(400, Utils.getErrorPayload('User or password incorrect'));
        }

        require('bcrypt').compare(req.param('password'), user.encryptedPassword,
            function(err, isValid) {

                if (err) {
                    sails.log.error(err);
                    return res.json(500, Utils.getErrorPayload(err));
                }

                if (!isValid) {
                    return res.json(400, Utils.getErrorPayload('User or password incorrect'));

                }

                var token = jwt.sign(user, sails.config.Secret.jwtSecret, {
                    expiresIn: '1m' // 24 hours
                });

                return res.json(200, Utils.getSuccessPayload('token', token));


            });
    });

}