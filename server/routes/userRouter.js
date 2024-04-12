const router = require("express").Router();
const ctrls = require("../controllers/userController");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/register", ctrls.register);
router.post("/login", ctrls.login);
router.get("/get-user", verifyAccessToken, ctrls.getUser);
router.post("/refreshtoken", ctrls.refreshAccessToken);
router.post("/logout", ctrls.logout);
router.get("/forgot-password", ctrls.forgotPassword);
router.put("/reset-password", ctrls.resetPassword);
router.get("/", [verifyAccessToken, isAdmin], ctrls.getUsers);
router.delete("/", [verifyAccessToken, isAdmin], ctrls.deleteUser);
router.put("/update-user", verifyAccessToken, ctrls.updateUser);
router.put("/:uid", [verifyAccessToken, isAdmin], ctrls.updateUserByAdmin);

module.exports = router;

// CRUD | Create - Read - Update - Delete | POST - GET - PUT - DELETE
// CREATE (POST) + PUT => req.body
// GET + DELETE => req.query
