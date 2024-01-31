var channel, connection;
import amqp from "amqplib";

import readAndSentLog from "../helpers/utils";

const connectQueue = async () => {
  try {
    const queue = "testQueue";
    connection = await amqp.connect("amqp://127.0.0.1:5672");
    channel = await connection.createChannel();
    channel.prefetch(5);

    await channel.assertQueue(queue, {
      durable: true,
    });

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    console.log("start", performance.now());

    channel.consume(
      queue,
      (data) => {
        return new Promise(async (resolve, reject) => {
          const log = Buffer.from(data.content).toString();

          try {
            await readAndSentLog(log);
            channel.ack(data);
            resolve(true);
          } catch (e) {
            reject(e);
          }
        });
      },
      {
        noAck: false,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export default connectQueue;
