const moment = require("moment");
module.exports = class TeacherStudent {

    /**
     * Create Teacher-Student Link object
     * @param {*} teacherId teacher id
     * @param {*} studentId student id
     */
    constructor(teacherId, studentId) {
        /** @private */
        this._teacherId = teacherId;
        /** @private */
        this._studentId = studentId;
        /** @private */
        this._status = "ACTIVE";
    }

    /** @type {number} */
    get teacherId() {
        return this._teacherId;
    }

    set teacherId(teacherId) {
        this._teacherId = teacherId;
    }

    /** @type {number} */
    get studentId() {
        return this._studentId;
    }

    set studentId(studentId) {
        this._studentId = studentId;
    }

    /** @type {string} */
    get status() {
        return this._status;
    }

    set status(status) {
        this._status = status;
    }

    /** @type {string} */
    get createdBy() {
        return this._createdBy;
    }

    set createdBy(createdBy) {
        this._createdBy = createdBy;
    }

    /** @type {moment.Moment} */
    get createdDate() {
        return this._createdDate;
    }

    /** @type {string} */
    get updatedBy() {
        return this._updatedBy;
    }

    set updatedBy(updatedBy) {
        this._updatedBy = updatedBy;
    }

    /** @type {moment.Moment} */
    get updatedDate() {
        return this._updatedDate;
    }

    /**
     * Returns array of values of the object with specified attributes
     * @param  {string[]} attributes column names
     */
    toArrayValues(...attributes) {
        const arr = [];
        for (const attrib of attributes) {
            if (attrib && this[attrib]) {
                arr.push(this[attrib]);
            }
        }
        return arr;
    }

    toJSONObject() {
        return {
            teacherId: this._teacherId,
            studentId: this._studentId,
            status: this._status,
            createdBy: this._createdBy,
            createdDate: this._createdDate ? moment(this._createdDate).format("YYYY-MM-DD HH:mm:ss") : undefined,
            updatedBy: this._updatedBy,
            updatedDate: this._updatedDate ? moment(this._updatedDate).format("YYYY-MM-DD HH:mm:ss") : undefined
        };
    }

};
