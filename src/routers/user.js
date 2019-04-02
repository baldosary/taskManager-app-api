const express = require('express');
const User = require('../models/User');
const auth = require('../middlewares/auth');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')
const route = new express.Router();

//Setting POST route for create a user:
route.post('/user', async(req,res) => {
    const user = new User(req.body);
    
    try {
       await user.save();
       sendWelcomeEmail(user.email, user.name);
       const token = await user.generateAuthToken();
       res.status(201).send({user, token});
    }
    catch(e)
    {
        res.status(400).send(e);
    }
});

//Setting a POST route for the user login:
route.post('/users/login', async (req,res) => {

    try
    {
        const user = await User.findByCredentail(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user, token});
    }
    catch(e)
    {
        res.status(400).send();
    }
});
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback){
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
      return callback( new Error('Please upload an image!'));  
    }
      callback(undefined, true);
    }
});
//Setting a POST route to upload an image to the user profile:
route.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({error: error.message});
})
//Setting a GET route to get the users's avatar:
route.get('/users/:id/avatar', async(req,res) => { 
    try {
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar){
        throw new Error();
    }
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);   
    }
    catch(e){
        res.status(404).send();
    } 
});
//Setting a DELETE route to delete the image from the user profile:
route.delete('/users/me/avatar', auth, async (req,res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
})

//Setting a POST route to logout for one token:
route.post('/users/logout', auth, async(req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();
        res.send();
    }
    catch(e){
        res.status(500).send();
    }
})
//Setting a POST route to logout for all tokens:
route.post('/users/logoutAll', auth, async(req, res)=> {
    try{
        req.user.tokens = [];
        await req.user.save();
        res.send();
    }
    catch(e){
        res.status(500).send();
    }
});



//Setting the GET route to get a user's profile:
route.get('/users/me', auth, async(req,res) => {
  res.send(req.user);    
});


//Setting the PATACH route to update a specific user:
route.patch('/users/me', auth, async(req,res) => {
    const updates = Object.keys(req.body);
    const validUpdate = ['name', 'email', 'passowrd', 'age'];
     
    const isValidUpdate = updates.every((update) => {
       return validUpdate.includes(update);
    });

    if(!isValidUpdate)
    return res.status(400).send({error: 'Invalid Update!'});
    
    try{
       
        //const user = await User.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true});
        const user = req.user;

        updates.forEach((update) => user[update] = req.body[update]);
        await user.save();  
        res.send(user);
    }
    catch(e){
        res.status(400).send(e);
    }
    
});

//Setting the DELETE route to delete the user by Id:
route.delete('/users/me', auth, async(req,res) => {
    try{
        await req.user.remove();
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user);
    }
    catch(e){
        res.status(500).send();
    }
});

module.exports = route;