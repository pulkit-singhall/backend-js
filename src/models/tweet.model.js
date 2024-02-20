/*
    aggregation pipelines 
    array [{pipeline1},{pipeline2},{pipelineN}]

    The returned documents are returned in the form of array only.  
*/

import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        content: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

export const Tweet = mongoose.model("Tweet", tweetSchema);