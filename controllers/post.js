import Post from "../models/post.js";

export const postTestController = (req, res) => {
  return res.status(200).send({
    message: "Message send from the Post controller.",
  });
};

export const savePostController = async (req, res) => {
  try {
    const params = req.body;

    if (!params.text) {
      return res.status(400).send({
        status: "error",
        message: "There are missing fields",
      });
    }

    let newPublication = new Post(params);

    newPublication.user_id = req.user.userId;

    const publicationStored = await newPublication.save();

    if (!publicationStored) {
      return res.status(500).send({
        status: "error",
        message: "It was not possible to save the post",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "The post was saved successfully",
      publicationStored,
    });
  } catch (error) {
    console.log("Save post error", error);
    return res.status(500).send({
      status: "error",
      message: "Save post error",
    });
  }
};

export const getPostController = async (req, res) => {
  try {
    const publicationId = req.params.id;

    const publicationStored = await Post.findById(publicationId).populate(
      "user_id",
      "name last_name"
    );

    if (!publicationStored) {
      return res.status(500).send({
        status: "error",
        message: "The post does not exist",
      });
    }

    return res.status(200).send({
      status: "success",
      publication: publicationStored,
    });
  } catch (error) {
    console.log("Show post error", error);
    return res.status(500).send({
      status: "error",
      message: "Show post error",
    });
  }
};
