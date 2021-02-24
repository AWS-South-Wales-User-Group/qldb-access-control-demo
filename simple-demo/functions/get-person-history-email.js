const { FileSystemCredentials } = require('aws-sdk');
const { getQldbDriver } = require('./helper/get-qldb-driver');

let driver;

async function main() {

    if (process.argv.length != 3) {
        console.log(`Invalid number of arguments passed in: node get-person-history-email EMAIL`)
        process.exit(1);
    }

    const args = process.argv.slice(2);
    const email = args[0];

    console.log("Create QLDB Driver");
    const driver = getQldbDriver();
    console.log(`Attempting to get Person history`);

    try {
        await driver.executeLambda(async (txn) => {

            const idDoc = await getIdByEmail(txn, email);
            const docIdArray = idDoc.getResultList();
            if (docIdArray.length === 0) {
                console.log('No record found');
                process.exit(1);
            }
            const id = docIdArray[0].get('id').stringValue();
            const result = await getPersonHistory(txn, id);
            const resultList = result.getResultList();
            if (resultList.length === 0) {
                console.log('No record found');
                process.exit(1);
            }
            const person = JSON.stringify(resultList, null, 2)
            console.log(`Retrieved person record:\n ${person}`)
        });
    
    } catch (e) {
        console.log(`Error: ${e}`);
        process.exit(1);
    }
    driver.close();
}

async function getIdByEmail(txn, email) {
    const statement = 'SELECT id FROM Person WHERE email = ?';
    return txn.execute(statement, email);
}

async function getPersonHistory(txn, id) {
    const statement = 'SELECT * FROM history(Person) WHERE metadata.id = ?';
    return txn.execute(statement, id);
}

main();