const NumberUtil = require("../utils/numberUtil");

const errorCode = {

    /* CTI JWT/AUTHENTICATION ERRORS : 2XX */
    CREDENTIALS_REQUIRED: {
        code: "200",
        message: "No authorization token was found."
    },
    ACCESS_TOKEN_EXPIRED: {
        code: "201",
        message: "The authorization token has expired. Please relogin."
    },
    INVALID_ACCESS_TOKEN: {
        code: "202",
        message: "The authorization token is invalid. Malformed token."
    },
    UNAUTHORISED_ACCESS: {
        code: "210",
        message: "User is unauthorised to perform this action."
    },

    /* CTI REQUEST ERRORS / 1ST LEVEL VALIDATION : 3XX */
    INVALID_REQUEST_PARAMETER: {
        code: "300",
        message: "Input Validation Error: Invalid parameter"
    },

    /* SERVER/INFRA/DB ERRORS : 4XX */
    UNKNOWN_EXCEPTION: {
        code: "400",
        message: "Unknown Exception Occured"
    },
    TIME_OUT: {
        code: "401",
        message: "Server Timeout Error"
    },
    // SERVICE_NOT_AVAILABLE: {
    //     code: "???",
    //     message: "System is currently under maintenance"
    // },
    DB_MYSQL_CONNECTION_GET_FAILED: {
        code: "450",
        message: "Failed to get MySQL database connection. See log."
    },
    DB_MYSQL_QUERY_EXECUTE: {
        code: "460",
        message: "Error occured when performing MySQL query."
    },

    /* APPLICATION ERRORS / INTERNAL : 5XX */
    ERR_UNCAUGHT_EXCEPTION: {
        code: "500",
        message: "Unexpected exception in application"
    },

    /* POSITIVE ERROR MESSAGES : 100 */
    // INVALID_LOGIN_CREDENTIALS: {
    //     code: "100",
    //     message: "Invalid Username or Password"
    // },

    /**
     * Return HTTP status code with the closest meaning as the provided error code
     * (*Just for reference, Do not use as API response*)
        * * 5001xx ~ HTTP 200,
        * * 5002xx ~ HTTP 401/403,
        * * 5003xx ~ HTTP 400,
        * * others ~ HTTP 500
        @param errorCode the error code
     */
    getEquivalentStatusCodeFromErrorCode: function (errorCode) {
        errorCode = String(errorCode);
        if (NumberUtil.isNumeric(errorCode) && errorCode.startsWith("500")) {
            const code = errorCode.substring(3, errorCode.length - 1); // remove prefix 500
            if (code.startsWith("1")) {
                return 200;
            } else if (code.startsWith("2")) {
                return 401; // 403
            } else if (code.startsWith("3")) {
                return 400;
            } else {
                return 500;
            }
        }
        return null;
    }
};

module.exports = errorCode;
