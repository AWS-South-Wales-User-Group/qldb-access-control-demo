const { FileSystemCredentials } = require('aws-sdk');
const { getQldbDriver } = require('./helper/get-qldb-driver');

let driver;

async function main() {

    if (process.argv.length != 3) {
        console.log(`Invalid number of arguments passed in: node create-table TABLE_NAME`)
        process.exit(1);
    }

    const args = process.argv.slice(2);
    const tableName = args[0];
    
    // Use default settings
    console.log("Create QLDB Driver");
    const driver = getQldbDriver();
    console.log(`Attempting to create table ${tableName}`);
    await driver.executeLambda(async (txn) => {

        try {
            await createTable(txn, tableName);
            console.log('Table created');
        } catch (e) {
            console.log(`Error creating table: ${e}`);
            process.exit(1);
        }
    });
    driver.close();
}

async function createTable(txn, tableName) {
    const statement = `CREATE TABLE ${tableName}`;
    return txn.execute(statement)
}

main();