/**
 * Pokemon.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        number: {
            type: 'String'
        },
        name: {
            type: 'String',
            required: true,
            unique: true
        },
        attacks: {
            type: 'array'
        },
        type: {
            type: 'String',
            required: true
        },
        image: {
            type: 'String',
        },
        weaknesses: {
            type: 'array'
        },
        evolutions: {
            type: 'array'
        },
        pre_evolutions: {
            type: 'array'
        },
        height: {
            type: 'String'
        },
        weight: {
            type: 'String'
        }
    }
};