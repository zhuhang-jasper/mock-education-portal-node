/* --------------------- */
/* Utility : Date Time */
/* --------------------- */
const moment = require("moment");

module.exports = {
    checkDateFormat
};

/**
 * Check if input date follows the specified format
 * @param dateStr (string) date to be checked
 * @param format (string) date format to check with
 * @return (boolean) true = pass validation
 */
function checkDateFormat(dateStr = "", format = "YYYY-MM-DD") {

    if (dateStr == null || dateStr.trim().length == 0) {
        return false;
    }
    const momDate = moment(dateStr, format, true);

    return momDate.isValid();
}
