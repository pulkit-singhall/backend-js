import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const user = req.user;

    if (!channelId || channelId.trim() === "") {
        throw new ApiError(400, "Channel ID is required");
    }

    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(402, "Wrong Channel ID");
    }

    const alreadySubscribed = await Subscription.findOne({
        $and: [{ channel: channelId }, { subscriber: user._id }],
    });

    if (alreadySubscribed) {
        const deletedSubscriber = await Subscription.findByIdAndDelete(
            alreadySubscribed._id
        );
        console.log(alreadySubscribed);
        return res.status(201).json(
            new ApiResponse(
                201,
                {
                    toggledSubscription: deletedSubscriber,
                },
                "Subscription Toggled!"
            )
        );
    }

    const addedSubscriber = await Subscription.create({
        channel: channelId,
        subscriber: user._id,
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                toggledSubscription: addedSubscriber,
            },
            "Subscription Toggled!"
        )
    );
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId || channelId.trim() === "") {
        throw new ApiError(400, "Channel ID is required");
    }

    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(402, "Wrong Channel ID");
    }

    // aggregation
    const subscriberList = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscriberList",
            },
        },
        {
            $addFields: {
                subscribers: "$subscriberList.subscriber",
            },
        },
        {
            $project: {
                subscribers: 1,
            },
        },
    ]);

    if (!subscriberList || subscriberList.length === 0) {
        throw new ApiError(500, "Some Internal error in fetching subscribers");
    }

    const subscribers = subscriberList[0].subscribers;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                subscribers: subscribers,
            },
            "User Channel Subscribers Fetched!"
        )
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!subscriberId || subscriberId.trim() === "") {
        throw new ApiError(400, "Subscriber ID is required");
    }

    const subscriber = await User.findById(subscriberId);
    if (!subscriber) {
        throw new ApiError(402, "Wrong Subscriber ID");
    }

    // aggregation
    const channelList = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedToList",
            },
        },
        {
            $addFields: {
                subscribedTo: "$subscribedToList.channel",
            },
        },
        {
            $project: {
                subscribedTo: 1,
            },
        },
    ]);

    if (!channelList || channelList.length === 0) {
        throw new ApiError(
            500,
            "Some Internal error in fetching subscribedTo Channels"
        );
    }

    const subscribedTo = channelList[0].subscribedTo;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                subscribedTo: subscribedTo,
            },
            "User Channel SubscribedTo Fetched!"
        )
    );
});

export { toggleSubscription, getSubscribedChannels, getUserChannelSubscribers };
