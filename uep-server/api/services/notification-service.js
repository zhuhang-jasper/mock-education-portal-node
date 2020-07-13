const appRoot = require("app-root-path");
const AppLogger = require(appRoot + "/config/logger/appLogger");
const config = require(appRoot + "/config/config");

// DB requirement
// const mysql = require("../../config/db").mysql;

// Utility requirement
// const moment = require("moment");
const StringUtil = require("../utils/stringUtil");
const ObjectUtil = require("../utils/objectUtil");
// const DalUtil = require("../utils/dalUtil");
// const NumberUtil = require("../utils/numberUtil");

// Other Service requirement
const StudentService = require("./student-service");

// Constants
// const Teacher = require("../models/teacher");
// const Student = require("../models/student");
// const Notification = require("../models/notification");
// const TeacherStudent = require("../models/teacherStudent");

// Error Handling
const ResponseObject = require("../base/ResponseObject");
// const CustomError = require("../base/CustomError");
// const ErrorCode = require('../constants/responseErrorCode');

module.exports = {
    retrieveRecipientsForNotification
};

// Database Table Names

const IDENTIFIER = "NotificationService";
function logService(str) {
    AppLogger.debug(`Calling ${IDENTIFIER}->${str}()...`);
}

/**
 * Retrieve list of students who can receive the notification
 * @param {string} teacherEmail teacher email address
 * @param {string} notificationText notification text
 * @returns student emails
 */
async function retrieveRecipientsForNotification(teacherEmail = null, notificationText = null) {
    logService("retrieveRecipientsForNotification");

    const respBody = {
        teacher: teacherEmail,
        recipients: []
    };

    try {
        // Identify emails mentioned in the text, and verify student exists
        let verifiedStudentsMentionedEmails = [];
        const emailsMentioned = StringUtil.getEmailMentionsFromText(notificationText);
        if (emailsMentioned && emailsMentioned.length) {
            const verifiedStudentsMentioned = await StudentService.getStudentsByEmails(emailsMentioned);
            if (verifiedStudentsMentioned.length) {
                verifiedStudentsMentionedEmails = verifiedStudentsMentioned.map(student => {
                    return student.email;
                });
            }
        }

        // Retrieve unsuspended students of a teacher
        let teacherUnsuspendedStudents = [];
        const getStudentsResp = await StudentService.retrieveUnsuspendedStudentsOfTeacher(teacherEmail);
        if (getStudentsResp.hasError()) {
            throw getStudentsResp.customError;
        }
        teacherUnsuspendedStudents = getStudentsResp.body.students;

        // Combine all students emails (remove duplicate)
        respBody.recipients = ObjectUtil.removeDuplicateFromArray(verifiedStudentsMentionedEmails.concat(teacherUnsuspendedStudents));

    } catch (err) {
        return new ResponseObject(err);
    }

    return new ResponseObject(respBody);
}
