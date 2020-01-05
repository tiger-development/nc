
// Functions to build and run keychain transactions on blockchain

function buildShip(user, planetId, shipName) {
    var scJson = {};
    var scCommand = {};
    // Create Command
    scJson["username"] = user;
    scJson["type"] = "buildship";
    scCommand["tr_var1"] = planetId;
    scCommand["tr_var2"] = shipName;

    scJson["command"] = scCommand;
    var finalJson = JSON.stringify(scJson);

    keychainCustomJson(user, 'nextcolony', 'Posting', finalJson, 'displayName')
}

function upgradeBuilding(user, planetId, buildingName) {
    var scJson = {};
    var scCommand = {};
    // Create Command
    scJson["username"] = user;
    scJson["type"] = "upgrade";
    scCommand["tr_var1"] = planetId;
    scCommand["tr_var2"] = buildingName;

    scJson["command"] = scCommand;
    var finalJson = JSON.stringify(scJson);

    keychainCustomJson(user, 'nextcolony', 'Posting', finalJson, 'displayName')
}

function ask(user, category, itemUID, price) {
    var scJson = {};
    var scCommand = {};
    // Create Command
    scJson["username"] = user;
    scJson["type"] = "ask";
    scCommand["tr_var1"] = category;
    scCommand["tr_var2"] = uid;
    scCommand["tr_var3"] = price;
    scCommand["tr_var4"] = "null";

    scJson["command"] = scCommand;
    var finalJson = JSON.stringify(scJson);

    keychainCustomJson(user, 'nextcolony', 'Posting', finalJson, 'displayName')
}

function exploreSpace(user, planetId, x, y, shipName) {
    var scJson = {};
    var scCommand = {};
    scJson["username"] = user;
    scJson["type"] = "explorespace";
    scCommand["tr_var1"] = planetId;
    scCommand["tr_var2"] = x;
    scCommand["tr_var3"] = y;
    scCommand["tr_var4"] = shipName;
    scJson["command"] = scCommand;
    var finalJson = JSON.stringify(scJson);

    keychainCustomJson(user, 'nextcolony', 'Posting', finalJson, 'displayName')
}

function processKeychainTransactions(user, transactions, maxProcess) {

    let transactionsToProcess = Math.min(maxProcess, transactions.length)

    if (transactionsToProcess > 0) {
        processKeychainTransactionWithDelay()
    } else {
        console.log("No transactions to process.")
    }

    function processKeychainTransactionWithDelay() {
        transactionsToProcess-=1
        console.log(transactionsToProcess)
        let transaction = transactions.shift();
        if (transaction.type == "upgradeBuilding") {
            console.log(user, transaction.planetId, transaction.name)
            upgradeBuilding(user, transaction.planetId, transaction.name)
        } else if (transaction.type == "buildShip") {
            buildShip(user, transaction.planetId, transaction.name)
        } else if (transaction.type == "explorespace") {
            exploreSpace(user, transaction.planetId, transaction.x, transaction.y, transaction.shipName)
        } else if (transaction.type == "sellShip") {
            ask(user, transaction.category, transaction.itemUID, transaction.price)
        }

        if (transactionsToProcess > 0) {
            setTimeout(processKeychainTransactionWithDelay, 1000);
        } else {
            console.log("Transactions complete")
        }
    }
}

function keychainCustomJson(account_name, custom_json_id, key_type, json, display_name) {
    steem_keychain.requestCustomJson(account_name, custom_json_id, key_type, json, display_name, function(response) {
        console.log(response);
    });
}
