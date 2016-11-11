# Intro
This project is at this stage just an exercise to explain how I used node.js MongoDB driver when I needed it in a project where I was using promises, and in particular bluebird.js.

# History
For one of my projects, I needed to use mongo.js driver in conjunction with bluebird.js.

Promisifying the driver via bluebird was not an option given the structure of the API.

The other thing I needed was to create a client connection on initializing the server which I could then share across all
the modules needing to interact with the database.

There are a few options around there (mongoose), but I just wanted to keep things simple and not to introduce any unnecessary dependency.

One day I opened up the black-box I found out in the source code mongodb.js already supports promises and can actually make use of A+/Promises libraries.

Therefore, I have created this simple recipe project which has no intention to be the most complete library you are going to need.
When I say simple, I mean I did not need to create any complex framework and the code looks simple and readable in both the
library module and the parts that use the library (the tests in this repo).

Having said this, feel free to fork or contribute to it in case you like the idea.

# Example
TBC

# ES6
TBC

# Installation
TBC

# License
TBC
