const User = require('../../models/User');
const bcrypt =require('bcryptjs');
const jwt = require('jsonwebtoken');
const {SECRET} = require('../../config.js');
const {UserInputError} = require('apollo-server');
const {validateRegisterInput,validatorLoginInput}= require('../../utils/validator');
const checkAuth = require('../../utils/checkAuth');

function generateToken(user){
  return jwt.sign({
    id : user._id,
    email : user.email,
    username : user.username
  } , SECRET ,{expiresIn : '1h'}
);
}

module.exports = {
  Mutation : {
    async login(_ ,{username , password } ){

      const {errors , valid} = validatorLoginInput(username , password);
      if(!valid){
        throw new UserInputError('Errors' , {errors});
      }
      const user = await User.findOne({username});
      if(!user){
        errors.general = 'User not found';
        throw new UserInputError('User not found',{errors});
      }

      const match = await bcrypt.compare(password , user.password);
      if(!match){
        errors.general = 'Incorrect password';
        throw new UserInputError('Wrong credentials',{errors});
      }

      const token =generateToken(user);

      return {
        ...user._doc,
        id : user._id,
        token
      };
    }
    ,

    async register(parent , { registerInput : { username, email,password,confirmPassword } } , context , info){
      const {valid , errors } = validateRegisterInput(username, email,password,confirmPassword);
      if(!valid){
        throw new UserInputError('Errors' , {errors});
      }

      const user = await User.findOne({username})

        if(user){
          throw new UserInputError("User already exists!" , {
            errors : {
              username : 'This username is taken'
            }
          });
        }
      password = await bcrypt.hash(password , 12);
      const newUser = new User({
        email,
        username,
        password,
        createdAt : new Date().toISOString()
      });
      const res = await newUser.save();
      console.log(res)
      const token = generateToken(res);
      return {
        ...res._doc,
        id : res._id,
        token
      };
     }
     ,
     async createPost(_,{body},context){

       const user = checkAuth(context);
       const newPost = new Post({
         body ,
         user : user.id,
         username : user.username,
         createdAt : new Date().toISOString()
       });
       const post = await newPost.save();
       return post;

     },

     async deletePost ( _, { postId } , context){
       const user = checkAuth(context);

       try {
         const post = await Post.findById(postId);
         if(!post){
           throw new Error("Post Doesnt Exist");
         }
        if(user.username === post.username){
          await Post.findByIdAndRemove(postId);
          return true;
        }
        throw new AuthenticationError('Action not allowed');
       } catch (e) {
         throw new Error(e);
       }
     }
  }



};
