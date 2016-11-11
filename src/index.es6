import { bluebird } from 'bluebird'
import { connect } from 'mongodb'


/**
 * Simple(-istic) wrapper around Mongodb driver which enables use of Bluebird promises.
 */
export default class MongoClientAsync {

    /**
     * Creates an object wrapping a MongoDB connection.
     * @param uri The URI of the MongoDB instance.
     */
    constructor(uri) {
        this.db = connect(`mongodb://${uri}`, { promiseLibrary: bluebird });
        this.collection = null;
    }

    /**
     * Find all objects in the collection.
     * @param {string} collectionName The Name of the collection.
     * @param {object} query A mongodb query. Empty for fetching all objects.
     * @returns {Promise.<T>} A promise which resolves into an array containing all objects in the collection matching the query.
     */
    findAllInCollection(collectionName, query) {
        return this.getCollection(collectionName)
            .then(coll => coll.find(query ? query : {}))
            .then(transformCursorIntoArray)
    }

    /**
     * Find first object in the collection matching the query
     * @param {string} collectionName The Name of the collection.
     * @param {object} query A mongodb query.
     * @returns A Promise which resolves into the first object in the collection matching the query.
     */
    findOneInCollection(collectionName, query) {
        return this.getCollection(collectionName)
            .then(coll => coll.findOne(query ? query : {}))
    }

    /**
     * Insert the given documents in the collection.
     * @param {string} collectionName The Name of the collection.
     * @param {object[]|object} documents An array of documents or a singe document.
     * @returns A Promise holding the result of the insert.
     */
    insertInCollection(collectionName, documents) {
        return this.getCollection(collectionName)
            .then(coll => coll.insert(documents))
    }

    /**
     * Remove the document matching the query from the collection.
     * @param {string} collectionName The Name of the collection.
     * @param {object} query A mongodb query.
     * @returns A Promise holding the result of the delete.
     */
    removeFromCollection(collectionName, query) {
        return this.getCollection(collectionName)
            .then(coll => coll.remove(query, null))
    }

    /**
     * Update the document in the collection matching the query.
     * @param {string} collectionName The Name of the collection.
     * @param {object} query A mongodb query.
     * @param {object} update The update operations to be applied to the document
     * @returns A Promise holding the result of the delete.
     */
    updateCollection(collectionName, query, update) {
        return this.getCollection(collectionName)
            .then(coll => coll.update(query, update, {}))
    }

    /**
     * Drops a collection.
     * @param {string} collectionName The Name of the collection.
     * @returns A Promise holding the result of the drop.
     */
    dropCollection(collectionName) {
        return this.db
            .then(db => db.dropCollection(collectionName));
    }

    /**
    * Close the connection with the DB.
    */
    close() {
        return this.db
            .then(db => db.close(true))
    }

    /**
     * Utility method to get the MongoDB collection instance.
     * @param {string} collectionName The Name of the collection.
     * @return {Collection} A Collection instance.
     */
    getCollection(collectionName) {
        return this.db
            .then(db => db.collection(collectionName))
    }
}

function transformCursorIntoArray(cursor) {
    return new Promise((resolve, reject) =>
        cursor.toArray((e, items) => {
            if (e) {
                reject(e)
            }
            if (items) {
                resolve(items)
            }
        }));
}
