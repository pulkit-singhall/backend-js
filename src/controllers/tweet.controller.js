import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Tweet } from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
    const user = req.user;
    const { content } = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is missing");
    }

    const userId = user._id; // object Id only (not string)

    const newTweet = await Tweet.create({
        content: content,
        owner: userId,
    });

    if (!newTweet) {
        throw new ApiError(500, "Internal Error in creating a new tweet");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                tweet: newTweet,
            },
            "New Tweet Created"
        )
    );
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { newContent } = req.body;
    const user = req.user;

    if (!tweetId || tweetId.trim() === "") {
        throw new ApiError(400, "Tweet Id is required");
    }

    if (!newContent || newContent.trim() === "") {
        throw new ApiError(400, "New Content is missing");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(400, "Wrong Tweet Id");
    }

    const owner = tweet.owner;

    if (!user._id.equals(owner)) {
        throw new ApiError(402, "User cant update other tweets");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: newContent,
            },
        },
        {
            new: true,
        }
    );

    if (!updatedTweet) {
        throw new ApiError(500, "Internal Error in updating the tweet");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                updatedTweet: updatedTweet,
            },
            "Tweet Updated"
        )
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const user = req.user;

    if (!tweetId || tweetId.trim() === "") {
        throw new ApiError(400, "Tweet Id is required");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(400, "Tweet Id is wrong");
    }

    const owner = tweet.owner;

    if (!user._id.equals(owner)) {
        throw new ApiError(402, "User cant delete other tweets");
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deleteTweet) {
        throw new ApiError(500, "Internal Error in deleting the tweet");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                deletedTweet: deletedTweet,
            },
            "Tweet Deleted"
        )
    );
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username || username.trim() === "") {
        throw new ApiError(400, "Username Required");
    }

    // aggregation pipeline
    const userAggregate = await User.aggregate([
        // returns an array
        {
            $match: {
                username: username,
            },
        },
        {
            $lookup: {
                from: "tweets",
                localField: "_id",
                foreignField: "owner",
                as: "userTweets",
            },
        },
        {
            $project: {
                userTweets: 1,
            },
        },
    ]);

    if (!userAggregate || userAggregate.length === 0) {
        throw new ApiError(500, "Problem in fetching user tweets");
    }

    const userTweets = userAggregate[0].userTweets; // this is again an array

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                userTweets: userTweets,
            },
            "User Tweets Fetched Successfully"
        )
    );
});

const getTweetById = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId || tweetId.trim() === "") {
        throw new ApiError(400, "Tweet Id is required");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(400, "Wrong Tweet Id");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                tweet: tweet,
            },
            "Tweet Fetched Successfully"
        )
    );
});

export { createTweet, updateTweet, getUserTweets, deleteTweet, getTweetById };
