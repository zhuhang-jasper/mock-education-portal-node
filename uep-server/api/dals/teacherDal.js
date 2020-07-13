const appRoot = require("app-root-path");
const AppLogger = require(appRoot + "/config/logger/appLogger");
const config = require(appRoot + "/config/config");

// DB requirement
const mysql = require("../../config/db").mysql;

// Utility requirement
const moment = require("moment");

// Models
const Teacher = require("../models/teacher");

module.exports = {
    createAndReturnTeacher,
    getTeacherByEmail,
    createTeacher
};

// Database Table Names
const teacherTable = "teacher"; // t
// const teacherStudentTable = "teacher_student"; // ts

const IDENTIFIER = "TeacherDal";
function logDal(str) {
    AppLogger.debug(`Calling ${IDENTIFIER}->${str}()...`);
}

/**
 * Create teacher if not exists, else returns teacher from database
 * @param {string} email teacher email address
 * @throws Errors
 * @returns {Promise<Teacher>} teacher model
 */
async function createAndReturnTeacher(email = null) {
    logDal("createAndReturnTeacher");

    if (email) {
        // Check if student exists
        const dbTeacher = await getTeacherByEmail(email);
        if (!dbTeacher) {
            const createdTeacher = await createTeacher(new Teacher(email));
            return createdTeacher;
        } else {
            return dbTeacher;
        }
    } else {
        throw new Error("Teacher email not specified");
    }
}

/**
 * Get one teacher by email address
 * @param {string} email teacher email address
 * @throws Errors
 * @returns {Promise<Teacher|null>} teacher model or null
 */
async function getTeacherByEmail(email = null) {
    logDal("getTeacherByEmail");

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
 * @throws Errors
 * @returns {Promise<Teacher>} teacher model
 */
async function createTeacher(teacher = null, connection = null) {
    logDal("createTeacher");

    let insertedTeacher = null;
    // const respBody = {
    //     insertId: null,
    //     insertedCount: 0,
    //     teacher: null
    // };

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
                // respBody.insertId = sqlInsertResult.insertId;
                // respBody.insertedCount = sqlInsertResult.affectedRows;
                // teacher.id = sqlInsertResult.insertId;
                // respBody.teacher = teacher;
                insertedTeacher = await getTeacherByEmail(teacher.email);
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

    return insertedTeacher;
}
