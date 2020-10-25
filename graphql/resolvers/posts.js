const Post = require('../../models/Post')
module.exports = {
  Query : {
  async getPosts(){
      try{
        const posts = await Post.find().sort({createdAt : -1});
        return posts;
      } catch(err){
        throw new Error(err);
      }
  }
,
  async getPost( _ , { postId }){
  try{
     const post = await Post.findById(postId);
     if(!post){
       throw new Error('Post Doesnt Exist');
     }

     return post;
  }
  catch(err){
    throw new Error(err);
  }
  }

  }
}
