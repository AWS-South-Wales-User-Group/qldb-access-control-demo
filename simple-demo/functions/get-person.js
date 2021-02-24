const { FileSystemCredentials } = require('aws-sdk');
const { getQldbDriver } = require('./helper/get-qldb-driver');

let driver;

async function main() {

    if (process.argv.length != 3) {
        console.log(`Invalid number of arguments passed in: node get-person EMAIL`)
        process.exit(1);
    }

    const args = process.argv.slice(2);
    const email = args[0];

    console.log("Create QLDB Driver");
    const driver = getQldbDriver();
    console.log(`Attempting to get Person document`);

    try {
        await driver.executeLambda(async (txn) => {
            const result = await getPerson(txn, email);
            const resultList = result.getResultList();
            if (resultList.length === 0) {
                console.log('No record found');
                process.exit(1);
            }
            const person = JSON.stringify(resultList[0], null, 2)
            console.log(`Retrieved person record:\n ${person}`)
        });
    
    } catch (e) {
        console.log(`Error: ${e}`);
        process.exit(1);
    }
    driver.close();
}

async function getPerson(txn, email) {
    const statement = 'SELECT * FROM Person WHERE email = ?';
    return txn.execute(statement, email);
}

main();