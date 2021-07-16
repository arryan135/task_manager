const express = require("express");
// makes sure that mongoose connexts to the database
require("./db/mongoose");
const User = require("./models/user");
const Task = require("./models/task");
const {ObjectID} = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// parse incoming json to js object 
app.use(express.json());

app.post("/users", async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        res.status(201).send(user);
    } catch(error){
        res.status(400).send(error);
    }
});

app.get("/users/:id", async (req, res) => {
    const _id = req.params.id;

    try{
        const user = await User.findById(_id);
        if (!user)
            return res.status(404).send();
        res.send(user);
    } catch(error){
        res.status(500).send(error);
    }
});

app.get("/users", async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch(error){
        res.status(500).send(error);
    }
});

app.patch("/users/:id", async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password", "age"];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation){
        return res.status(400).send({"error": "Invalid Updates"});
    }

    try {
        // new:true returns the new user as opposed to the existing one found before the update 
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        // no user with the given id
        if (!user){
            return res.status(404).send();
        }
        res.send(user);
    } catch (error){
        res.status(500).send(error);
    }
});

app.post("/tasks", async (req, res) => {
    const task = new Task(req.body);
    try {
        await task.save(); 
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get("/tasks", async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.send(tasks);
    } catch(error){
        res.status(500).send(error);
    }
});

app.get("/tasks/:id", async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findById(_id);
        if (!task){
            return res.status(404).send();
        }
        res.send(task);
    } catch(error){
        res.status(500).send(error);
    }
});

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});