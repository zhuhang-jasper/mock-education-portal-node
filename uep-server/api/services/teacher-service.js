const appRoot = require("app-root-path");
const AppLogger = require(appRoot + "/config/logger/appLogger");
// const config = require(appRoot + "/config/config");

// DAL requirement
const StudentDal = require("../dals/studentDal");
const TeacherDal = require("../dals/teacherDal");
const TeacherStudentDal = require("../dals/teacherStudentDal");

// Utility requirement

// Other Service requirement
// const StudentService = require("./student-service");

// Models
const Teacher = require("../models/teacher");
const Student = require("../models/student");
const TeacherStudent = require("../models/teacherStudent");

// Error Handling
const ResponseObject = require("../base/ResponseObject");

module.exports = {
    registerStudents
};

const IDENTIFIER = "TeacherService";
function logService(str) {
    AppLogger.debug(`Calling ${IDENTIFIER}->${str}()...`);
}

/**
 * Register students to a specified teacher
 * @param {string} teacherEmail teacher email address
 * @param {string[]} studentEmails array of student email addresses
 */
async function registerStudents(teacherEmail = null, studentEmails = []) {
    logService("registerStudents");

    const respBody = {
        teacher: teacherEmail,
        registeredStudents: studentEmails.length
    };

    try {
        /** @type {TeacherStudent[]} */
        const teacherStudentLinks = [];

        // Get/Create teacher
        const teacher = await TeacherDal.createAndReturnTeacher(teacherEmail);

        // Get/Create students
        /** @type Student[] */
        const students = [];
        if (teacher && studentEmails.length) {
            for (const studentEmail of studentEmails) {
                const student = await StudentDal.createAndReturnStudent(studentEmail);
                students.push(student);

                // Create teacher-student link
                teacherStudentLinks.push(new TeacherStudent(teacher.id, student.id));
            }
        }

        // Create Teacher-Student Links
        const insertedTeacherStudentLinks = await TeacherStudentDal.createTeacherStudentLinks(teacherStudentLinks);
        // if (createTeacherStudentLinksResp.hasError()) {
        //     throw createTeacherStudentLinksResp.customError;
        // } else {
        //     respBody.registeredStudents = createTeacherStudentLinksResp.body.insertedCount;
        // }

    } catch (err) {
        return new ResponseObject(err);
    }

    return new ResponseObject(respBody);
}
