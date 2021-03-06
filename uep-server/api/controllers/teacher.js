const appRoot = require("app-root-path");
const AppLogger = require(appRoot + "/config/logger/appLogger");
const BaseController = require("../base/baseController");

// Utility requirement
const ParamValidator = require("../utils/validator");

// Other Service requirement
const TeacherService = require("../services/teacher-service");
const StudentService = require("../services/student-service");
const NotificationService = require("../services/notification-service");

// Constants

module.exports = {
    registerStudents,
    getCommonStudents,
    suspendStudent,
    getNotificationRecipients
};

const IDENTIFIER = "TeacherController";
function logController(str) {
    AppLogger.debug(`Calling ${IDENTIFIER}->${str}()...`);
}

async function registerStudents(req, res) {
    logController("registerStudents");

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
            students: serviceResponse.body.students
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

async function getNotificationRecipients(req, res) {
    logController("getNotificationRecipients");

    try {
        // Validate Query Parameters
        const validatorResponse = ParamValidator.validateParams(
            req.body, // GET:req.query | POST:req.body
            {
                teacher: { type: "string", required: true },
                notification: { type: "string", required: false }
            },
            null // GET:null | POST:null
        );
        if (validatorResponse.errObj != null) {
            throw validatorResponse.errObj;
        }

        // Prepare request params
        const teacherEmail = req.body.teacher;
        const notificationText = req.body.notification;

        // Pull results from database
        const serviceResponse = await NotificationService.retrieveRecipientsForNotification(teacherEmail, notificationText);
        if (serviceResponse.hasError()) {
            throw serviceResponse.customError;
        }

        const responseObj = {
            recipients: serviceResponse.body.recipients
        };

        BaseController.respond(res, 200, responseObj);

    } catch (err) {
        BaseController.respondAndLogError(res, err);
    }
}
