let keychainFunctioning = false;




// On page load
window.addEventListener('load', (event) => {
    // Temp
    console.log(window.steem_keychain)

    // Get the username input field
    const usernameSelect = document.getElementById('usernameSelect');

    // Get login button
    const loginButton = document.getElementById('login');

    // Get logout button
    const logoutButton = document.getElementById('logout');

    // Get status output
    const status = document.getElementById('status');

    // Get mission buttons
    const runLoginMissionButton = document.getElementById('runLoginMission');
    const runInfoMissionButton = document.getElementById('runInfoMission');

    var loginMissionSelect = document.getElementById("loginMissionSelect")
    var infoMissionSelect = document.getElementById("infoMissionSelect")

    const maxProcessField = document.getElementById("numberOfTransactions")

    const outputNode = document.getElementById('output');

    //let user = inputs.elements[0].value
    //let mission = inputs.elements[0].value

    // Check Steem Keychain extension installed and functioning
    if(window.steem_keychain) {
        let keychain = window.steem_keychain;
        console.log('Keychain installed');
        // Request handshake
        steem_keychain.requestHandshake(function() {
            console.log('Handshake received!');
            keychainFunctioning = true
        });

    // Steem Keychain extension not installed...
    } else {
        console.log('Keychain not installed');
    }


    // Check if anyone is already logged in or set for info
    let user = getUser();
    let logInStatus = getLogInStatus();

    if (user && logInStatus == "keychain") {
        loginDisplay(user)
    } else if (user && logInStatus == "setForInfo") {
        loginDisplay(user)
    } else {
        logoutDisplay()
    }

    // When login button is clicked
    loginButton.addEventListener('click', (e) => {
            // Stop the default action from doing anything
            e.preventDefault();

            // Get the value from the username field
            userValue = usernameSelect.value.slice(1, usernameSelect.value.length);

            // Check window.steem_keychain exists
            if (keychainFunctioning == true) {

                steem_keychain.requestSignBuffer(userValue, 'login', 'Posting', response => {
                    if (user && logInStatus == "keychain") {
                        // do nothing
                    } else {
                        user = setUser(userValue);
                        logInStatus = setLogInStatus("keychain")
                        loginDisplay(userValue)
                    }
                });
            } else {
                console.log('Keychain not installed');
                user = setUser(userValue);
                logInStatus = setLogInStatus("setForInfo")
                loginDisplay(userValue)
            }
    });

    // When the logout button is clicked
    logoutButton.addEventListener('click', (e) => {
        // Stop the default action from doing anything
        e.preventDefault();
        user = false
        logInStatus = false
        logoutUser();
        logoutDisplay()
    });

    runLoginMissionButton.addEventListener('click', (e) => {
        // Stop the default action from doing anything
        e.preventDefault();

        const mission = loginMissionSelect.value;
        const maxProcess = maxProcessField.value;

        if (user && logInStatus == "keychain") {
            runLoginMission(user, mission, maxProcess, outputNode);
        } else {
            console.log('User not logged in with keychain.');
        }
    });

    runInfoMissionButton.addEventListener('click', (e) => {
        // Stop the default action from doing anything
        e.preventDefault();

        const mission = infoMissionSelect.value;
        if (user && logInStatus == "setForInfo") {
            runInfoMission(user, mission, outputNode);
        } else {
            console.log('User not logged in for info.');
        }

    });


    function loginDisplay(user) {
        console.log("loginDisplay")
        loginButton.style.display = 'none';
        usernameSelect.style.display = 'none';
        logoutButton.style.display = 'initial';
        status.innerHTML = 'Logged in as ' + user;
    }

    function logoutDisplay() {
        console.log("logoutDisplay")
        logoutButton.style.display = 'none';
        loginButton.style.display = 'initial';
        usernameSelect.style.display = 'initial';
        status.innerHTML = 'You are not logged in.';
    }


});




// Login / logout functions
// ------------------------

// Store username in local storage
function setLogInStatus(loginStatus) {
    localStorage.setItem('loginStatus', loginStatus);
    return loginStatus
}

// Check if user logged in
function getLogInStatus() {
    const value = localStorage.getItem('loginStatus');
    return (value !== null) ? value : false;
}

// Store username in local storage
function setUser(user) {
    localStorage.setItem('user', user);
    return user
}

function getUser() {
    const value = localStorage.getItem('user');
    return (value !== null) ? value : false;
}

// Remove username from local storage
function logoutUser() {
    localStorage.setItem('loginStatus', false);
    localStorage.removeItem('user');
}





const launchTime = Date.now();
let workFlowMonitor = true



async function runLoginMission(user, mission, maxProcess, outputNode) {
    outputNode.innerHTML = ""

    if (mission == "check") {
        check(user)
    } else if (mission == "build ships") {
        buildShip(user, "P-ZCBO9MBOJ2O", "corvette")
    } else if (mission == "upgrade buildings") {
        console.log("runLoginMission - upgrade buildings")
        let buildingsTransactions = await findBuildingsToUpgrade(user, outputNode)
        //upgradeBuilding(user, "P-Z142YAEQFO0", "shieldgenerator")
        processKeychainTransactions(user, buildingsTransactions, maxProcess);
        // buildShip(user, "P-ZCBO9MBOJ2O", "corvette")
        //upgradeBuilding(user, planetId, buildingName)

    }
}

async function runInfoMission(user, mission, outputNode) {
    outputNode.innerHTML = ""

    if (mission == "targets") {
        targets(user, outputNode)
    } else if (mission == "snipes") {
        snipes(user,outputNode)
    } else if (mission == "buildings") {
        let buildingsTransactions  = await findBuildingsToUpgrade(user, outputNode)
    }
}

async function check(user) {

    // Steem Keychain extension installed
    if(window.steem_keychain) {
        console.log('Keychain installed');
        // Request handshake
        steem_keychain.requestHandshake(function() {
            console.log('Handshake received!');
        });
    // Steem Keychain extension not installed...
    } else {
        console.log('Keychain not installed');
    }

}


async function snipes(user, outputNode) {
    outputNode.innerHTML += "<br>"
    outputNode.innerHTML += "Explorer Missions And Snipes <br>"
    outputNode.innerHTML += "Time now: " + new Date(launchTime) + "<br>"

    let activeMissions = await getUserMissions(user, 1)
    let galaxyData = []

    let i = 0

    for (const mission of activeMissions) {

        let planetCoords = [mission.start_x, mission.start_y]
        let spaceCoords = [mission.end_x, mission.end_y]
        let missionDistance = distance(planetCoords, spaceCoords)

        galaxyData[i] = await getGalaxy(spaceCoords[0], spaceCoords[1])
        outputNode.innerHTML += "<br>"
        outputNode.innerHTML += mission.type + "<br>"
        outputNode.innerHTML += "Planet x: " + planetCoords[0] + " y: " + planetCoords[1] + "<br>"


        if (mission.type == "explorespace" && mission.result == null) {
            outputNode.innerHTML += "Space x: " + spaceCoords[0] + " y: " + spaceCoords[1] + "<br>"
            outputNode.innerHTML += "Distance: " + missionDistance.toFixed(2) + "<br>"

            for (explorer of galaxyData[i].explore) {

                if (explorer.date_return == null) {
                    outputNode.innerHTML += "explorer cancelled: " + explorer.user + "<br>"
                } else {
                    let arrival = new Date(explorer.date * 1000)
                    let timeRemaining = arrival - launchTime
                    outputNode.innerHTML += "explorer: " + explorer.user + " : " + arrival + "<br>"
                    let convertedTime = convertToHoursMinutes(timeRemaining)
                    outputNode.innerHTML += "time remaining: " + convertedTime[0] + "h " + convertedTime[1] + "m <br>"
                }
            }
        } else if (mission.type == "explorespace" && mission.result != null) {
            outputNode.innerHTML += mission.result + "<br>"
        } else {
            outputNode.innerHTML += "Destination x: " + spaceCoords[0] + " y: " + spaceCoords[1] + "<br>"
            outputNode.innerHTML += "Distance: " + missionDistance.toFixed(2) + "<br>"
        }

        i += 1
    }
}

function convertToHoursMinutes(time) {
    let hours = Math.floor(time/1000/3600)
    let minutes = Math.floor(time/1000/60 - hours*60)
    return [hours, minutes]
}

function distance(planetCoords, spaceCoords) {
    let xDistance = spaceCoords[0] - planetCoords[0]
    let yDistance = spaceCoords[1] - planetCoords[1]
    let distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance)
    return distance
}



async function missions(user) {
    let dataPlanets = await getPlanetsOfUser(user)

    let missionsData = []
    let explorerMissions = []

    let i = 0
    for (const planet of dataPlanets.planets) {
        missionsData[i] = await getMissions(user, planet.id)

        for (const mission of missionsData[i]) {
            let planet = mission.from_planet.name
            let arrival = new Date(mission.arrival * 1000)
            let cancelled = mission.cancel_trx
            let type = mission.type
            let result = mission.result
        }
        i += 1
    }
}



async function targets(user, outputNode) {
    let targetAccounts = []
    if (user == "miniature-tiger") {
        targetAccounts = ['loliver', 'aniestudio', 'xunityx', 'giornalista', 'elprutest', 'z3ll', 'mcoinz79']
    } else if (user == "tiger-zaps") {
        targetAccounts = ['chilis', 'ga-sm', 'anshia', 'balder', 'jomeszaros', 'arteaga-juan', 'dungeonandpig', 'velazblog', 'szf', 'pladozero']
    }

    for (const target of targetAccounts) {
        await checkPotentialForAttack(target, outputNode)
    }
}

async function checkPotentialForAttack(target, outputNode) {
    outputNode.innerHTML += "<br>" + target + "<br>"
    let dataPlanets = await getPlanetsOfUser(target)

    let planetData = []
    let planetResources = []
    let planetInfo = []
    let planetShips = []
    let i = 0
    for (const planet of dataPlanets.planets) {
        planetData[i] = await getPlanetResources(planet.id)
        planetResources[i] = await calculateCurrentResources(planetData[i])
        planetInfo[i] = await getPlanetInfo(planet.id)
        planetShips[i] = await getPlanetShips(target, planet.id)

        outputNode.innerHTML += planet.id + " : " + planet.name + "<br>"
        outputNode.innerHTML += "Resources -> coal:" + planetResources[i].coal + " ore:" + planetResources[i].ore + " copper:" + planetResources[i].copper + " uranium:" + planetResources[i].uranium + "<br>";
        outputNode.innerHTML += "Depots -> coal:" + planetData[i].coaldepot + " ore:" + planetData[i].oredepot + " copper:" + planetData[i].copperdepot + " uranium:" + planetData[i].uraniumdepot + "<br>";
        outputNode.innerHTML += "Shield charge:" + ((planetInfo[i].shieldcharge_busy - launchTime/1000) / 3600) + " Shield charged:" + planetInfo[i].shieldcharged + " Shield protection:" + ((planetInfo[i].shieldprotection_busy - launchTime/1000)/ 3600) + "<br>";
        console.log(planetInfo[i].shieldcharge_busy, planetInfo[i].shieldprotection, launchTime)
        i += 1
    }
}

async function getPlanetsOfUser(user) {
    let response = await fetch("https://api.nextcolony.io/loadplanets?user=" + user);
    let data = await response.json();
    return data
}

async function getPlanetResources(planetID) {
    let response = await fetch("https://api.nextcolony.io/loadqyt?id=" + planetID);
    let data = await response.json();
    return data
}

async function getPlanetInfo(planetID) {
    let response = await fetch("https://api.nextcolony.io/loadplanet?id=" + planetID);
    let data = await response.json();
    return data
}

async function getPlanetShips(user, planetID) {
    let response = await fetch("https://api.nextcolony.io/loadfleet?user=" + user + "&planetid=" + planetID);
    let data = await response.json();
    return data
}


async function getBuildings(planetID) {
    let response = await fetch("https://api.nextcolony.io/loadbuildings?id=" + planetID);
    let data = await response.json();
    return data
}


async function getMissions(user, planetID, active) {
    let response = await fetch("https://api.nextcolony.io/loadfleetmission?user=" + user + "&active=" + active + "&planetid=" + planetID);
    let data = await response.json();
    return data
}

async function getUserMissions(user, active) {
    let response = await fetch("https://api.nextcolony.io/loadfleetmission?user=" + user + "&active=" + active);
    let data = await response.json();
    return data
}

async function getGalaxy(xCoord, yCoord) {
    let height = 0
    let width = 0
    let response = await fetch("https://api.nextcolony.io/loadgalaxy?x=" + xCoord + "&y=" + yCoord + "&height=" + height + "&width=" + width);
    let data = await response.json();
    return data
}

function timeTranslation(time) {
    return new Date(time * 1000)
}

async function calculateCurrentResources(planet) {
  let timeSinceUpdate = ((launchTime - planet.lastUpdate * 1000) / 3600 / 1000);

  let coal = Math.min(updateResource(planet.coal, planet.coalrate, timeSinceUpdate), planet.coaldepot)
  let ore = Math.min(updateResource(planet.ore, planet.orerate, timeSinceUpdate), planet.oredepot)
  let copper = Math.min(updateResource(planet.copper, planet.copperrate, timeSinceUpdate), planet.copperdepot)
  let uranium = Math.min(updateResource(planet.uranium, planet.uraniumrate, timeSinceUpdate), planet.uraniumdepot)

  return {coal: coal, ore: ore, copper: copper, uranium: uranium}
}


function updateResource(resource, rate, hours) {
    return (resource + (rate / 24) * hours).toFixed(2)
}

async function fetchBuildingsData(user) {
    let dataPlanets = await getPlanetsOfUser(user);
    let buildingsData = [];

    let i = 0;
    for (const planet of dataPlanets.planets) {
        buildingsData[i] = await getBuildings(planet.id);
    }
    return buildingsData;
}

async function buildingsToUpgradeForPlanet(planetId, resources, buildings, minimumRequiredSkillLevel) {

    let scarceResource = findScarceResource(resources);
    let remainingResources = resources;

    //for (const building of buildings) {
    //    console.log(building.name, building[scarceResource])
    //}


    buildings.sort((a, b) => a[scarceResource] - b[scarceResource]);

    //for (const building of buildings) {
    //    console.log(building.name, building[scarceResource])
    //}


    let buildingsToUpgrade = [];

    let sufficient = true;

    for (const building of buildings) {
        if (sufficient == true) {

            // Check if building already being updated
            let busy = checkIfBuildingBusy(launchTime, building.busy)

            // Check if skill level greater than current level
            let nextSkill = checkIfNextSkillCompleted(building.current, building.skill)

            // Check if current skill below minimum required
            let upgradeRequired = false
            if (building.current < minimumRequiredSkillLevel) {
                upgradeRequired = true
            }

            if (busy == false && nextSkill == true && upgradeRequired == true) {
                let newRemainingResources = remainingResources;
                // Check if sufficient resources for upgrade
                sufficient = checkIfSufficientResources(building, remainingResources)

                if (sufficient == true) {
                    remainingResources = deductCosts(building, remainingResources)

                    let buildingInfo = {}

                    // Include name and current skill level
                    buildingInfo.type = "upgradeBuilding"
                    buildingInfo.planetId = planetId
                    buildingInfo.name = building.name
                    buildingInfo.current = building.current

                    // Include costs to update
                    //buildingInfo.coal = building.coal
                    //buildingInfo.ore = building.ore
                    //buildingInfo.copper = building.copper
                    //buildingInfo.uranium = building.uranium

                    buildingsToUpgrade.push(buildingInfo);
                }
            }
        }
    }

    return buildingsToUpgrade;
}

function deductCosts(building, remainingResources) {
    resourceTypes = ["coal", "ore", "copper", "uranium"]
    for (const resourceType of resourceTypes) {
        remainingResources[resourceType] = remainingResources[resourceType] - building[resourceType];
    }
    return remainingResources;
}

function checkIfSufficientResources(building, remainingResources) {
    let sufficient = true;
    resourceTypes = ["coal", "ore", "copper", "uranium"]

    for (const resourceType of resourceTypes) {
        if (remainingResources[resourceType] - building[resourceType] < 0) {
            sufficient = false;
        }
    }

    return sufficient;
}

function findScarceResource(resources) {
    resources.coal = resources.coal / 8
    resources.ore = resources.ore / 4
    resources.copper = resources.copper / 2
    resources.uranium = resources.uranium
    let resourceArray = Object.values(resources);
    let scarceResourceValue = Math.min(...resourceArray);
    let scarceResource = Object.keys(resources).find(key => resources[key] === scarceResourceValue)
    return scarceResource
}

function checkIfBuildingBusy(launchTime, busyTime) {
    if (busyTime - launchTime/1000 > 0) {
        return true;
    } else {
        return false;
    }
}

function checkIfNextSkillCompleted(current, skill) {
    if (skill > current) {
        return true
    } else {
        return false
    }
}


async function findBuildingsToUpgrade(user, outputNode) {

    console.log("buildingsInfo")
    let minimumRequiredSkillLevel = 18;

    let planetData = [];
    let planetResources = [];
    let buildingsData = [];
    let buildingsToUpgrade = [];
    let buildingsTransactions = [];

    let dataPlanets = await getPlanetsOfUser(user);
    //console.dir(dataPlanets)



    let i = 0;
    for (const planet of dataPlanets.planets) {
        planetData[i] = await getPlanetResources(planet.id)
        planetResources[i] = await calculateCurrentResources(planetData[i])
        buildingsData[i] = await getBuildings(planet.id);
        buildingsToUpgrade[i] = await buildingsToUpgradeForPlanet(planet.id, planetResources[i], buildingsData[i], minimumRequiredSkillLevel)
        for (const upgrade of buildingsToUpgrade[i]) {
            outputNode.innerHTML += upgrade.type + " " + upgrade.planetId + " " + upgrade.name + " " + upgrade.current + "<br>"
            buildingsTransactions.push(upgrade)
        }

        i += 1
    }

    console.dir(buildingsTransactions)
    return buildingsTransactions;
}


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
    //var appId = this.appId();

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
    //var appId = this.appId();

    keychainCustomJson(user, 'nextcolony', 'Posting', finalJson, 'displayName')

}



function processKeychainTransactions(user, transactions, maxProcess) {

    if (maxProcess > 0) {
        let transaction = transactions.shift();
        if (transaction.type == "upgradeBuilding") {
            console.log(user, transaction.planetId, transaction.name)
            upgradeBuilding(user, transaction.planetId, transaction.name)
        } else if (transaction.type == "buildShip") {
            buildShip(user, transaction.planetId, transaction.name)
        }

        setTimeout(processKeychainTransactions(user, transactions, maxProcess-1), 3000);
    }
}




function keychainCustomJson(account_name, custom_json_id, key_type, json, display_name) {
    steem_keychain.requestCustomJson(account_name, custom_json_id, key_type, json, display_name, function(response) {
        console.log(response);
    });
}
