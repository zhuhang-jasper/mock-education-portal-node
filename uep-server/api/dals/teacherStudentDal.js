const appRoot = require("app-root-path");
const AppLogger = require(appRoot + "/config/logger/appLogger");
const config = require(appRoot + "/config/config");

// DB requirement
const mysql = require("../../config/db").mysql;

// Utility requirement
// const moment = require("moment");

// Models
const TeacherStudent = require("../models/teacherStudent");

// Constants
const UserStatus = require("../constants/userStatus");

module.exports = {
    createTeacherStudentLinks
};

// Database Table Names
// const teacherTable = "teacher"; // t
const teacherStudentTable = "teacher_student"; // ts

const IDENTIFIER = "TeacherStudentDal";
function logDal(str) {
    AppLogger.debug(`Calling ${IDENTIFIER}->${str}()...`);
}

/**
 * Insert teacher-student link into database
 * @param {TeacherStudent[]} teacherStudentLinks array of teacherStudent model
 * @param {*} connection MySQL connection
 * @returns {Promise<TeacherStudent[]>} array of teacherStudent model
 */
async function createTeacherStudentLinks(teacherStudentLinks = [], connection = null) {
    logDal("createTeacherStudentLinks");

    const insertedTeacherStudent = [];
    // const respBody = {
    //     insertedCount: 0
    // };

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
        ` ON DUPLICATE KEY UPDATE status='${UserStatus.ACTIVE}', updatedBy='${config.db.mysql.user}' , updatedDate=CURRENT_TIMESTAMP() `;

        if (Array.isArray(teacherStudentLinks) && teacherStudentLinks.length) {
            // Prepare SQL params
            const arrayModel = teacherStudentLinks.map(tsLink => {
                tsLink.createdBy = config.db.mysql.user;
                insertedTeacherStudent.push(tsLink);
                return tsLink.toArrayValues("teacherId", "studentId", "status", "createdBy");
            });
            const params = [arrayModel];

            // Execute SQL
            const sqlInsertResult = await mysql.executeQuery(sql, params, localConnection);
            // console.log(sqlInsertResult);
            if (sqlInsertResult.affectedRows) {
                // Setup Success Response Object
                // respBody.insertedCount = sqlInsertResult.affectedRows;
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

    return insertedTeacherStudent;
}
