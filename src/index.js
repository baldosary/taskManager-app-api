const express = require('express');
require('./db/mongoose');

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const app = express();
const port = process.env.PORT;

const upload = multer({
    dest : 'images'
});

app.post('/upload', upload.single('upload'),(req,res) => {
    res.send(req.body);
})
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);



app.listen(port, () =>{
    console.log(`The server is up on port ${port}`);
});


