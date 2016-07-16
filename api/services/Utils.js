const Utils = {
    isNull: isNull,
    validateParams: validateParams,
    getErrorPayload: getErrorPayload,
    getSuccessPayload:getSuccessPayload
}

module.exports = Utils;

function isNull(obj) {
    return (obj === undefined || typeof obj === 'undefined' || obj === null);
}

function validateParams(req, paramsNames) {
    for (var i = 0; i < paramsNames.length; i++) {
        if (Utils.isNull(req.param(paramsNames[i]))) {
            return false;
        }
    }
    return true;
}

function getSuccessPayload(key, obj) {
    var payload = {
        status: 'success'
    };

    payload[key] = obj;
    return payload;
}

function getErrorPayload(err) {
    return {
        status: 'failed',
        message: err
    };
}