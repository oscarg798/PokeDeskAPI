/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        username: {
            type: 'string',
            required: true,
            unique:true
        },
        password: {
            type: 'string',
            required: true
        },passwordConfirmation: {
            type: 'string',
            required: true
        },
        encryptedPassword: {
            type: 'string'
        },
        email: {
            type: 'email',
            required: true,
            unique:true
        },
        lat:{
            type:''
        },
        toJSON: function() {
            var obj = this.toObject();
            delete obj.password;
            delete obj.passwordConfirmation;
            delete obj._csrf;
            delete obj.encryptedPassword;
            return obj;

        }
    },
    beforeCreate: function(values, next) {
        var password = values.password;
        var passwordConfirmation = values.passwordConfirmation;

        require('bcrypt').hash(values.password, 1024,
            function(err, encryptedPassword) {
                values.password = null;
                values.passwordConfirmation = null;
                values.encryptedPassword = encryptedPassword;

                next();
            });
    }
};