/* --------------------- */
/* Utility : String    */
/* --------------------- */

module.exports = { isNotEmptyOrNull, returnEmptyStringIfNull, equalsIgnoreCase, getEmailMentionsFromText };

/**
 * Check if string is null or empty
 * @param value (any) value to be checked
 * @return (boolean) true = pass validation
 */
function isNotEmptyOrNull(value) {

    if (value != null && value != undefined && value.toString().trim().length) {
        return true;
    }
    return false;
}

/**
 * Check if string and int value is null or empty
 * @param value (string/int) value to be checked
 * @return empty string if is null value
 */
function returnEmptyStringIfNull(value) {

    if (Boolean(value) && value !== null && value !== undefined) {
        return value;
    }
    return "";
}

function equalsIgnoreCase(str1 = "", str2 = "") {
    if (str1 && str2) {
        if (str1.toLowerCase() == str2.toLowerCase()) {
            return true;
        }
    }
}

/**
 * Get list of emails mentioned in text after '@' character
 * @param {string} text the text
 * @returns {string[]} array of emails
 */
function getEmailMentionsFromText(text = "") {
    const emailMentionRegex = /@(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g;

    if (text) {
        const mentions = text.match(emailMentionRegex);
        if (mentions && mentions.length) {
            const emails = mentions.map(mentions => {
                return mentions.trim().substr(1); // remove '@' character
            });
            return emails;
        }
    }
    return [];
}
