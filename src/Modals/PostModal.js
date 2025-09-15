
import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    organization: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["post", "poll"], required: true },

    content: {
        text: { type: String },
        media:
        {
            url: String,
            type: { type: String, enum: ["image", "video"] },
        },
    },

    poll: {
        question: { type: String },
        options: [
            {
                option: { type: String },
                votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
            },
        ],
        expiresAt: { type: Date },
    },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            text: String,
            createdAt: { type: Date, default: Date.now },
        },
    ],


}, { timestamps: true })


const PostModel = mongoose.model("Post", PostSchema);
export default PostModel;