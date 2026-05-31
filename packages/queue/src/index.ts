import amqp from "amqplib";

export const EMAIL_SEND_QUEUE = "relaystack.email.send";
export const EMAIL_STATUS_QUEUE = "relaystack.email.status";

export type QueueClient = {
  publish: (queue: string, payload: unknown) => Promise<void>;
  consume: (queue: string, handler: (payload: unknown) => Promise<void>) => Promise<void>;
  close: () => Promise<void>;
};

export async function createQueueClient(url: string): Promise<QueueClient> {
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();

  await channel.assertQueue(EMAIL_SEND_QUEUE, { durable: true });
  await channel.assertQueue(EMAIL_STATUS_QUEUE, { durable: true });

  channel.prefetch(10);

  return {
    async publish(queue, payload) {
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
        persistent: true,
        contentType: "application/json"
      });
    },

    async consume(queue, handler) {
      await channel.consume(queue, (message) => {
        if (!message) {
          return;
        }

        void (async () => {
          try {
            const payload = JSON.parse(message.content.toString()) as unknown;
            await handler(payload);
            channel.ack(message);
          } catch (error) {
            channel.nack(message, false, false);
            console.error(`Queue handler failed for ${queue}:`, error);
          }
        })();
      });
    },

    async close() {
      await channel.close();
      await connection.close();
    }
  };
}
