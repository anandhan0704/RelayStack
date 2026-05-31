exports.hook_data_post = function (next, connection) {
  const txn = connection?.transaction;

  if (txn) {
    const messageId = txn.header.get("x-relaystack-message-id");

    if (messageId) {
      txn.notes.relaystackMessageId = messageId.trim();
    }
  }

  next();
};
