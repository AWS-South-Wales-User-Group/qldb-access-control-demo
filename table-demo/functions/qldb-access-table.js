/*
 * Lambda function used as a custom resource to create the table
 * in QLDB using CloudFormation
 */

const response = require('cfn-response-promise');

const { getQldbDriver } = require('./helper/get-qldb-driver');

let driver;

async function createTable(txn, tableName) {
  const statement = `CREATE TABLE ${tableName}`;
  return txn.execute(statement);
}

async function deleteTable(txn, tableName) {
  const statement = `DROP TABLE ${tableName}`;
  return txn.execute(statement);
}


module.exports.handler = async (event, context) => {
  console.log(`QLDB Table request received:\n${JSON.stringify(event, null, 2)}`);

  try {
    if (event.RequestType === 'Create') {
      console.log('Attempting to create QLDB table');

      const driver = getQldbDriver();
      const keeperTable = "Keeper";
      const vehicleTable = "Vehicle";
      let keeperId;
      let vehicleId;

      console.log(`Attempting to create tables`);

      
      await driver.executeLambda(async (txn) => {
  
          try {
            console.log('About to create Keeper table');
            const keeperResult = await createTable(txn, keeperTable);
            const keeperIdArray = keeperResult.getResultList();
            keeperId = keeperIdArray[0].get('tableId').stringValue();
            console.log('Keeper table created');

            console.log('About to create Vehicle table');
            const vehicleResult = await createTable(txn, vehicleTable);
            const vehicleIdArray = vehicleResult.getResultList();
            vehicleId = vehicleIdArray[0].get('tableId').stringValue();
            console.log('Vehicle table created');

          } catch (e) {
              console.error(`Error creating table: ${e}`);
              await response.send(event, context, response.FAILED);
          } finally {
            driver.close();
          }
      });

      const responseData = { requestType: event.RequestType, 'keeperId': keeperId, 'vehicleId': vehicleId  };
      await response.send(event, context, response.SUCCESS, responseData);
    } else if (event.RequestType === 'Delete') {

        console.log('Request received to delete QLDB table');
        // Do nothing as table will be deleted as part of deleting QLDB Ledger


        const driver = getQldbDriver();
        const keeperTable = "Keeper";
        const vehicleTable = "Vehicle";
        console.log(`Attempting to delete tables`);
        
        await driver.executeLambda(async (txn) => {
    
            try {
              console.log('About to delete Keeper table');
              const keeperResult = await deleteTable(txn, keeperTable);
              console.log('About to delete Vehicle table');
              const vehicleResult = await deleteTable(txn, vehicleTable);
            } catch (e) {
                console.error(`Error deleting table: ${e}`);
                await response.send(event, context, response.FAILED);
            } finally {
              driver.close();
            }
        });
        const responseData = { requestType: event.RequestType };
        await response.send(event, context, response.SUCCESS, responseData);
    } else {
      console.error('Did not recognise event type resource');
      await response.send(event, context, response.FAILED);
    }
  } catch (error) {
    console.error(`Failed to create table in custom resource: ${JSON.stringify(error)}`);
    await response.send(event, context, response.FAILED);
  }
};