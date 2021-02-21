const { FileSystemCredentials } = require('aws-sdk');
const { getQldbDriver } = require('./helper/get-qldb-driver');

let driver;

async function main() {

    if (process.argv.length != 4) {
        console.log(`Invalid number of arguments passed in: node create-index TABLE_NAME INDEX_NAME`)
        process.exit(1);
    }

    const args = process.argv.slice(2);
    const tableName = args[0];
    const indexName = args[1];

    // Use default settings
    console.log("Create QLDB Driver");
    const driver = getQldbDriver();
    console.log(`Attempting to add index ${indexName} to table ${tableName}`);
    try {
        await createIndex(driver, tableName, indexName);
    } catch (e) {
        console.log(`Error: ${e}`);
        process.exit(1);
    }
    driver.close();
}

async function createIndex(driver, tableName, indexAttribute) {
    const statement = `CREATE INDEX on ${tableName} (${indexAttribute})`;
    await driver.executeLambda(async (txn) => {
        return txn.execute(statement).then((result) => {
            console.log(`Successfully created index ${indexAttribute} on table ${tableName}.`);
            return result;
        });
    });
}

main();