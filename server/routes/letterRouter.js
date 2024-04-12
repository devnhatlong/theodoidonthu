const router = require("express").Router();
const ctrls = require("../controllers/letterController");
const { verifyAccessToken } = require("../middlewares/verifyToken");

router.post("/create-letter", verifyAccessToken, ctrls.createLetter);
router.get("/get-letter", verifyAccessToken, ctrls.getLetter);
router.get("/get-all-letter", verifyAccessToken, ctrls.getAllLetter);
router.get('/search', verifyAccessToken, ctrls.searchLetters);
router.put("/update-letter/:id", verifyAccessToken, ctrls.updateLetter);
router.delete("/delete-letter/:id", verifyAccessToken, ctrls.deleteLetter);
// router.delete("/delete-multiple-letter/:id", verifyAccessToken, ctrls.deleteUser);

module.exports = router;

// CRUD | Create - Read - Update - Delete | POST - GET - PUT - DELETE
// CREATE (POST) + PUT => req.body
// GET + DELETE => req.query
