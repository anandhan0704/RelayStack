const fs = require("node:fs");
const path = require("node:path");

const spoolDir = path.resolve(__dirname, "../var/spool");

exports.hook_queue = function (next, connection) {
  const txn = connection?.transaction;

  if (!txn) {
    return next(DENYSOFT, "Missing SMTP transaction");
  }

  fs.mkdirSync(spoolDir, { recursive: true });

  const basePath = path.join(spoolDir, `${txn.uuid}`);
  const emlPath = `${basePath}.eml`;
  const jsonPath = `${basePath}.json`;
  const writeStream = fs.createWriteStream(emlPath);

  const metadata = {
    id: txn.uuid,
    mailFrom: txn.mail_from?.address?.(),
    rcptTo: txn.rcpt_to?.map((recipient) => recipient.address?.() ?? String(recipient)) ?? [],
    remoteIp: connection?.remote?.ip || connection?.remote_ip,
    capturedAt: new Date().toISOString()
  };

  fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2));

  writeStream.once("error", (error) => {
    connection.logerror(this, error);
    next(DENYSOFT, "Unable to capture message");
  });

  writeStream.once("close", () => {
    connection.loginfo(this, `Captured message ${txn.uuid} to ${emlPath}`);
    next(OK, "Queued by RelayStack MTA");
  });

  txn.message_stream.pipe(writeStream);
};

