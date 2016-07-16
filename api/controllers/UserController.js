/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const paramsName = ['username', 'email', 'password', 'passwordConfirmation'];

var UserController = {
    signUp: create
}
module.exports = UserController;

function create(req, res) {

    if (!Utils.validateParams(req, paramsName)) {
        return res.json(400, Utils.getErrorPayload('you must send params'));
    }

    console.log(sails.config.Secret.jwtSecret);
    User.create(req.allParams(), function(err, user) {
        if (err) {
            sails.log.error(err);
            return res.json(500, Utils.getErrorPayload(err));
        }

        if (!user) {
            return res.json(500, Utils.getErrorPayload('Something went wrong'))
        }

        return res.json(201, Utils.getSuccessPayload('user', user));

    });
}