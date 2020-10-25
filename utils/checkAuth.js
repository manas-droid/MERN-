const jwt = require('jsonwebtoken');
const {AuthenticationError} = require('apollo-server');

const {SECRET} = require('../config');
module.exports = ( {req} )=>{
  const authHeader = req.headers.authorization;
  if(authHeader){
    const token = authHeader.split(' ')[1];
    if(token){
      try {
          const user = jwt.verify(token , SECRET);
          return user;
      } catch (e) {
        throw new AuthenticationError("Invalid/Expired token");
      }
    }

    throw new Error('Authentication token must be \'Bearer  [token]  ')
  }
  throw new Error('Authentication header must be provided  ')

}
