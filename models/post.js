import { Schema, model } from "mongoose";

import mongoosePaginate from "mongoose-paginate-v2";

const PostSchema = Schema({
  user_id: {
    type: Schema.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  file: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

PostSchema.plugin(mongoosePaginate);

export default model("Post", PostSchema, "posts");
