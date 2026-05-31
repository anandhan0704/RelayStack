const mode = process.env.RELAYSTACK_MTA_MODE || process.env.MTA_MODE || "deliver";

exports.hook_rcpt = function (next, connection) {
  const remoteIp = connection?.remote?.ip || connection?.remote_ip || "";
  const allowed = remoteIp === "127.0.0.1" || remoteIp === "::1" || remoteIp === "::ffff:127.0.0.1";

  if (!allowed) {
    connection.logwarn(this, `Denied non-local SMTP submission from ${remoteIp}`);
    return next(DENY, "RelayStack MTA accepts local API submissions only");
  }

  if (mode === "deliver") {
    connection.relaying = true;
  }

  return next(OK);
};
