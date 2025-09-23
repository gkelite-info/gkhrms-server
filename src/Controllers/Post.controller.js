import PostModel from "../Modals/PostModal.js"

export const createPost = async (req, res) => {
    const { organization, id } = req
    const { text } = req.body

    let media = null

    // If file uploaded, build media object
    if (req.file) {
        media = {
            url: req.file.path ?? null,
            type: req.file.mimetype.startsWith("video") ? "video" : "image",
        }
    }
    const post = await PostModel.create({
        organization,
        createdBy: id,
        type: "post",
        content: { text, media },
    })
    return res.status(201).json({ message: "Post Created..!", post })
}

export const getAllPost = async (req, res) => {
    const { organization } = req
    const post = await PostModel.find({ organization })
        .populate("createdBy", "name profile")
        .populate("likes", "name profile")
        .populate("dislikes", "name profile")
        .populate("comments.user", "name profile")
        .populate("poll.options.votes", "name profile")
        .sort({ createdAt: -1 })

    return res.status(200).json(post ?? [])
}

export const deletePost = async (req, res) => {
    const { postid } = req.params
    const { id } = req

    const post = await PostModel.findById(postid)
    if (!post) return res.status(404).json({ message: "Post not found" })

    if (post.createdBy.toString() !== id)
        return res
            .status(403)
            .json({ message: "You can delete only your own posts" })

    await PostModel.findByIdAndDelete(postid)
    return res.status(200).json({ message: "Post deleted successfully" })
}

export const likePost = async (req, res) => {
    const { postid } = req.params
    const { id } = req
    const post = await PostModel.findById(postid)
    if (!post) return res.status(404).json({ message: "Post not found" })

    post.dislikes = post.dislikes.filter((uid) => uid.toString() !== id)

    if (post.likes.some((uid) => uid.toString() === id)) {
        post.likes = post.likes.filter((uid) => uid.toString() !== id)
    } else {
        post.likes.push(id)
    }

    await post.save()
    res
        .status(200)
        .json({
            message: "change likes",
            likes: post.likes.length,
            dislikes: post.dislikes.length,
        })
}

export const dislikePost = async (req, res) => {
    const { postid } = req.params
    const { id } = req

    const post = await PostModel.findById(postid)
    if (!post)
        return res.status(404).json({ success: false, message: "Post not found" })

    post.likes = post.likes.filter((uid) => uid.toString() !== id)

    if (post.dislikes.some((uid) => uid.toString() === id)) {
        post.dislikes = post.dislikes.filter((uid) => uid.toString() !== id)
    } else {
        post.dislikes.push(id)
    }
    await post.save()

    res
        .status(200)
        .json({
            message: "change dislikes",
            likes: post.likes.length,
            dislikes: post.dislikes.length,
        })
}


export const addComment = async (req, res) => {
    const { postid } = req.params;
    const { id } = req;
    const { text } = req.body || {};

    if (!text)
        return res.status(400).json({ message: "Comment text is required" });

    const post = await PostModel.findById(postid);
    if (!post)
        return res.status(404).json({ message: "Post not found" });

    const comment = {
        user: id,
        text,
        createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();
    res.status(201).json({ comment });

}

export const deleteComment = async (req, res) => {
    const { postid, commentid } = req.params;
    const { id } = req;

    const post = await PostModel.findById(postid);
    if (!post)
        return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentid);
    if (!comment)
        return res.status(404).json({ success: false, message: "Comment not found" });

    if (comment.user.toString() !== id)
        return res.status(403).json({ success: false, message: "You can delete only your own comment" });

    post.comments = post.comments.filter(c => c._id.toString() !== commentid);
    await post.save();

    return res.status(200).json({ success: true, message: "Comment deleted" });
}

// create poll
export const createPoll = async (req, res) => {
    const { id, organization } = req;
    const { question, options, expiresAt } = req.body;

    if (!question || !options || !Array.isArray(options) || options.length < 2)
        return res.status(400).json({ success: false, message: "Poll must have a question and at least 2 options" });

    const pollOptions = options.map(opt => ({ option: opt, votes: [] }));

    const pollPost = await PostModel.create({
        organization,
        createdBy: id,
        type: "poll",
        poll: {
            question,
            options: pollOptions,
            expiresAt: expiresAt || null
        }
    });

    return res.status(201).json({ poll: pollPost });

}


export const votePoll = async (req, res) => {
    const { id } = req;
    const { postid, optionIndex } = req.params;

    const post = await PostModel.findById(postid);

    if (!post || post.type !== "poll")
        return res.status(404).json({ message: "Poll not found" });

    const option = post.poll.options[optionIndex];
    if (!option) return res.status(400).json({ message: "Invalid option index" });

    post.poll.options.forEach(opt => {
        opt.votes = opt.votes.filter(uid => uid.toString() !== id);
    });

    option.votes.push(id);
    await post.save();

    return res.status(200).json({ poll: post.poll });
}

export const removeVote = async (req, res) => {
    const { id } = req;
    const { postid } = req.params;

    const post = await PostModel.findById(postid);
    if (!post || post.type !== "poll")
        return res.status(404).json({ message: "Poll not found" });

    post.poll.options.forEach(opt => {
        opt.votes = opt.votes.filter(uid => uid.toString() !== id);
    });

    await post.save();
    return res.status(200).json({ message: "Vote removed", poll: post.poll });

}