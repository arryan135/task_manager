const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const {userOneId, userOne, setupDatabase} = require("./fixtures/db");

// this function run before each test case in this test suite
beforeEach(setupDatabase);

test("Should sign up a new user", async () => {
    const response = await request(app)
        .post("/users")
        .send({
            name: "Arryan",
            email: "arryan@umich.edu",
            password: "thisisagoodpass"
        })
        .expect(201);

        // Assert that the database was changed correctly
        const user = await User.findById(response.body.user._id);
        expect(user).not.toBeNull(); // -> tests that this user exists in db

        // Assertions about the response
        expect(response.body).toMatchObject({
            user: {
                name: "Arryan",
                email: "arryan@umich.edu"
            },
            token: user.tokens[0].token
        });

        // Assestion that the password is not stored as plain text password
        expect(user.password).not.toBe("thisisagoodpass");
        
});

test("Should login existing user", async () => {
    // the user we are trying to log in already exists in the db
    // So when we log in again the `generateAuthToken()` user model method adds a new token to the token object
    const response = await request(app)
        .post("/users/login")
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200);

    const user = await User.findById(userOneId);

    // Assert that token in response matches users second token
    expect(response.body.token).toBe(user.tokens[1].token);
});

test("Should not login non-existant user", async () => {
    await request(app)
        .post("/users/login")
        .send({
            email: "test@test.com",
            password: "thisissomecode"
        })
        .expect(400);
});

test("Should get profile for user", async () => {
    await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`) // to add Authorization header
        .send()
        .expect(200);
});

test("Should not get profile for unauthenticated user", async () => {
    await request(app)
        .get("/users/me")
        .send()
        .expect(401);
        // did not set authentication header so the auth middleware will not know if user is authenticated
});

test("Should delete account for user", async () => {
    const response = await request(app)
        .delete("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user).toBeNull();
});

test("Should not delete account for unauthenticated user", async () => {
    await request(app)
        .delete("/users/me")
        .send()
        .expect(401)
});

test("Should upload avatar image", async () => {
    await request(app)
        .post("/users/me/avatar")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`) // -> add header to enable authorization
        .attach("avatar", "tests/fixtures/profile-pic.jpg")
        .expect(200);

    const user = await User.findById(userOneId);
    // checking to see if the user.avatar equals any Buffer. 
    // If not the image hasn't been uploaded correctly  
    expect(user.avatar).toEqual(expect.any(Buffer)); 
});

test("Should update valid user field", async () => {
    await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: "Jeff"
        })
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user.name).toEqual("Jeff"); // toEqual ignore memory differnece
});

test("Should not update invalid user", async () => {
    await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: "Ann Arbor"
        })
        .expect(400);
});