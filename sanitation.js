var moment = require('moment');
var config = require('./config');

/**
* Validates the API fields and required parameters.
* @method validator
* @param {Object} data The information received from the end user.
* @param {Object} validFields The fields which are valid.
* @param {Array} mandatoryFields The minimum fields which are expected.
* @param {Boolean} blankValue This defines if blank value is allowed for optional fields.
**/
function validator(data, validFields, mandatoryFields, blankValue) {
    var param = {}, undefinedParams = [], nullValues = [], blankParams = [], invalidValues = [];
    param.elements = {};
    param.response = {};
    param.success = true;
    function validateChildValues(key) {
        var stringValue;
        var arrValue;
        for(var i = 0; i < data[key].length; i++) {
            if(validFields[key][0] !== undefined && typeof(validFields[key][0]) !== typeof(data[key][i])) {
                param.response.errorMsg = "Parameter '" + key + "' value expected is '" + Object.prototype.toString.call(data[key]).slice(8, -1) + "' of an '" + Object.prototype.toString.call(validFields[key][0]).slice(8, -1) + "'";
                param.success = false;
            } else {
                arrValue = (validFields[key][0] !== undefined) ? validator(data[key][i], validFields[key][0], mandatoryFields, blankValue) : data[key][i];
                stringValue = (typeof(arrValue) === "string") ? true : false;
                if(!stringValue && (arrValue === null || !arrValue.success)) {
                    param.success = false;
                    var temp_resp = {};
                    temp_resp.errorMsg = "Invalid parameter value";
                    param.response = ((arrValue === null || arrValue.response === undefined || arrValue.response === null) ? temp_resp : arrValue.response);
                } else {
                    param.elements[key].push(stringValue ? arrValue : arrValue.elements);
                }
            }
            if(!param.success) {
                break;
            }
        }
    }
    for(var key in validFields) {
        if(data[key] === undefined) {
            if(mandatoryFields.indexOf(key) !== -1) {
                undefinedParams.push(key);
                param.success = false;
            }
        } else if(data[key] === null) {
            nullValues.push(key);
            param.success = false;
        } else if(typeof(data[key]) !== typeof(validFields[key]) || (typeof(validFields[key]) === "object" && validFields[key] instanceof Array !== data[key] instanceof Array)) {
            invalidValues.push(key);
            param.success = false;
        } else if (typeof(validFields[key]) === "object" && Object.keys(data[key]).length === 0) {
            blankParams.push(key);
            param.success = false;
        } else if (typeof(validFields[key]) === "object" && !(data[key] instanceof Array)) {
            param.elements[key] = {};
            var value = validator(data[key], validFields[key], mandatoryFields, blankValue);
            if(value.success) {
                param.elements[key] = value.elements;
            } else {
                param.success = false;
                param.response = value.response;
            }
        } else if (typeof(validFields[key]) === "object" && data[key] instanceof Array) {
            param.elements[key] = [];
            validateChildValues(key);
        } else if(typeof(validFields[key]) === "string" && data[key].trim() === "") {
            if(!!blankValue && mandatoryFields.indexOf(key) === -1) {
                param.elements[key] = data[key];
            } else {
                blankParams.push(key);
                param.success = false;
            }
        } else if(typeof(validFields[key]) === "number" && data[key] < 0) {
            param.success = false;
            param.response.errorMsg = "Parameter '" + key + "' value must have a positive number";
        } else {
            param.elements[key] = data[key];
        }
        if(!param.success) {
            delete param.elements;
            break;
        }
    }
    if(param.success) {
        delete param.response;
        return param;
    }
    if(undefinedParams.length !== 0) {
        param.response.errorMsg = "Parameter '" + undefinedParams.join(",") + "' required is missing";
        param.response.errorKey = undefinedParams;
    } else if(nullValues.length !== 0) {
        param.response.errorMsg = "Parameter '" + nullValues.join(",") + "' value cannot be null";
        param.response.errorKey = nullValues;
    } else if(invalidValues.length !== 0) {
        param.response.errorMsg = "Parameter '" + invalidValues.join(",") + "' value expected is " + "'" + Object.prototype.toString.call(validFields[invalidValues[0]]).slice(8, -1) + "'";
        param.response.errorKey = invalidValues;
    } else if(blankParams.length !== 0) {
        param.response.errorMsg = "Parameter '" + blankParams.join(",") + "' value passed is blank";
        param.response.errorKey = blankParams;
    }
    return param;
}

/**
* Validates the integer value and returns true for success.
* @method isInteger
* @param {String} value The string value to be tested.
**/
function isInteger(value) {
    return config.checkIntegerValue.test(value);
}

/**
* Validates the non-zero positive integer value and returns true for success.
* @method isPositiveInteger
* @param {Array} value The values to be tested.
**/
function isPositiveInteger(value) {
    var success = true;
    for(var i = 0; i < value.length; i++) {
        if(!config.checkIntegerValue.test(value[i]) || parseInt(value[i]) <= 0) {
            success = false;
            break;
        }
    }
    return success;
}

/**
* Validates the email format and returns true for success.
* @method isValidEmail
* @param {String} value The string value to be tested.
**/
function isValidEmail(value) {
    return config.emailPattern.test(value);
}

/**
* Extracts the last folder from the given folder path.
* @method lastFolderFromPath
* @param {String} folderPath The folder path.
**/
function lastFolderFromPath(folderPath) {
    return folderPath.match(config.folderPathPattern)[1];
}

/**
* Checks the YYYY-MM-DD date format along with valid date.
* @method isValidDate
* @param {String} dateString The date value to validate.
**/
function isValidDate(dateString) {
    if(!dateString.match(config.dateFormatPattern)) {
        return false;
    }
    if(!moment(dateString, 'YYYY-MM-DD').isValid()) {
        return false;
    }
    var d = new Date(dateString);
    return d.toISOString().slice(0,10) === dateString;
}

/**
* Returns the value of the nested object based on string path.
* @param {String} name The path of the nested object structure to fetch the value.
* @param {Object} context The original nested JSON object.
**/
function objValByStr(name, context) {
    var func, i, n, ns, _i, _len;
    if (!!name || !!context) {
        return null;
    }
    ns = name.split(".");
    func = context;
    for (i = _i = 0, _len = ns.length; _i < _len; i = ++_i) {
        n = ns[i];
        func = func[n];
    }
    return func;
}

module.exports.paramsValidator = validator;
module.exports.isInteger = isInteger;
module.exports.isPositiveInteger = isPositiveInteger;
module.exports.isValidEmail = isValidEmail;
module.exports.lastFolderFromPath = lastFolderFromPath;
module.exports.isValidDate = isValidDate;
module.exports.objValByStr = objValByStr;