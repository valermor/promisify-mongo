/**
 * Helper function to solve the problem of Uncaught AssertionError when using promises.
 * It evaluates the assertion and in case of an error it will reject the error for a further .catch()
 * to handle it.
 */
function exitingAssertion(done, assertion) {
    return new Promise((resolve, reject) => {
        try {
            assertion();
            done();
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * Helper assertion function to verify thrown errors.
 */
function assertCaughtError(actualError, expectedErrorType, done) {
    try {
        (() => { throw actualError}).should.throw(expectedErrorType);
        done();
    }
    catch(e) {
        done(e);
    }
}

export { exitingAssertion, assertCaughtError }