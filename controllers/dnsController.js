const { prisma } = require("../db");
const {
  createHostedZoneAndRecord,
  updateRoute53Record,
  deleteRoute53Record,
  createRoute53BulkRecord,
} = require("../services/awsRoute53");

exports.createRecord = async (req, res) => {
  const { hostedZoneData, record } = req.body;
  
  try {
    const awsResponse = await createHostedZoneAndRecord(hostedZoneData, record);
    
    const newRecord = await prisma.dNSRecord.create({
      data: {
        domain: record.domain,
        type: record.type,
        ttl: parseInt(record.ttl),
        value: record.value,
      },
    });

  
    res.status(201).json({ message: "success", data: newRecord, awsResponse });
  } catch (error) {
    res.status(500).json({ message: "error", data: error.message });
  }
};

exports.createBulkRecords = async (req, res) => {
  const { records } = req.body;

  try {
    const awsResponse = await createRoute53BulkRecord(records);

    const newRecords = await prisma.dNSRecord.createMany({
      data: records.map((record) => ({
        domain: record.domain,
        type: record.type,
        ttl: parseInt(record.ttl),
        value: record.value,
      })),
    });

    res
      .status(201)
      .json({ message: "success", data: newRecords, awsResponse: awsResponse });
  } catch (error) {
    res.status(500).json({
      message: "error",
      data: error.message,
    });
  }
};

// Function to get DNS records for a domain
exports.getRecords = async (req, res) => {
  // Implementation logic to get DNS records
  try {
    const dnsRecords = await prisma.dNSRecord.findMany();

    res.status(200).json({ message: "success", data: dnsRecords });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Function to update a DNS record
exports.updateRecord = async (req, res) => {
  const { recordId } = req.params;
  const { record } = req.body;

  try {
    const awsResponse = await updateRoute53Record(record);

    const updatedRecord = await prisma.dNSRecord.update({
      where: { id: recordId },
      data: {
        domain: record.domain,
        type: record.type,
        ttl: parseInt(record.ttl),
        value: record.value,
      },
    });

    res.status(200).json({
      message: "success",
      data: updatedRecord,
      awsResponse: awsResponse,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Function to delete a DNS record
exports.deleteRecord = async (req, res) => {
  const { recordId } = req.params;

  try {
    const record = await prisma.dNSRecord.findUnique({
      where: { id: recordId },
    });

    const awsResponse = await deleteRoute53Record(record);

    await prisma.dNSRecord.delete({
      where: { id: recordId },
    });

    res.status(204).json({ message: "success", awsResponse: awsResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
