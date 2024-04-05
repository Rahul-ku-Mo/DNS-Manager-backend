const express = require("express");
const router = express.Router();
const dnsController = require("../controllers/dnsController");

// Route to create a DNS record
router.post("/", dnsController.createRecord).get("/", dnsController.getRecords);

router.post("/bulk", dnsController.createBulkRecords);

// Route to update a DNS record
router
  .put("/:recordId", dnsController.updateRecord)
  .delete("/:recordId", dnsController.deleteRecord);

module.exports = router;
