const { FileSystemCredentials } = require('aws-sdk');
const { getQldbDriver } = require('./helper/get-qldb-driver');

let driver;

async function main() {

    if (process.argv.length != 3) {
        console.log(`Invalid number of arguments passed in: node create-table TABLE_NAME`)
        process.exit(1);
    }

    const tableName = process.argv.slice(2);
    console.log('tableName: ', tableName);
    
    // Use default settings
    console.log("Create QLDB Driver");
    const driver = getQldbDriver();
    console.log(`Create table ${tableName}`);
    await createTable(driver, tableName);
    driver.close();
}

async function createTable(driver, tableName) {
    await driver.executeLambda(async (txn) => {
        await txn.execute(`CREATE TABLE ${tableName}`);
    });
    await new Promise(resolve => setTimeout(resolve, 3000));
}


main();