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

// Constants
const Student = require("../models/student");

// Error Handling
const ResponseObject = require("../base/ResponseObject");
// const CustomError = require("../base/CustomError");
// const ErrorCode = require('../constants/responseErrorCode');

module.exports = {
    createAndReturnStudent,
    getStudentByEmail,
    getStudentsByEmails,
    retrieveStudentsCommonToTeachers,
    suspendStudent,
    retrieveUnsuspendedStudentsOfTeacher
};

// Database Table Names
const studentTable = "student"; // s
const teacherTable = "teacher"; // t
const teacherStudentTable = "teacher_student"; // ts

const IDENTIFIER = "StudentService";
function logService(str) {
    AppLogger.debug(`Calling ${IDENTIFIER}->${str}()...`);
}

/**
 * Create student if not exists, else returns student from database
 * @param {string} email student's email address
 * @param {*} connection MySQL connection
 * @returns {Student} student model
 */
async function createAndReturnStudent(email = null, connection = null) {
    logService("createAndReturnStudent");

    if (email) {
        // Check if student exists
        const dbStudent = await getStudentByEmail(email);
        if (!dbStudent) {
            const createNewStudentResp = await createStudent(new Student(email));
            if (createNewStudentResp.hasError()) {
                throw createNewStudentResp.customError;
            } else {
                return createNewStudentResp.body.student;
            }
        } else {
            return dbStudent;
        }
    } else {
        throw new Error("Student email not specified");
    }
}

/**
 * Get one student by email address
 * @param {string} email student's email address
 * @throws Errors
 * @returns {Student|null} student model or null
 */
async function getStudentByEmail(email = null) {
    logService("getStudentByEmail");

    // Prepare SQL statement
    const selectors = " s.id, " +
        " s.email, " +
        " s.firstName, " +
        " s.lastName, " +
        " s.status, " +
        " s.isSuspended, " +
        " s.createdBy, " +
        " s.createdDate, " +
        " s.updatedBy, " +
        " s.updatedDate ";
    const sql = ` SELECT ${selectors} ` +
        ` FROM ${studentTable} s ` +
        " WHERE email = ? ";

    // Prepare SQL params
    const params = [email];

    // prepare query params
    let sqlResult = null;
    if (email) {
        const sqlResultTemp = await mysql.executeQuery(sql, params);
        if (sqlResultTemp.length) {
            const raw = sqlResultTemp[0];
            sqlResult = new Student(raw.email);
            sqlResult.id = raw.id;
            sqlResult.firstName = raw.firstName;
            sqlResult.lastName = raw.lastName;
            sqlResult.status = raw.status;
            sqlResult.isSuspended = (raw.isSuspended == 1);
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
 * Get list of students of given list of email addresses
 * @param {string[]} studentEmails student email addresses
 * @throws Errors
 * @returns {Student[]} student model array or empty array
 */
async function getStudentsByEmails(studentEmails = []) {
    logService("getStudentsByEmails");

    // Prepare SQL statement
    const selectors = " s.id, " +
        " s.email, " +
        " s.firstName, " +
        " s.lastName, " +
        " s.status, " +
        " s.isSuspended, " +
        " s.createdBy, " +
        " s.createdDate, " +
        " s.updatedBy, " +
        " s.updatedDate ";
    const sql = ` SELECT ${selectors} ` +
        ` FROM ${studentTable} s ` +
        " WHERE s.email IN (?) ";

    // Prepare SQL params
    const params = [studentEmails];

    // prepare query params
    /** @type {Student[]} */
    const sqlResult = [];
    if (Array.isArray(studentEmails) && studentEmails.length) {
        const sqlResultTemps = await mysql.executeQuery(sql, params);
        // console.log(sqlResultTemps);
        if (sqlResultTemps.length) {
            for (const raw of sqlResultTemps) {
                const temp = new Student(raw.email);
                temp.id = raw.id;
                temp.firstName = raw.firstName;
                temp.lastName = raw.lastName;
                temp.status = raw.status;
                temp.isSuspended = (raw.isSuspended == 1);
                temp.createdBy = raw.createdBy;
                temp.createdDate = raw.createdDate ? moment(raw.createdDate) : undefined;
                temp.updatedBy = raw.updatedBy;
                temp.updatedDate = raw.updatedDate ? moment(raw.updatedDate) : undefined;
                sqlResult.push(temp.toJSONObject());
            }
        }
    }
    const arrayResult = sqlResult;
    return arrayResult;
}

/**
 * Get list of students common to the given list of teacher email addresses
 * @param {string[]} teacherEmails teacher email addresses
 * @throws Errors
 * @returns {Student[]} student model array or empty array
 */
async function getStudentsByCommonTeacherEmails(teacherEmails = []) {
    logService("getStudentsByCommonTeacherEmails");

    // Prepare SQL statement
    const selectors = " s.id, " +
        " s.email, " +
        " s.firstName, " +
        " s.lastName, " +
        " s.status, " +
        " s.isSuspended, " +
        " s.createdBy, " +
        " s.createdDate, " +
        " s.updatedBy, " +
        " s.updatedDate, " +
        " COUNT(t.id) AS teacherCount ";
    const sql = ` SELECT ${selectors} ` +
        ` FROM ${teacherTable} t ` +
        ` INNER JOIN ${teacherStudentTable} ts ON t.id = ts.teacherId ` +
        ` INNER JOIN ${studentTable} s ON s.id = ts.studentId ` +
        " WHERE t.email IN (?) " +
        " GROUP BY s.id " +
        " HAVING teacherCount = ? ";

    // Prepare SQL params
    const params = [teacherEmails, teacherEmails.length];

    // prepare query params
    /** @type {Student[]} */
    const sqlResult = [];
    if (Array.isArray(teacherEmails) && teacherEmails.length) {
        const sqlResultTemps = await mysql.executeQuery(sql, params);
        // console.log(sqlResultTemps);
        if (sqlResultTemps.length) {
            for (const raw of sqlResultTemps) {
                const temp = new Student(raw.email);
                temp.id = raw.id;
                temp.firstName = raw.firstName;
                temp.lastName = raw.lastName;
                temp.status = raw.status;
                temp.isSuspended = (raw.isSuspended == 1);
                temp.createdBy = raw.createdBy;
                temp.createdDate = raw.createdDate ? moment(raw.createdDate) : undefined;
                temp.updatedBy = raw.updatedBy;
                temp.updatedDate = raw.updatedDate ? moment(raw.updatedDate) : undefined;
                sqlResult.push(temp.toJSONObject());
            }
        }
    }
    const arrayResult = sqlResult;
    return arrayResult;
}

/**
 * Get list of unsuspended students of a given teacher email address
 * @param {string} teacherEmail teacher email address
 * @throws Errors
 * @returns {Student[]} student model array or empty array
 */
async function getUnsuspendedStudentsOfTeacherEmail(teacherEmail = null) {
    logService("getUnsuspendedStudentsOfTeacherEmail");

    // Prepare SQL statement
    const selectors = " s.id, " +
        " s.email, " +
        " s.firstName, " +
        " s.lastName, " +
        " s.status, " +
        " s.isSuspended, " +
        " s.createdBy, " +
        " s.createdDate, " +
        " s.updatedBy, " +
        " s.updatedDate ";
    const sql = ` SELECT ${selectors} ` +
        ` FROM ${teacherTable} t ` +
        ` INNER JOIN ${teacherStudentTable} ts ON t.id = ts.teacherId ` +
        ` INNER JOIN ${studentTable} s ON s.id = ts.studentId ` +
        " WHERE t.email = ? AND s.isSuspended = 0 ";

    // Prepare SQL params
    const params = [teacherEmail];

    // prepare query params
    /** @type {Student[]} */
    const sqlResult = [];
    if (teacherEmail) {
        const sqlResultTemps = await mysql.executeQuery(sql, params);
        // console.log(sqlResultTemps);
        if (sqlResultTemps.length) {
            for (const raw of sqlResultTemps) {
                const temp = new Student(raw.email);
                temp.id = raw.id;
                temp.firstName = raw.firstName;
                temp.lastName = raw.lastName;
                temp.status = raw.status;
                temp.isSuspended = (raw.isSuspended == 1);
                temp.createdBy = raw.createdBy;
                temp.createdDate = raw.createdDate ? moment(raw.createdDate) : undefined;
                temp.updatedBy = raw.updatedBy;
                temp.updatedDate = raw.updatedDate ? moment(raw.updatedDate) : undefined;
                sqlResult.push(temp.toJSONObject());
            }
        }
    }
    const arrayResult = sqlResult;
    return arrayResult;
}

/**
 * Insert student into database
 * @param {Student} student student model
 * @param {*} connection MySQL connection
 */
async function createStudent(student = null, connection = null) {
    logService("createStudent");

    const respBody = {
        insertId: null,
        insertedCount: 0,
        student: null
    };

    // Prepare DB Connection
    let localConnection = connection;
    if (!connection) {
        localConnection = await mysql.getConn();
        await localConnection.beginTransaction();
    }

    try {
        // Prepare SQL statement
        const insertSql = `INSERT INTO ${studentTable} SET ? `;

        if (student) {
            // Prepare SQL params
            // const insertParamObj = {
            //     email: student.email,
            //     firstName: student.firstName,
            //     lastName: student.lastName,
            //     status: student.status,
            //     isSuspended: student.isSuspended,
            //     createdBy: config.db.mysql.user
            // };
            // ObjectUtil.removeUndefinedProperties(insertParamObj);
            student.createdBy = config.db.mysql.user;
            const params = [student.toJSONObject()];

            // Execute SQL
            const sqlInsertResult = await mysql.executeQuery(insertSql, params, localConnection);
            if (sqlInsertResult.affectedRows) {
                // Setup Success Response Object
                respBody.insertId = sqlInsertResult.insertId;
                respBody.insertedCount = sqlInsertResult.affectedRows;
                student.id = sqlInsertResult.insertId;
                respBody.student = student;
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
 * Update student in database
 * @param {Student} student student model
 * @param {*} connection MySQL connection
 */
async function updateStudent(student = null, connection = null) {
    logService("updateStudent");

    const respBody = {
        updatedCount: 0,
        student: null
    };

    // Prepare DB Connection
    let localConnection = connection;
    if (!connection) {
        localConnection = await mysql.getConn();
        await localConnection.beginTransaction();
    }

    try {
        // Prepare SQL statement
        const updateSql = `UPDATE ${studentTable} SET ? ` +
            " WHERE id = ?  ";

        if (student) {
            // Prepare SQL params
            const jsonModel = student.toJSONObject("id", "createdBy", "createdDate");
            jsonModel.updatedBy = config.db.mysql.user;
            jsonModel.updatedDate = "CURRENT_TIMESTAMP()";
            const params = [jsonModel, student.id];

            // Execute SQL
            const sqlUpdateResult = await mysql.executeQuery(updateSql, params, localConnection);
            if (sqlUpdateResult.affectedRows) {
                // Setup Success Response Object
                respBody.updatedCount = sqlUpdateResult.affectedRows;
                respBody.student = student;
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

/* ------ Above functions supposed to be in DAL ----- */

/**
 * Retrieve list of students with common teachers
 * @param {string[]} teacherEmails array of teacher email addresses
 * @returns student emails
 */
async function retrieveStudentsCommonToTeachers(teacherEmails = []) {
    logService("retrieveStudentsCommonToTeachers");

    const respBody = {
        teachers: teacherEmails,
        students: []
    };

    try {
        // Query
        const commonStudents = await getStudentsByCommonTeacherEmails(teacherEmails);

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
async function suspendStudent(studentEmail = []) {
    logService("suspendStudent");

    const respBody = {
        suspendedStudents: 0
    };

    try {

        // Get/Create student
        const student = await createAndReturnStudent(studentEmail);

        // Set isSuspended to true
        student.isSuspended = true;

        // Update
        const updateStudentResp = await updateStudent(student);
        if (updateStudentResp.hasError()) {
            throw updateStudentResp.customError;
        } else {
            respBody.suspendedStudents = updateStudentResp.body.updatedCount;
        }

    } catch (err) {
        return new ResponseObject(err);
    }

    return new ResponseObject(respBody);
}

/**
 * Retrieve list of unsuspended students of a given teacher
 * @param {string} teacherEmail teacher email address
 * @returns student emails
 */
async function retrieveUnsuspendedStudentsOfTeacher(teacherEmail = null) {
    logService("retrieveUnsuspendedStudentsOfTeacher");

    const respBody = {
        teacher: teacherEmail,
        students: []
    };

    try {
        // Query
        const commonStudents = await getUnsuspendedStudentsOfTeacherEmail(teacherEmail);

        // Return only email address
        respBody.students = commonStudents.map(student => {
            return student.email;
        });

    } catch (err) {
        return new ResponseObject(err);
    }

    return new ResponseObject(respBody);
}
