import MongoClientAsync from './index.es6'
import { exitingAssertion, assertCaughtError } from './assertions.es6'
import { AssertionError, should } from 'should';
import { connect } from 'mongodb';
import { Promise } from 'bluebird';

const USERS_COLLECTION = 'users';
const FIRST_USER = { name: 'alice', surname: 'smith' };
const SECOND_USER = { name: 'bob', surname: 'white' };
const USERS = [ FIRST_USER, SECOND_USER ];

const DB_URI = `127.0.0.1:3000/test`;
let dbConnection, usersCollection = null;

describe('@unit tests:', () => {

    beforeEach(() => {
        dbConnection = connect(`mongodb://${DB_URI}`, { promiseLibrary: Promise });
        usersCollection = dbConnection
            .then(db => db.collection(USERS_COLLECTION, { promiseLibrary: Promise }));
    });

    afterEach(done => {
        dbConnection
            .then(db => db.dropDatabase())
            .then(() => dbConnection)
            //.then(c => c.close(true))
            .then(() => done())
            .catch(err => done(err))
    });

    it(`Scenario: test findAllInCollection() with non empty query`, done => {
            // Given the Users collection is inserted in the DB
            insertUsersIn(usersCollection)
            // When a query for a user by surname is done using MongoClientAsync
            .then(() => new MongoClientAsync(DB_URI))
            .then(db => db.findAllInCollection(USERS_COLLECTION, { surname: SECOND_USER.surname }))
            // All the matching documents are returned
            .then(result => exitingAssertion(done, () => {
                let user = result[0];
                user.name.should.match(SECOND_USER.name);
                user.surname.should.match(SECOND_USER.surname);
            }))
            .catch(err => {
                done(err)
            })
    });

    it(`Scenario: test findAllInCollection() with empty query`, done => {
            // Given the Users collection is inserted in the DB
            insertUsersIn(usersCollection)
            // When all documents in the collection are requested using MongoClientAsync
            .then(() => new MongoClientAsync(DB_URI))
            .then(db => db.findAllInCollection(USERS_COLLECTION))
            // All the matching documents are returned
            .then(result => exitingAssertion(done, () => {
                result.should.match(USERS)
            }))
            .catch(err => {
                done(err)
            })
    });

    it(`Scenario: test findOneInCollection() with non-empty query`, done => {
            // Given the Users collection is inserted in the DB
            insertUsersIn(usersCollection)
            // When one document in the collection matching the query is requested using MongoClientAsync
            .then(() => new MongoClientAsync(DB_URI))
            .then(db => db.findOneInCollection(USERS_COLLECTION, { surname: SECOND_USER.surname }))
            // The first matching document is returned
            .then(user => exitingAssertion(done, () => {
                user.name.should.match(SECOND_USER.name);
                user.surname.should.match(SECOND_USER.surname);
            }))
            .catch(err => {
                done(err)
            })
    });

    it(`Scenario: test findOneInCollection() with empty query`, done => {
            // Given the Users collection is inserted in the DB
            insertUsersIn(usersCollection)
            // When one document in the collection is requested using MongoClientAsync
            .then(() => new MongoClientAsync(DB_URI))
            .then(db => db.findOneInCollection(USERS_COLLECTION))
            // The first document is returned
            .then(user => exitingAssertion(done, () => {
                user.name.should.match(FIRST_USER.name);
                user.surname.should.match(FIRST_USER.surname);
            }))
            .catch(err => {
                done(err)
            })
    });

    it(`Scenario: test insertInCollection()`, done => {
        new MongoClientAsync(DB_URI)
            // When a collection is inserted using MongoClientAsync
            .insertInCollection(USERS_COLLECTION, USERS)
            // Then collection's objects can be found in the DB
            .then(() => assertHasValues(usersCollection, USERS, done));
    });

    it(`Scenario: test removeFromCollection()`, done  => {
            // Given a DB is populated with the Users collection
            insertUsersIn(usersCollection)
            // When an object is removed from the collection using MongoClientAsync
            .then(() => new MongoClientAsync(DB_URI))
            .then(db => db.removeFromCollection(USERS_COLLECTION, { surname: SECOND_USER.surname }))
            // Then the collection has all but the removed object
            .then(() => assertHasValues(usersCollection, [ FIRST_USER ], done));
    });

    it(`Scenario: test updateCollection()`, done => {
            // Given a DB is populated with the Users collection
            insertUsersIn(usersCollection)
            // When an object is updated using MongoClientAsync
            .then(() => new MongoClientAsync(DB_URI))
            .then(db => db.updateCollection(USERS_COLLECTION, { surname: SECOND_USER.surname }, { $set: { name: 'robert' }}))
            // Then the DB has the updated object
            .then(() => assertHasValues(usersCollection, [ FIRST_USER, { name: 'robert', surname: SECOND_USER.surname }], done));
    });

    it(`Scenario: test dropCollection()`, done => {
            // Given a DB is populated with the Users collection
            insertUsersIn(usersCollection)
            // When the collection is dropped using MongoClientAsync
            .then(() => new MongoClientAsync(DB_URI))
            .then(db => db.dropCollection(USERS_COLLECTION))
            // Then the collection cannot be found anymore in the DB
            .then(() => assertHasValues(usersCollection, [], done));
    });

    it(`Scenario: test close()`, done => {
        Promise.fulfilled()
            .then(() => new MongoClientAsync(DB_URI))
            .then(db => db.close())
            .then(db => done())
            .catch(err => {done(err)})
    })

});

function insertUsersIn(promisifiedCollection) {
    return promisifiedCollection
        .then(coll => coll.insert(USERS));
}

function assertHasValues(collection, expectedValues, done) {
    return Promise.fulfilled()
        .then(() => collection)
        .then(coll => coll.find({}))
        .then(curs => {
            curs.toArray((e, items) => {
                if (e) {
                    done(e)
                }
                if (items) {
                    return exitingAssertion(done, () => {
                        items.should.match(expectedValues);
                    })
                }
            })})
        .catch(err => {
            done(err)
        })
}