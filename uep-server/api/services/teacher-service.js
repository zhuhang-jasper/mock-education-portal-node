const appRoot = require("app-root-path");
const AppLogger = require(appRoot + "/config/logger/appLogger");
const config = require(appRoot + "/config/config");

// DB requirement
const mysql = require("../../config/db").mysql;

// Utility requirement
const moment = require("moment");
// const DalUtil = require("../utils/dalUtil");
// const ObjectUtil = require("../utils/objectUtil");
// const NumberUtil = require("../utils/numberUtil");
// const StringUtil = require("../utils/stringUtil");

// Other Service requirement
const StudentService = require("./student-service");

// Constants
const Teacher = require("../models/teacher");
const Student = require("../models/student");
const TeacherStudent = require("../models/teacherStudent");

// Error Handling
const ResponseObject = require("../base/ResponseObject");
// const CustomError = require("../base/CustomError");
// const ErrorCode = require('../constants/responseErrorCode');

module.exports = {
    createAndReturnTeacher,
    getTeacherByEmail,
    registerStudents
};

// Database Table Names
const teacherTable = "teacher"; // t
const teacherStudentTable = "teacher_student"; // ts

const IDENTIFIER = "TeacherService";
function logService(str) {
    AppLogger.debug(`Calling ${IDENTIFIER}->${str}()...`);
}

/**
 * Create teacher if not exists, else returns teacher from database
 * @param {string} email teacher's email address
 * @param {*} connection MySQL connection
 * @returns {Teacher} teacher model
 */
async function createAndReturnTeacher(email = null, connection = null) {
    logService("createAndReturnTeacher");

    if (email) {
        // Check if student exists
        const dbTeacher = await getTeacherByEmail(email);
        if (!dbTeacher) {
            const createNewTeacherResp = await createTeacher(new Teacher(email));
            if (createNewTeacherResp.hasError()) {
                throw createNewTeacherResp.customError;
            } else {
                return createNewTeacherResp.body.teacher;
            }
        } else {
            return dbTeacher;
        }
    } else {
        throw new Error("Teacher email not specified");
    }
}

/**
 * Get one teacher by email address
 * @param {string} email teacher's email address
 * @throws Errors
 * @returns {Teacher|null} teacher model or null
 */
async function getTeacherByEmail(email = null) {
    logService("getTeacherByEmail");

    // Prepare SQL statement
    const selectors = " t.id, " +
        " t.email, " +
        " t.firstName, " +
        " t.lastName, " +
        " t.status, " +
        " t.createdBy, " +
        " t.createdDate, " +
        " t.updatedBy, " +
        " t.updatedDate ";
    const sql = ` SELECT ${selectors} ` +
        ` FROM ${teacherTable} t ` +
        " WHERE email = ? ";

    // Prepare SQL params
    const params = [email];

    // prepare query params
    let sqlResult = null;
    if (email) {
        const sqlResultTemp = await mysql.executeQuery(sql, params);
        if (sqlResultTemp.length) {
            const raw = sqlResultTemp[0];
            sqlResult = new Teacher(raw.email);
            sqlResult.id = raw.id;
            sqlResult.firstName = raw.firstName;
            sqlResult.lastName = raw.lastName;
            sqlResult.status = raw.status;
            sqlResult.createdBy = raw.createdBy;
            sqlResult.createdDate = raw.createdDate ? moment(raw.createdDate) : undefined;
            sqlResult.updatedBy = raw.updatedBy;
            sqlResult.updatedDate = raw.updatedDate ? moment(raw.updatedDate) : undefined;
        }
    }
    const singleResult = sqlResult;
    return singleResult;
}

/**
 * Insert teacher into database
 * @param {Teacher} teacher teacher model
 * @param {*} connection MySQL connection
 */
async function createTeacher(teacher = null, connection = null) {
    logService("createTeacher");

    const respBody = {
        insertId: null,
        insertedCount: 0,
        teacher: null
    };

    // Prepare DB Connection
    let localConnection = connection;
    if (!connection) {
        localConnection = await mysql.getConn();
        await localConnection.beginTransaction();
    }

    try {
        // Prepare SQL statement
        const sql = `INSERT INTO ${teacherTable} SET ? `;

        if (teacher) {
            // Prepare SQL params
            const jsonModel = teacher.toJSONObject();
            jsonModel.createdBy = config.db.mysql.user;
            const params = [jsonModel];

            // Execute SQL
            const sqlInsertResult = await mysql.executeQuery(sql, params, localConnection);
            if (sqlInsertResult.affectedRows) {
                // Setup Success Response Object
                respBody.insertId = sqlInsertResult.insertId;
                respBody.insertedCount = sqlInsertResult.affectedRows;
                teacher.id = sqlInsertResult.insertId;
                respBody.teacher = teacher;
            } else {
                throw new Error("No record inserted.");
            }
        }
    } catch (err) {
        if (!connection) {
            AppLogger.error(err.stack);
            await mysql.rollbackAndRelease(localConnection);
        }
        return new ResponseObject(err);
    }

    // commit records if everything is working
    if (!connection) {
        await mysql.commitAndRelease(localConnection);
    }

    return new ResponseObject(respBody);
}

/**
 * Insert teacher-student link into database
 * @param {TeacherStudent[]} teacherStudentLinks teacher-student model array
 * @param {*} connection MySQL connection
 */
async function createTeacherStudentLinks(teacherStudentLinks = [], connection = null) {
    logService("createTeacherStudentLinks");

    const respBody = {
        insertedCount: 0
    };

    // Prepare DB Connection
    let localConnection = connection;
    if (!connection) {
        localConnection = await mysql.getConn();
        await localConnection.beginTransaction();
    }

    try {
        // Prepare SQL statement
        const sql = `INSERT INTO ${teacherStudentTable} ` +
        " (TeacherId, StudentId, Status, CreatedBy) " +
        " VALUES ? " +
        ` ON DUPLICATE KEY UPDATE status='ACTIVE', updatedBy='${config.db.mysql.user}' , updatedDate=CURRENT_TIMESTAMP() `;

        if (Array.isArray(teacherStudentLinks) && teacherStudentLinks.length) {
            // Prepare SQL params
            const arrayModel = teacherStudentLinks.map(tsLink => {
                return tsLink.toArrayValues("teacherId", "studentId", "status", "createdBy");
            });
            const params = [arrayModel];

            // Execute SQL
            const sqlInsertResult = await mysql.executeQuery(sql, params, localConnection);
            // console.log(sqlInsertResult);
            if (sqlInsertResult.affectedRows) {
                // Setup Success Response Object
                respBody.insertedCount = sqlInsertResult.affectedRows;
            }
        }
    } catch (err) {
        if (!connection) {
            AppLogger.error(err.stack);
            await mysql.rollbackAndRelease(localConnection);
        }
        return new ResponseObject(err);
    }

    // commit records if everything is working
    if (!connection) {
        await mysql.commitAndRelease(localConnection);
    }

    return new ResponseObject(respBody);
}

/* ------ Above functions supposed to be in DAL ----- */

/**
 * Register students to a specified teacher
 * @param {string} teacherEmail teacher email address
 * @param {string[]} studentEmails array of student email addresses
 */
async function registerStudents(teacherEmail = null, studentEmails = []) {
    logService("registerStudents");

    const respBody = {
        teacher: teacherEmail,
        registeredStudents: 0
    };

    try {
        /** @type {TeacherStudent[]} */
        const teacherStudentLinks = [];

        // Get/Create teacher
        const teacher = await createAndReturnTeacher(teacherEmail);

        // Get/Create students
        /** @type Student[] */
        const students = [];
        if (teacher && studentEmails.length) {
            for (const studentEmail of studentEmails) {
                const student = await StudentService.createAndReturnStudent(studentEmail);
                students.push(student);

                // Create teacher-student link
                const tsLink = new TeacherStudent(teacher.id, student.id);
                tsLink.createdBy = config.db.mysql.user;
                teacherStudentLinks.push(tsLink);
            }
        }

        // Create Teacher-Student Links
        const createTeacherStudentLinksResp = await createTeacherStudentLinks(teacherStudentLinks);
        if (createTeacherStudentLinksResp.hasError()) {
            throw createTeacherStudentLinksResp.customError;
        } else {
            respBody.registeredStudents = createTeacherStudentLinksResp.body.insertedCount;
        }

    } catch (err) {
        return new ResponseObject(err);
    }

    return new ResponseObject(respBody);
}
