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

    const firstName = `${Faker.name.firstName()}`;
    const lastName = `${Faker.name.lastName()}`;
    const street = `${Faker.address.streetName()}`;
    const state = `${Faker.address.state()}`;
    const zipCode = `${Faker.address.zipCode()}`;

    const person = {
        firstName, lastName, email, street, state, zipCode
    };

    console.log("Create QLDB Driver");
    const driver = getQldbDriver();
    console.log(`Attempting to create new Person document`);

    try {
        await driver.executeLambda(async (txn) => {

            // Check if the record already exists assuming email unique
            console.log('Check to see if email unique')
            const recordsReturned = await checkEmailUnique(txn, email);
            if (recordsReturned != 0) {
                process.exit(1);
            }

            const result = await createPerson(txn, person);
            const docIdArray = result.getResultList();
            const id = docIdArray[0].get('documentId').stringValue();
            // Update the record to add the document ID as the GUID in the payload
            await addGuid(txn, id, email);
            const personDoc = {
                id, firstName, lastName, email, street, state, zipCode
            };
            console.log(`New person added:\n ${JSON.stringify(personDoc, null, 2)}`)
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
        console.log(`Record already exists for ${email}`);
      }
    });
    return recordsReturned;
}
      
 
async function addGuid(txn, docId, email) {
    const statement = 'UPDATE Person as b SET b.id = ? WHERE b.email = ?';
    return txn.execute(statement, docId, email);
  }



async function createPerson(txn, person) {
    const statement = 'INSERT INTO Person ?';
    return txn.execute(statement, person);
}

main();