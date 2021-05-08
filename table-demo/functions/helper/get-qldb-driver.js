const { QldbDriver, RetryConfig } = require('amazon-qldb-driver-nodejs');
const https = require('https');

const qldbDriver = createQldbDriver();

function createQldbDriver() {
    const maxConcurrentTransactions = 10;
    const retryLimit = 4;
    const agentForQldb = new https.Agent({
        keepAlive: true,
        maxSockets: maxConcurrentTransactions
    });

    const serviceConfigurationOptions = {
        region: "eu-west-1",
        httpOptions: {
            agent: agentForQldb
        }
    };

    // Use driver's default backoff function for this example (no second parameter provided to RetryConfig)
    const retryConfig = new RetryConfig(retryLimit);
    const qldbDriver = new QldbDriver(process.env.LEDGER_NAME, serviceConfigurationOptions, maxConcurrentTransactions, retryConfig);
    return qldbDriver;
}

function getQldbDriver(){
  return createQldbDriver();
};

module.exports = {
  getQldbDriver
}