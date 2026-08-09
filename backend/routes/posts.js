const express = require("express");
const router = express.Router();
const controller = require("../controllers/postsController");

router.get("/posts", controller.getPosts);
router.get("/posts/categories", controller.getCategories);
router.get("/posts/:idOrSlug", controller.getPost);
router.post("/posts", controller.createPost);
router.put("/posts/:id", controller.updatePost);
router.delete("/posts/:id", controller.deletePost);

module.exports = router;
