var channel, connection;
import amqp from "amqplib";
import readAndSentLog from "../helpers/utils";

const connectQueue = async () => {
  try {
    const queue = "testQueue";
    // Connect to the AMQP server and create a channel
    connection = await amqp.connect("amqp://127.0.0.1:5672");
    channel = await connection.createChannel();
    channel.prefetch(5); // Limit unacknowledged messages

    // Ensure the queue exists 
    await channel.assertQueue(queue, {
      durable: true,
    });

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    console.log("start", performance.now());

    // Start consuming messages from the queue
    channel.consume(
      queue,
      (data) => {
        return new Promise(async (resolve, reject) => {
          // Convert the message buffer to a string
          const log = Buffer.from(data.content).toString();

          try {
            await readAndSentLog(log); // Process the log
            channel.ack(data); // Acknowledge receipt
            resolve(true);
          } catch (e) {
            reject(e);
          }
        });
      },
      {
        noAck: false, // Manual acknowledgment is required
      }
    );
  } catch (error) {
    console.log(error); 
  }
};

export default connectQueue;
