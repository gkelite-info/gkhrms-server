import express from "express";
import { addComment, createPoll, createPost, deleteComment, deletePost, dislikePost, getAllPost, likePost, removeVote, votePoll } from "../Controllers/Post.controller.js";
import upload from "../Middlewares/multerConfig.js";
import { authentication } from "../Middlewares/AuthMiddleware.js";

const postRouter = express.Router();

postRouter.post("/create-post", authentication, upload.single("media"), createPost)
postRouter.get("/", authentication, getAllPost)
postRouter.delete("/:postid", authentication, deletePost)
postRouter.patch("/like-post/:postid", authentication, likePost)
postRouter.patch("/dis-like-post/:postid", authentication, dislikePost)
postRouter.patch("/add-comment/:postid", authentication, addComment)
postRouter.patch("/delete-comment/:postid/:commentid", authentication, deleteComment)

// poll apis
postRouter.post("/poll", authentication, createPoll);
postRouter.post("/poll/vote/:postid/:optionIndex", authentication, votePoll);
postRouter.post("/poll/remove-vote/:postid", authentication, removeVote);
export default postRouter