const moment = require("moment");
const ObjectUtil = require("../utils/objectUtil");
const Teacher = require("./teacher");
module.exports = class Notification {

    /**
     * Create Notification object
     */
    constructor() {
        /** @private */
        this.text = "";
    }

    /** @type {number} */
    get id() {
        return this._id;
    }

    set id(id) {
        this._id = id;
    }

    /** @type {Teacher} */
    get teacher() {
        return this._teacher;
    }

    set teacher(teacher) {
        this._teacher = teacher;
    }

    /** @type {string} */
    get text() {
        return this._text;
    }

    set text(text) {
        this._text = text;
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

    set createdDate(createdDate) {
        this._createdDate = createdDate;
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

    set updatedDate(updatedDate) {
        this._updatedDate = updatedDate;
    }

    /**
     * Returns JSON object representation of the model
     * @param {string[]} excludedAttribs attributes to be excluded in the object
     */
    toJSONObject(...excludedAttribs) {
        const obj = {
            teacherId: this._teacher.id,
            text: this._text,
            createdBy: this._createdBy,
            createdDate: this._createdDate ? moment(this._createdDate).format("YYYY-MM-DD HH:mm:ss") : undefined,
            updatedBy: this._updatedBy,
            updatedDate: this._updatedDate ? moment(this._updatedDate).format("YYYY-MM-DD HH:mm:ss") : undefined
        };
        for (const exAttrib of excludedAttribs) {
            delete obj[exAttrib];
        }
        return ObjectUtil.removeUndefinedProperties(obj);
    }

};
