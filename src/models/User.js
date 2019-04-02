const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Task = require('./Task');

const userSchema = mongoose.Schema({
    name :{
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    email:{
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate(value){
          if(!validator.isEmail(value))
           throw new Error('Email isn\'t valid');
      }
    },
      password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(value){
            if(value.toLowerCase().includes('password'))
            throw new Error('Your password must not contain password');
        }
        
    },
    age: {
        type: Number,
        default: 0,
        validate(value)
        {
            if(value < 0)
            throw new Error('It must be a positive number');
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
 }, {
     timestamps: true
 });
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});


 userSchema.methods.toJSON = function () {
     const user = this;
     const userObject = user.toObject();

     delete userObject.password;
     delete userObject.tokens;
     delete userObject.avatar;

     return userObject;
 }

 /* --Userdefined function to generate a token for the user-- */
 userSchema.methods.generateAuthToken = async function() {
     
    const user = this;
    const token = jwt.sign({_id: user.id.toString()}, process.env.JWT_SECRET);

     user.tokens = user.tokens.concat({token});

     await user.save();

     return token;


    
 }

 /* --UserDefined function to find a user with email and passord-- */
 userSchema.statics.findByCredentail = async (email, password) => {

    const user = await User.findOne({email});
    if(!user) {
        throw new Error('Unable to login!');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) {
        throw new Error('Unable to login!');
    }

    return user;


 }
 /* Deleting tasks before remove a user--- */
 userSchema.pre('remove', async function(next){
     const user = this;
     await Task.deleteMany({owner: user._id});

     next();

 });

 /* ---Hash plain text password before saving--- */
userSchema.pre('save', async function(next){
    const user = this;

    if(user.isModified('password')) {

       user.password = await bcrypt.hash(user.password, 8);
       
       next();
    }
})

const User = mongoose.model('User', userSchema);

 module.exports = User;
