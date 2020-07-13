const appRoot = require("app-root-path");
const AppLogger = require(appRoot + "/config/logger/appLogger");
// const config = require(appRoot + "/config/config");

// DAL requirement
const StudentDal = require("../dals/studentDal");

// Utility requirement

// Other Service requirement

// Models
const Student = require("../models/student");

// Error Handling
const ResponseObject = require("../base/ResponseObject");

module.exports = {
    suspendStudent,
    retrieveUnsuspendedStudentsOfTeacher,
    retrieveStudentsCommonToTeachers
};

const IDENTIFIER = "StudentService";
function logService(str) {
    AppLogger.debug(`Calling ${IDENTIFIER}->${str}()...`);
}

/**
 * Retrieve list of students with common teachers
 * @param {string[]} teacherEmails array of teacher email addresses
 */
async function retrieveStudentsCommonToTeachers(teacherEmails = []) {
    logService("retrieveStudentsCommonToTeachers");

    const respBody = {
        teachers: teacherEmails,
        students: []
    };

    try {
        // Query
        const commonStudents = await StudentDal.getStudentsByCommonTeacherEmails(teacherEmails);

        // Return only email address
        respBody.students = commonStudents.map(student => {
            return student.email;
        });

    } catch (err) {
        return new ResponseObject(err);
    }

    return new ResponseObject(respBody);
}

/**
 * Suspend a student
 * @param {string} studentEmail student email address
 */
async function suspendStudent(studentEmail = null) {
    logService("suspendStudent");

    const respBody = {
        suspendedStudents: 1
    };

    try {

        // Get/Create student
        const student = await StudentDal.createAndReturnStudent(studentEmail);

        // Set isSuspended to true
        student.isSuspended = true;

        // Update
        const updatedStudent = await StudentDal.updateStudent(student);
        // if (updateStudentResp.hasError()) {
        //     throw updateStudentResp.customError;
        // } else {
        //     respBody.suspendedStudents = updateStudentResp.body.updatedCount;
        // }

    } catch (err) {
        return new ResponseObject(err);
    }

    return new ResponseObject(respBody);
}

/**
 * Retrieve list of unsuspended students of a given teacher
 * @param {string} teacherEmail teacher email address
 */
async function retrieveUnsuspendedStudentsOfTeacher(teacherEmail = null) {
    logService("retrieveUnsuspendedStudentsOfTeacher");

    const respBody = {
        teacher: teacherEmail,
        students: []
    };

    try {
        // Query
        const unsuspendedStudents = await StudentDal.getStudentsByTeacherEmail(teacherEmail, false);

        // Return only email address
        respBody.students = unsuspendedStudents.map(student => {
            return student.email;
        });

    } catch (err) {
        return new ResponseObject(err);
    }

    return new ResponseObject(respBody);
}
