const router = require("express").Router();
const ctrls = require("../controllers/userController");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/register", [verifyAccessToken, isAdmin], ctrls.register);
router.post("/login", ctrls.login);
router.get("/get-user", verifyAccessToken, ctrls.getUser);
router.get("/get-all-user", [verifyAccessToken, isAdmin], ctrls.getAllUser);
router.get("/get-detail-user/:id", [verifyAccessToken, isAdmin], ctrls.getDetailUser);
router.post("/refreshtoken", ctrls.refreshAccessToken);
router.post("/logout", ctrls.logout);
router.get("/forgot-password", ctrls.forgotPassword);
router.put("/reset-password", ctrls.resetPassword);
router.get("/", [verifyAccessToken, isAdmin], ctrls.getUsers);
router.delete("/delete-user/:id", [verifyAccessToken, isAdmin], ctrls.deleteUser);
router.delete("/delete-multiple-users", [verifyAccessToken, isAdmin], ctrls.deleteMultipleUsers);
router.put("/update-user", verifyAccessToken, ctrls.updateUser);
router.put("/change-password-by-admin/:id", [verifyAccessToken, isAdmin], ctrls.changePasswordByAdmin)
router.put("/:uid", [verifyAccessToken, isAdmin], ctrls.updateUserByAdmin);

module.exports = router;

// CRUD | Create - Read - Update - Delete | POST - GET - PUT - DELETE
// CREATE (POST) + PUT => req.body
// GET + DELETE => req.query
