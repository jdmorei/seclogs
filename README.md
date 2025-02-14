# SecLogs

**Decentralized and Secure Blockchain Solution for Tamper-proof Logging Events**

## Overview

SecLogs is a decentralized application designed to provide tamper-proof logging by leveraging blockchain technology. This ensures that all logged events are immutable and securely stored, preventing unauthorized alterations and ensuring data integrity.

## Features

- **Decentralized Logging:** Utilizes blockchain to distribute log entries across multiple nodes, eliminating single points of failure.
- **Tamper-Proof Records:** Ensures that once an event is logged, it cannot be altered or deleted.
- **Transparent Audit Trail:** Provides a clear and verifiable history of all logged events.
- **Secure Access:** Implements robust authentication and authorization mechanisms to protect log data.

## Project Structure

The repository is organized as follows:

- **config/**: Contains configuration files for the application, including the Syslog-ng server configuration.
- **logManagementServer/**: Houses the server-side code responsible for managing log entries.
- **logModule/**: Includes modules and components related to logging functionalities.
- **.dockerignore**: Specifies files and directories to be ignored by Docker.
- **DockerFile**: Defines the Docker image configuration for the application.
- **docker-compose.yaml**: Configuration file for Docker Compose to set up the application environment.
- **LICENSE**: The project's license information.

## Technologies Used

- **Express.js**: A lightweight and flexible Node.js web framework used in the log management server. [Learn more](https://expressjs.com/)
- **MongoDB**: NoSQL database used for storing logs efficiently. [Learn more](https://www.mongodb.com/)
- **Syslog-ng**: Log collection and forwarding tool. [Learn more](https://www.syslog-ng.com/)
- **Web3.js**: Library for interacting with the blockchain, ensuring decentralized logging. [Learn more](https://web3js.readthedocs.io/)
- **PrimeNG**: UI component library for Angular-based frontend applications. [Learn more](https://www.primefaces.org/primeng/)
- **Docker**: Containerization platform to streamline deployment. [Learn more](https://www.docker.com/)

## Getting Started


To set up and run SecLogs locally, follow these steps:

### 1. Clone the Repository:

```bash
git clone https://github.com/jdmorei/seclogs.git
cd seclogs
```

### 2. Install Dependencies

Ensure you have Node.js installed on your system, then run:

```bash
cd logManagementServer
npm install
cd ../logModule
npm install
```

### 3. Run Services Manually

#### Install MongoDB
Ensure that MongoDB is installed on your system. You can install it using the following commands:

**For Debian/Ubuntu:**
```bash
sudo apt update && sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**For CentOS/RHEL:**
```bash
sudo yum install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

For more details on MongoDB installation and configuration, visit [MongoDB's official documentation](https://www.mongodb.com/docs/).

#### Install Syslog-ng
Ensure that Syslog-ng is installed on your system. You can install it using the following commands:

**For Debian/Ubuntu:**
```bash
sudo apt update && sudo apt install syslog-ng
```

**For CentOS/RHEL:**
```bash
sudo yum install epel-release
sudo yum install syslog-ng
```

For more details on Syslog-ng installation and configuration, visit [Syslog-ng's official documentation](https://www.syslog-ng.com/).

#### Running the Syslog-ng Server
```bash
syslog-ng -f config/syslog-ng.conf
```

#### Running the Log Management Server
```bash
cd logManagementServer
node server.js
```

#### Running the Log Module
```bash
cd logModule
node index.js
```

### 4. Running Services with Docker (Optional)
If you prefer using Docker, you can start services with:

```bash
docker-compose up --build
```

To stop any service manually, use `Ctrl+C` in the terminal. To stop Docker services, use:

```bash
docker-compose down <service_name>
```

Replace `<service_name>` with the name of the service you want to stop.

## Environment Variables

You can find a `.env-example` file inside each project directory, which contains all the necessary environment variables for configuring the application.

## Usage

After setting up the application:

- **Logging Events:** Use the provided API endpoints or interfaces to log events into the system.
- **Viewing Logs:** Access the log management dashboard to view and audit logged events.
- **Configuration:** Modify settings in the `config/` directory to tailor the application to your needs.

For more information, refer to the paper available at [link].


## Contributing

We welcome contributions to enhance SecLogs. To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes with clear and concise messages.
4. Submit a pull request detailing your changes and the motivation behind them.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/jdmorei/seclogs/blob/main/LICENSE) file for more details.
