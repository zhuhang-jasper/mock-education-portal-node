const appRoot = require("app-root-path");
const AppLogger = require(appRoot + "/config/logger/appLogger");
const BaseController = require("../base/baseController");

// Utility requirement
const ParamValidator = require("../utils/validator");
// const NumberUtil = require("../utils/numberUtil");
// const StringUtil = require("../utils/stringUtil");
// const ObjectUtil = require("../utils/objectUtil");
// const moment = require('moment');

// Other Service requirement
const TeacherService = require("../services/teacher-service");
const StudentService = require("../services/student-service");

// Constants

// Error Handling
// const ErrorCode = require('../constants/responseErrorCode');
// const CustomError = require('../base/CustomError');
// const ResponseObject = require('../base/ResponseObject');

module.exports = {
    registerStudent,
    getCommonStudents,
    suspendStudent
};

const IDENTIFIER = "TeacherController";
function logController(str) {
    AppLogger.debug(`Calling ${IDENTIFIER}->${str}()...`);
}

async function registerStudent(req, res) {
    logController("registerStudent");

    try {
        // Validate Query Parameters
        const validatorResponse = ParamValidator.validateParams(
            req.body, // GET:req.query | POST:req.body
            {
                teacher: { type: "string", required: true },
                students: { type: "array", required: true }
            },
            null // GET:'value' | POST:null
        );
        if (validatorResponse.errObj != null) {
            throw validatorResponse.errObj;
        }

        // Prepare request params
        const teacher = req.body.teacher;
        const students = req.body.students;
        if (!students.length) {
            throw new Error("Students cannot be empty.");
        }

        // Pull results from database
        const serviceResponse = await TeacherService.registerStudents(teacher, students);
        if (serviceResponse.hasError()) {
            throw serviceResponse.customError;
        }

        const responseObj = {
            // body: serviceResponse.body
        };

        BaseController.respond(res, 204, responseObj);

    } catch (err) {
        BaseController.respondAndLogError(res, err);
    }
}

async function getCommonStudents(req, res) {
    logController("getCommonStudents");

    try {
        // Validate Query Parameters
        const validatorResponse = ParamValidator.validateParams(
            req.query, // GET:req.query | POST:req.body
            {
                teacher: { type: ["array", "string"], required: true }
            },
            null // GET:null | POST:null
        );
        if (validatorResponse.errObj != null) {
            throw validatorResponse.errObj;
        }

        // Prepare request params
        let teachers = req.query.teacher;
        if (!Array.isArray(teachers)) {
            // If emails are in comma delimited string
            teachers = String(teachers).trim().split(",");
        }

        // Pull results from database
        const serviceResponse = await StudentService.retrieveStudentsCommonToTeachers(teachers);
        if (serviceResponse.hasError()) {
            throw serviceResponse.customError;
        }

        const responseObj = {
            students: serviceResponse.body.students.map(student => {
                return student.email;
            })
        };

        BaseController.respond(res, 200, responseObj);

    } catch (err) {
        BaseController.respondAndLogError(res, err);
    }
}

async function suspendStudent(req, res) {
    logController("suspendStudent");

    try {
        // Validate Query Parameters
        const validatorResponse = ParamValidator.validateParams(
            req.body, // GET:req.query | POST:req.body
            {
                student: { type: "string", required: true }
            },
            null // GET:'value' | POST:null
        );
        if (validatorResponse.errObj != null) {
            throw validatorResponse.errObj;
        }

        // Prepare request params
        const studentEmail = req.body.student;

        // Pull results from database
        const serviceResponse = await StudentService.suspendStudent(studentEmail);
        if (serviceResponse.hasError()) {
            throw serviceResponse.customError;
        }

        const responseObj = {
            // body: serviceResponse.body
        };

        BaseController.respond(res, 204, responseObj);

    } catch (err) {
        BaseController.respondAndLogError(res, err);
    }
}
