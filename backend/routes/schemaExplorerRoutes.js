const express = require("express");
const router = express.Router();

const schemaExplorer = require("../controllers/schemaExplorer");

router.get("/tables", schemaExplorer.getAllTables);
router.get("/table/:tableName", schemaExplorer.getAllDataFromTable);

module.exports = router;
