const amqp = require("amqplib");

const mode = process.env.RELAYSTACK_MTA_MODE || process.env.MTA_MODE || "deliver";
const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const statusQueue = "relaystack.email.status";

let channelPromise;

function getChannel() {
  if (!channelPromise) {
    channelPromise = amqp.connect(rabbitmqUrl).then(async (connection) => {
      const channel = await connection.createChannel();
      await channel.assertQueue(statusQueue, { durable: true });
      return channel;
    });
  }

  return channelPromise;
}

async function publishStatus(payload) {
  const channel = await getChannel();
  channel.sendToQueue(statusQueue, Buffer.from(JSON.stringify(payload)), {
    persistent: true,
    contentType: "application/json"
  });
}

function messageIdFromHmail(hmail) {
  return hmail?.todo?.notes?.relaystackMessageId;
}

if (mode === "deliver") {
  exports.hook_delivered = function (next, hmail, host, ip, response, delay, port, modeValue, okRecips) {
    const messageId = messageIdFromHmail(hmail);

    if (messageId) {
      void publishStatus({
        messageId,
        harakaUuid: hmail.todo?.uuid,
        status: "delivered",
        recipient: okRecips?.[0],
        response: typeof response === "string" ? response : undefined
      }).catch((error) => {
        hmail.logerror(`Failed to publish delivered status: ${error.message}`);
      });
    }

    next();
  };

  exports.hook_bounce = function (next, hmail, error) {
    const messageId = messageIdFromHmail(hmail);

    if (messageId) {
      void publishStatus({
        messageId,
        harakaUuid: hmail.todo?.uuid,
        status: "failed",
        error: error?.message || String(error)
      }).catch((publishError) => {
        hmail.logerror(`Failed to publish bounce status: ${publishError.message}`);
      });
    }

    next();
  };
}
