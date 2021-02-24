const { FileSystemCredentials } = require('aws-sdk');
const { getQldbDriver } = require('./helper/get-qldb-driver');
const Faker = require('faker');

let driver;

async function main() {

    if (process.argv.length != 3) {
        console.log(`Invalid number of arguments passed in: node create-person EMAIL`)
        process.exit(1);
    }

    const args = process.argv.slice(2);
    const email = args[0];

    const street = `${Faker.address.streetName()}`;
    const state = `${Faker.address.state()}`;
    const zipCode = `${Faker.address.zipCode()}`;

    console.log("Create QLDB Driver");
    const driver = getQldbDriver();
    console.log(`Attempting to update Person document`);

    try {
        await driver.executeLambda(async (txn) => {

            // Check if the record already exists assuming email unique
            console.log('Check to see if email unique')
            const recordsReturned = await checkEmailUnique(txn, email);
            if (recordsReturned != 1) {
                process.exit(1);
            }

            const result = await updatePerson(txn, email, street, state, zipCode);
            console.log(`Person details updated`)
        });
    
    } catch (e) {
        console.log(`Error: ${e}`);
        process.exit(1);
    }
    driver.close();
}


async function checkEmailUnique(txn, email) {
    const query = 'SELECT email FROM Person AS b WHERE b.email = ?';
    let recordsReturned;
    await txn.execute(query, email).then((result) => {
      recordsReturned = result.getResultList().length;
      if (recordsReturned === 0) {
        console.log(`No records found for ${email}`);
      } else {
        console.log(`Record found for ${email}`);
      }
    });
    return recordsReturned;
}
      
async function updatePerson(txn, email, street, state, zipCode) {
    const statement = 'UPDATE Person SET street = ?, state = ?, zipCode = ? WHERE email = ?';
    return txn.execute(statement, street, state, zipCode, email);
}

main();