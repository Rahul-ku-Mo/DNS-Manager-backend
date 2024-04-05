const {
  Route53Client,
  ChangeResourceRecordSetsCommand,
} = require("@aws-sdk/client-route-53");

exports.client = new Route53Client({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

exports.prepareRecord = (record) => {
  let resourceRecords;
  let recordName = `${record.domain}.mytestprotocol.com.`;

  if (record.type === "MX") {
    resourceRecords = [{ Value: `${record.priority} ${record.value}` }];
  } else if (record.type === "SRV") {
    resourceRecords = [
      {
        Value: `${record.priority} ${record.weight} ${record.port} ${record.target}`,
      },
    ];
  } else if (record.type === "DS") {
    resourceRecords = [
      {
        Value: `${record.keyTag} ${record.algorithm} ${record.digestType} ${record.digest}`,
      },
    ];
  } else if (record.type === "PTR" || record.type === "NS") {
    recordName = record.value;
    resourceRecords = [{ Value: record.value }];
  } else if (record.type === "TXT") {
    resourceRecords = [{ Value: `"${record.value}"` }];
  } else {
    resourceRecords = [{ Value: record.value }];
  }

  return { resourceRecords, recordName };
};

exports.createRoute53Record = async (record) => {
  const { resourceRecords, recordName } = this.prepareRecord(record);

  const params = {
    HostedZoneId: process.env.HOSTED_ZONE_ID,
    ChangeBatch: {
      Changes: [
        {
          Action: "CREATE",
          ResourceRecordSet: {
            Name: recordName,
            Type: record.type,
            TTL: parseInt(record.ttl),
            ResourceRecords: resourceRecords,
          },
        },
      ],
    },
  };

  const command = new ChangeResourceRecordSetsCommand(params);
  return await this.client.send(command);
};

exports.deleteRoute53Record = async (record) => {
  const { resourceRecords, recordName } = this.prepareRecord(record);

  const params = {
    HostedZoneId: process.env.HOSTED_ZONE_ID,
    ChangeBatch: {
      Changes: [
        {
          Action: "DELETE",
          ResourceRecordSet: {
            Name: recordName,
            Type: record.type,
            TTL: parseInt(record.ttl),
            ResourceRecords: resourceRecords,
          },
        },
      ],
    },
  };

  const command = new ChangeResourceRecordSetsCommand(params);
  return await this.client.send(command);
};

exports.updateRoute53Record = async (record) => {
  const { resourceRecords, recordName } = this.prepareRecord(record);

  const params = {
    HostedZoneId: process.env.HOSTED_ZONE_ID,
    ChangeBatch: {
      Changes: [
        {
          Action: "UPSERT",
          ResourceRecordSet: {
            Name: recordName,
            Type: record.type,
            TTL: parseInt(record.ttl),
            ResourceRecords: resourceRecords,
          },
        },
      ],
    },
  };

  const command = new ChangeResourceRecordSetsCommand(params);
  return await this.client.send(command);
};

exports.createRoute53BulkRecord = async (records) => {
  const changes = records.map((record) => {
    const { resourceRecords, recordName } = this.prepareRecord(record);

    return {
      Action: "CREATE",
      ResourceRecordSet: {
        Name: recordName,
        Type: record.type,
        TTL: parseInt(record.ttl),
        ResourceRecords: resourceRecords,
      },
    };
  });

  const params = {
    HostedZoneId: process.env.HOSTED_ZONE_ID,
    ChangeBatch: {
      Changes: changes,
    },
  };

  const command = new ChangeResourceRecordSetsCommand(params);
  return await this.client.send(command);
};
