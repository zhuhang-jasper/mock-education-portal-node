const moment = require("moment");
module.exports = class Teacher {

    /**
     * Create Teacher object
     * @param  {string} email teacher's email
     */
    constructor(email) {
        /** @private */
        this._email = email;
        /** @private */
        this._status = "INACTIVE";
    }

    /** @type {number} */
    get id() {
        return this._id;
    }

    set id(id) {
        this._id = id;
    }

    /** @type {string} */
    get email() {
        return this._email;
    }

    set email(email) {
        this._email = email;
    }

    /** @type {string} */
    get firstName() {
        return this._firstName;
    }

    set firstName(firstName) {
        this._firstName = firstName;
    }

    /** @type {string} */
    get lastName() {
        return this._lastName;
    }

    set lastName(lastName) {
        this._lastName = lastName;
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

    toJSONObject() {
        return {
            email: this._email,
            firstName: this._firstName,
            lastName: this._lastName,
            status: this._status,
            createdBy: this._createdBy,
            createdDate: this._createdDate ? moment(this._createdDate).format("YYYY-MM-DD HH:mm:ss") : undefined,
            updatedBy: this._updatedBy,
            updatedDate: this._updatedDate ? moment(this._updatedDate).format("YYYY-MM-DD HH:mm:ss") : undefined
        };
    }

};
