const appRoot = require("app-root-path");
const AppLogger = require(appRoot + "/config/logger/appLogger");
// const config = require(appRoot + "/config/config");

// DAL requirement
const StudentDal = require("../dals/studentDal");

// Utility requirement
const StringUtil = require("../utils/stringUtil");
const ObjectUtil = require("../utils/objectUtil");

// Other Service requirement
const StudentService = require("./student-service");

// Models

// Error Handling
const ResponseObject = require("../base/ResponseObject");

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
        let verifiedMentionedStudentsEmails = [];
        const emailsMentioned = StringUtil.getEmailMentionsFromText(notificationText);
        if (emailsMentioned && emailsMentioned.length) {
            const verifiedMentionedStudents = await StudentDal.getStudentsByEmails(emailsMentioned, false);
            if (verifiedMentionedStudents.length) {
                verifiedMentionedStudentsEmails = verifiedMentionedStudents.map(student => {
                    return student.email;
                });
            }
        }

        // Retrieve unsuspended students of a teacher
        let teacherUnsuspendedStudentsEmails = [];
        const unsuspendedStudents = await StudentDal.getStudentsByTeacherEmail(teacherEmail, false);
        teacherUnsuspendedStudentsEmails = unsuspendedStudents.map(student => {
            return student.email;
        });

        // Combine all students emails (remove duplicate)
        respBody.recipients = ObjectUtil.removeDuplicateFromArray(verifiedMentionedStudentsEmails.concat(teacherUnsuspendedStudentsEmails));

    } catch (err) {
        return new ResponseObject(err);
    }

    return new ResponseObject(respBody);
}
