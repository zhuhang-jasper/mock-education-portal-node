const appRoot = require("app-root-path");
const AppLogger = require(appRoot + "/config/logger/appLogger");
const config = require(appRoot + "/config/config");

// DB requirement
const mysql = require("../../config/db").mysql;

// Utility requirement
const moment = require("moment");

// Models
const Student = require("../models/student");

module.exports = {
    createAndReturnStudent,
    getStudentByEmail,
    getStudentsByEmails,
    getStudentsByCommonTeacherEmails,
    getStudentsByTeacherEmail,
    createStudent,
    updateStudent
};

// Database Table Names
const studentTable = "student"; // s
const teacherTable = "teacher"; // t
const teacherStudentTable = "teacher_student"; // ts

const IDENTIFIER = "StudentDal";
function logDal(str) {
    AppLogger.debug(`Calling ${IDENTIFIER}->${str}()...`);
}

/**
 * Create student if not exists, else returns student from database
 * @param {string} email student email address
 * @throws Errors
 * @returns {Promise<Student>} student model
 */
async function createAndReturnStudent(email = null) {
    logDal("createAndReturnStudent");

    if (email) {
        // Check if student exists
        const dbStudent = await getStudentByEmail(email);
        if (!dbStudent) {
            const createdStudent = await createStudent(new Student(email));
            return createdStudent;
        } else {
            return dbStudent;
        }
    } else {
        throw new Error("Student email not specified");
    }
}

/**
 * Get one student by email address
 * @param {string} email student email address
 * @throws Errors
 * @returns {Promise<Student|null>} student model or null
 */
async function getStudentByEmail(email = null) {
    logDal("getStudentByEmail");

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
 * @param {string[]} emails student email addresses
 * @param {boolean} isSuspended whether student is suspended (optional)
 * @throws Errors
 * @returns {Promise<Student[]>} student model array or empty array
 */
async function getStudentsByEmails(emails = [], isSuspended = null) {
    logDal("getStudentsByEmails");

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
    let sql = ` SELECT ${selectors} ` +
        ` FROM ${studentTable} s ` +
        " WHERE s.email IN (?) ";

    // Prepare SQL params
    const params = [emails];

    if (isSuspended != null) {
        sql += " AND s.isSuspended = ? ";
        params.push(isSuspended == false ? 0 : 1);
    }

    // prepare query params
    /** @type {Student[]} */
    const sqlResult = [];
    if (Array.isArray(emails) && emails.length) {
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
 * @param {boolean} isSuspended whether student is suspended (optional)
 * @throws Errors
 * @returns {Promise<Student[]>} student model array or empty array
 */
async function getStudentsByTeacherEmail(teacherEmail = null, isSuspended = null) {
    logDal("getStudentsByTeacherEmail");

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
    let sql = ` SELECT ${selectors} ` +
        ` FROM ${teacherTable} t ` +
        ` INNER JOIN ${teacherStudentTable} ts ON t.id = ts.teacherId ` +
        ` INNER JOIN ${studentTable} s ON s.id = ts.studentId ` +
        " WHERE t.email = ? ";

    // Prepare SQL params
    const params = [teacherEmail];

    if (isSuspended != null) {
        sql += " AND s.isSuspended = ? ";
        params.push(isSuspended == false ? 0 : 1);
    }

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
 * Get list of students common to the given list of teacher email addresses
 * @param {string[]} teacherEmails teacher email addresses
 * @throws Errors
 * @returns {Promise<Student[]>} student model array or empty array
 */
async function getStudentsByCommonTeacherEmails(teacherEmails = []) {
    logDal("getStudentsByCommonTeacherEmails");

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
 * Insert student into database
 * @param {Student} student student model
 * @param {*} connection MySQL connection
 * @throws Errors
 * @returns {Promise<Student>} student model
 */
async function createStudent(student = null, connection = null) {
    logDal("createStudent");

    let insertedStudent = null;
    // const respBody = {
    //     insertId: null,
    //     insertedCount: 0,
    //     student: null
    // };

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
            const jsonModel = student.toJSONObject();
            jsonModel.createdBy = config.db.mysql.user;
            const params = [jsonModel];

            // Execute SQL
            const sqlInsertResult = await mysql.executeQuery(insertSql, params, localConnection);
            if (sqlInsertResult.affectedRows) {
                // Setup Success Response Object
                // respBody.insertId = sqlInsertResult.insertId;
                // respBody.insertedCount = sqlInsertResult.affectedRows;
                // student.id = sqlInsertResult.insertId;
                // respBody.student = student;
                insertedStudent = await getStudentByEmail(student.email);
            } else {
                throw new Error("No record inserted.");
            }
        }
    } catch (err) {
        if (!connection) {
            AppLogger.error(err.stack);
            await mysql.rollbackAndRelease(localConnection);
        }
        throw err;
    }

    // commit records if everything is working
    if (!connection) {
        await mysql.commitAndRelease(localConnection);
    }

    return insertedStudent;
}

/**
 * Update student in database
 * @param {Student} student student model
 * @param {*} connection MySQL connection
 * @returns {Promise<Student>} student model
 */
async function updateStudent(student = null, connection = null) {
    logDal("updateStudent");

    let updatedStudent = null;
    // const respBody = {
    //     updatedCount: 0,
    //     student: null
    // };

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
                // respBody.updatedCount = sqlUpdateResult.affectedRows;
                // respBody.student = student;
                updatedStudent = await getStudentByEmail(student.email);
            } else {
                throw new Error("No record inserted.");
            }
        }
    } catch (err) {
        if (!connection) {
            AppLogger.error(err.stack);
            await mysql.rollbackAndRelease(localConnection);
        }
        throw err;
    }

    // commit records if everything is working
    if (!connection) {
        await mysql.commitAndRelease(localConnection);
    }

    return updatedStudent;
}
