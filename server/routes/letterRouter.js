const router = require("express").Router();
const ctrls = require("../controllers/letterController");
const { upload } = require('../middlewares/multerMiddleware');
const { verifyAccessToken } = require("../middlewares/verifyToken");

router.post("/create-letter", verifyAccessToken, upload.array("uploadedFiles"), ctrls.createLetter);
router.get("/get-file/:id", ctrls.getFile);
router.get("/get-letter/:id", verifyAccessToken, ctrls.getLetter);
router.get("/get-all-letter", verifyAccessToken, ctrls.getAllLetter);
router.put("/update-letter/:id", verifyAccessToken, ctrls.updateLetter);
router.delete("/delete-letter/:id", verifyAccessToken, ctrls.deleteLetter);
router.delete("/delete-multiple-letters", verifyAccessToken, ctrls.deleteMultipleLetters);

module.exports = router;

// CRUD | Create - Read - Update - Delete | POST - GET - PUT - DELETE
// CREATE (POST) + PUT => req.body
// GET + DELETE => req.query
