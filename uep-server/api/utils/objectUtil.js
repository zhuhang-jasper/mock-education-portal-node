/* --------------------- */
/* Utility : Object    */
/* --------------------- */

module.exports = { isObject, mergeDeep, isEmpty, isFunction, traverseDeep, removeUndefinedProperties, isCyclic, makeHtmlFriendly, maskedProperties, truncateArray, removeDuplicateFromArray };

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
    return (item && typeof item === "object" && !Array.isArray(item));
}

/**
 * Simple object check if empty.
 * @param obj
 * @returns {boolean}
 */
function isEmpty(obj = null) {
    return (obj == null || (Object.keys(obj).length === 0 && obj.constructor === Object));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target, ...sources) {
    if (!sources.length) { return target; }
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) { Object.assign(target, { [key]: {} }); }
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

/**
 * Check if object is a function
 * @param functionToCheck An object
 */
function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === "[object Function]";
}

/**
 * Check if object is circular
 * @param obj The object to be checked
 */
function isCyclic(obj) {
    // var seenObjects = [];

    function detect(obj) {
        try {
            if (obj && typeof obj === "object") {
                JSON.stringify(obj);
            }
        } catch (err) {
            // is JSON cyclic object
            if (err.message.includes("circular")) {
                return true;
            }
        }
        return false;
    }

    // function detect(obj) {
    //     if (obj && typeof obj === 'object') {
    //         if (seenObjects.indexOf(obj) !== -1) {
    //             return true;
    //         }
    //         seenObjects.push(obj);
    //         for (var key in obj) {
    //             if (Object.prototype.hasOwnProperty.call(obj, key) && detect(obj[key])) {
    //                 //   console.log(obj, 'cycle at ' + key);
    //                 return true;
    //             }
    //         }
    //     }
    //     return false;
    // }

    return detect(obj);
}

/**
 * Deep Traverse through object/array to replace
 * value if passes the decider function
 * @param object Object to be tested
 * @param decider Function that returns boolean
 * @param newValue Value to replace / length of array to be truncated to (if deepArray == true)
 * @param deepArray Boolean to traverse array deeply
 */
function traverseDeep(object, decider, newValue = "", deepArray = false) {

    if (!isFunction(decider) || !newValue) {
        return;
    }

    if (deepArray && Array.isArray(object)) {
        for (let item of object) {
            // recursive
            if (traverseDeep(item, decider, newValue, deepArray)) {
                item = newValue;
            }
        }
    } else if (typeof object === "object" && !Array.isArray(object)) {
        for (const key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key)) {
                // recursive
                if (traverseDeep(object[key], decider, newValue, deepArray)) {
                    if (Array.isArray(object[key])) {
                        // truncate if array
                        object[key] = truncateArray(object[key], newValue);
                    } else {
                        // replace value if others
                        object[key] = newValue;
                    }
                }
            }
        }
    } else {
        if (decider(object)) {
            return true;
        }
        return false;
    }
}

function truncateArray(array, newSize) {
    if (Array.isArray(array) && parseInt(newSize)) {
        const actualLength = array.length;
        const remainingLength = actualLength - parseInt(newSize);
        array.splice(parseInt(newSize));
        array.push("[TRUNC] ... and other " + remainingLength + " items");
        return array;
    }
    return array;
}

function removeUndefinedProperties(object) {
    for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            if (object[key] === undefined) {
                delete object[key];
            }
        }
    }
    return object;
}

// HTML friendly - @author zhuhang.jasper
function makeHtmlFriendly(content) {
    if (isObject(content)) {
        content = JSON.stringify(content, null, 2);
    }
    if (content) {
        return "&emsp;" + content.replace(/\n/g, "<BR>&emsp;");
    } else {
        return "";
    }
}

// Mask all properties inside an object
function maskedProperties(object) {
    const masked = JSON.parse(JSON.stringify(object)); // clone
    for (const key in masked) {
        if (Object.prototype.hasOwnProperty.call(masked, key)) {
            masked[key] = "***";
        }
    }
    return masked;
}

/**
 * Returns an array with duplicate elements removed
 * @param {string[]} arr array of strings
 */
function removeDuplicateFromArray(arr) {
    const seen = {};
    return arr.filter(function(item) {
        return Object.prototype.hasOwnProperty.call(seen, item) ? false : (seen[item] = true);
    });
}
