"use strict";
const appRoot = require("app-root-path");
const AppLogger = require(appRoot + "/config/logger/appLogger");
const config = require(appRoot + "/config/config");

const CustomError = require("./CustomError");
const ResponseObject = require("./ResponseObject");

const ObjectUtil = require("../utils/objectUtil");
// const Validator = require("../utils/validator");
// const EnvUtil = require("../utils/envUtil");
// const moment = require("moment");

// const StatusCode = require("../constants/responseStatusCode");
const ErrorCode = require("../constants/responseErrorCode");

const excludeLoggingPath = [""];

// function getRequestId() {
//     const httpContext = require("express-http-context");
//     return httpContext.get("reqId");
// }

/* Empty Error Response Template */
const emptyApiErrorResponse = {
    // reqId: "",
    // statusCode: StatusCode.FAILED.code,
    message: "",
    error: {
        errorCode: ErrorCode.UNKNOWN_EXCEPTION.code,
        errorMessage: ErrorCode.UNKNOWN_EXCEPTION.message
    }
};

/* Empty Success Response Template */
const emptyApiSuccessResponse = {
    // reqId: "",
    // statusCode: StatusCode.SUCCESS.code,
    // message: ""
};

/**
 * Wraps Error into API Response Structure (using CustomError constructor)
 * @param error The throwable error object
 */
function getErrorResponse(error = null) {

    // var httpStatus = 500;
    const customError = new CustomError(error);
    const httpStatus = customError.statusCode;
    const resp = ObjectUtil.mergeDeep({}, emptyApiErrorResponse);
    // resp.reqId = getRequestId();
    resp.message = customError.message;
    resp.error = {
        errorCode: customError.errorCode,
        errorMessage: customError.errorMessage
    };
    // resp.actualError = customError.actualError || undefined;

    return { statusCode: httpStatus, response: resp };
}

/* API Respond Helper Functions */
function respond(responder, successStatus = 200, responseObject = null) {
    // if (!responseObject) {
    //     throw new Error("BaseController: Potential developer mistake. No responseObject given");
    // } else
    if (!responder) {
        throw new Error("BaseController: Potential developer mistake. No swagger responder given");
    }
    if (responseObject instanceof ResponseObject) {
        if (responseObject.hasError()) {
            respondAndLogError(responder, responseObject.customError);
        } else {
            respondSuccessBody(responder, successStatus, responseObject.body);
        }
    } else if (responseObject instanceof Error) {
        respondAndLogError(responder, responseObject);
    } else {
        respondSuccessBody(responder, successStatus, responseObject);
    }
}

function respondSuccessBody(responder, successStatus = 200, responseBody = null) {
    // if (!responseBody) {
    //     throw new Error("BaseController: Potential developer mistake. No responseBody given");
    // } else
    if (!responder) {
        throw new Error("BaseController: Potential developer mistake. No swagger responder given");
    }
    const resp = emptyApiSuccessResponse;
    // resp.reqId = getRequestId();
    // resp.statusCode = StatusCode.SUCCESS.code;
    // if (!ObjectUtil.isEmpty(responseBody)) {
    //     resp.body = responseBody;
    // }
    sendApiResponse(responder, successStatus, Object.assign({}, resp, responseBody));
}

function respondAndLogError(responder, errorObject) {
    if (!errorObject) {
        throw new Error("BaseController: Potential developer mistake. No errorObject given");
    } else if (!responder) {
        throw new Error("BaseController: Potential developer mistake. No swagger responder given");
    }
    errorObject = new CustomError(errorObject);
    const errResp = getErrorResponse(errorObject);
    logErrorStack(errorObject);

    // sendEmail(errorObject, responder);

    sendApiResponse(responder, errResp.statusCode, errResp.response);
}

function sendApiResponse(responder, statusCode, response = null) {
    // if (!response) {
    //     throw new Error("BaseController: Potential developer mistake. No response given");
    // } else
    if (!statusCode) {
        throw new Error("BaseController: Potential developer mistake. No statusCode given");
    } else if (!responder) {
        throw new Error("BaseController: Potential developer mistake. No swagger responder given");
    }
    // Log All Response
    if (config.log.logAllResponses == 1) {
        logResponse(response);
    }
    responder.status(statusCode).json(response);
}

/* API Log Helper Functions */

function getRequestBody(req) {
    const queryBody = req.query || {}; // GET requests
    const reqBody = req.body || {}; // POST,PUT,DELETE requests
    const requestInfo = {
        // logType: 'REQUEST',
        // reqId: req.reqId,
        client_ip: req.ip,
        client_remoteAddress: req.connection.remoteAddress,
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: {}
    };
    if (Object.keys(queryBody).length) {
        requestInfo.body = Object.assign({}, queryBody);
    } else if (Object.keys(reqBody).length) {
        requestInfo.body = Object.assign({}, reqBody);
    }

    // Mask sensitive info
    if (excludeLoggingPath.indexOf(requestInfo.url) != -1) {
        requestInfo.body = ObjectUtil.maskedProperties(requestInfo.body);
    }
    return requestInfo;
}

function logRequest(req) {
    if (req) {
        let requestInfo = getRequestBody(req);
        requestInfo = Object.assign({ logType: "REQUEST" }, requestInfo);
        AppLogger.info(requestInfo);
    }
}

function logResponse(response) {
    if (response) {
        const responseInfo = Object.assign({ logType: "RESPONSE" }, response);
        delete responseInfo.reqId;
        AppLogger.info(responseInfo);
    }
}

function logErrorStack(error) {
    if (error instanceof CustomError) {
        AppLogger.error(error.toLoggable());
        if (error.actualStack) {
            AppLogger.error(error.actualStack);
        }
    } else if (error instanceof Error) {
        AppLogger.error(error.stack);
    }
}

function respondQueryResults(responder, serviceResponse, pageSize, currentPage = 1) {
    let totalRecord = 0;
    const queryResult = serviceResponse.body.result;
    if (queryResult.length) {
        totalRecord = queryResult[0].TotalRecord;
        queryResult.forEach(result => delete result.TotalRecord);
    }
    const responseObj = {
        sort: serviceResponse.body.sort,
        totalRecord: totalRecord,
        totalPages: pageSize ? Math.ceil(totalRecord / pageSize) : 1,
        currentPage: currentPage,
        pageSize: pageSize,
        result: queryResult
    };
    respond(responder, 200, responseObj);
}

module.exports = {
    respond,
    respondQueryResults,
    respondAndLogError,
    respondSuccessBody,
    logResponse,
    logErrorStack,
    logRequest
};
