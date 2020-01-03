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
        console.log("runLoginMission - build ships")
        //buildShip(user, "P-ZCBO9MBOJ2O", "corvette")
        let buildShipTransactions = await findShipsToBuild(user, outputNode)
        processKeychainTransactions(user, buildShipTransactions, maxProcess);

    } else if (mission == "upgrade buildings") {
        console.log("runLoginMission - upgrade buildings")
        let buildingsTransactions = await findBuildingsToUpgrade(user, outputNode)
        //upgradeBuilding(user, "P-Z142YAEQFO0", "shieldgenerator")
        processKeychainTransactions(user, buildingsTransactions, maxProcess);
        // buildShip(user, "P-ZCBO9MBOJ2O", "corvette")
        //upgradeBuilding(user, planetId, buildingName)
    } else if (mission == "send explorers") {
        console.log("runLoginMission - send explorers")
        let explorationTransactions = await findExplorationTransactions(user, outputNode)
        processKeychainTransactions(user, explorationTransactions, maxProcess);
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
    } else if (mission == "ships") {
        let buildShipTransactions = await findShipsToBuild(user, outputNode)
    } else if (mission == "market") {
        let marketInfo = await findMarketTrades(user, outputNode)
    } else if (mission == "send explorers") {
        let snipeTransactions = await findExplorationTransactions(user, outputNode)
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

        galaxyData[i] = await getGalaxy(spaceCoords[0], spaceCoords[1], 0, 0)
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

async function getPlanetShipyard(user, planetId) {
    let response = await fetch("https://api.nextcolony.io/planetshipyard?user=" + user + "&planet=" + planetId);
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

async function getPlanetMissionInfo(user, planetId) {
    let response = await fetch("https://api.nextcolony.io/missioninfo?user=" + user + "&planet=" + planetId);
    let data = await response.json();
    return data
}

async function getPlanetFleet(user, planetId) {
    let response = await fetch("https://api.nextcolony.io/planetfleet?user=" + user + "&planet=" + planetId);
    let data = await response.json();
    return data
}

async function getGalaxy(xCoord, yCoord, height, width) {
    //let height = 0
    //let width = 0
    let response = await fetch("https://api.nextcolony.io/loadgalaxy?x=" + xCoord + "&y=" + yCoord + "&height=" + height + "&width=" + width);
    let data = await response.json();
    return data
}

async function getMarketForShip(shipType, active, sold) {
    let stringAPI = "";
    if (sold==0) {
        stringAPI = "https://api.nextcolony.io/asks?active=" + active + "&type=" + shipType;
    } else if (sold==1) {
        stringAPI = "https://api.nextcolony.io/asks?active=" + active + "&sold=" + sold + "&orderby=sold&order=desc&type=" + shipType;
    }
    let response = await fetch(stringAPI)
    let data = await response.json();
    return data
}

async function getMarketForShipAndUser(user, shipType, active, sold) {
    let stringAPI = "";
    if (sold==0) {
        stringAPI = "https://api.nextcolony.io/asks?active=" + active + "&user=" + user + "&type=" + shipType;
    } else if (sold==1) {
        stringAPI = "https://api.nextcolony.io/asks?active=" + active + "&user=" + user + "&sold=" + sold + "&orderby=sold&order=desc&type=" + shipType;
    }
    let response = await fetch(stringAPI)
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

async function shipsToUpgradeForPlanet(planetId, resources, shipyard, shipPriority) {
    //let scarceResource = findScarceResource(JSON.parse(JSON.stringify(resources)));
    let remainingResources = JSON.parse(JSON.stringify(resources));

    let shipyardActivated = shipyard.filter(ship => ship.activated === true);
    //console.dir(shipyardActivated)
    let shipyardPriorityOnly = shipyardActivated.filter(ship => shipHasPriority(ship.type, shipPriority) === true);
    //console.dir(shipyardPriorityOnly)

    let shipyardWithPriority = shipyardPriorityOnly.map(ship => ({...ship, priority: shipPriority[ship.type]}))
    //console.dir(shipyardWithPriority)

    let shipyardWithSkills = shipyardWithPriority.filter(ship => shipHasSkills(ship) === true)

    let shipyardAvailableToBuild = shipyardWithSkills.filter(ship => shipbuildingBusy(launchTime, ship.busy_until) === false);

    shipyardAvailableToBuild.sort((a, b) => b.priority - a.priority);
    //console.dir(shipyardAvailableToBuild)

    let shipsToUpgrade = [];

    for (const ship of shipyardAvailableToBuild) {
         if (checkIfSufficientResourcesForShip(ship, remainingResources) === true) {
              remainingResources = deductCostsForShip(ship, remainingResources)

              // Create ship transaction and push to transaction list
              let shipInfo = {}
              shipInfo.type = "buildShip"
              shipInfo.planetId = planetId
              shipInfo.name = ship.type
              shipsToUpgrade.push(shipInfo);
         }

    }

    //console.log(shipsToUpgrade)
    return shipsToUpgrade;
}

async function buildingsToUpgradeForPlanet(planetId, resources, buildings, minimumRequiredSkillLevel) {

    let scarceResource = findScarceResource(JSON.parse(JSON.stringify(resources)));
    let remainingResources = JSON.parse(JSON.stringify(resources));

    buildings.sort((a, b) => a[scarceResource] - b[scarceResource]);

    let buildingsToUpgrade = [];

    let sufficient = true;

    for (const building of buildings) {
        if (sufficient == true) {
            //console.log(remainingResources)
            // Check if building already being updated
            let busy = checkIfBuildingBusy(launchTime, building.busy)

            // Check if skill level greater than current level
            let nextSkill = checkIfNextSkillCompleted(building.current, building.skill)

            // Check if current skill below minimum required
            let upgradeRequired = false
            if (building.current < minimumRequiredSkillLevel) {
                upgradeRequired = true
            }

            //console.log(building.name, "busy", busy, "nextSkill", nextSkill, "upgradeRequired", upgradeRequired)

            if (busy == false && nextSkill == true && upgradeRequired == true) {
                let newRemainingResources = remainingResources;
                // Check if sufficient resources for upgrade
                sufficient = checkIfSufficientResources(building, remainingResources)
                //console.log("sufficient", sufficient)
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

function deductCostsForShip(ship, remainingResources) {
    resourceTypes = ["coal", "ore", "copper", "uranium"]
    for (const resourceType of resourceTypes) {
        remainingResources[resourceType] = remainingResources[resourceType] - ship.costs[resourceType];
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

function checkIfSufficientResourcesForShip(ship, remainingResources) {
    let result = true;
    resourceTypes = ["coal", "ore", "copper", "uranium"]

    for (const resourceType of resourceTypes) {
        if (remainingResources[resourceType] - ship.costs[resourceType] < 0) {
            result = false;
        }
    }
    return result;
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

function shipHasPriority(type, shipPriority) {
    if (shipPriority[type] == undefined) {
        return false;
    } else {
        return true;
    }
}

function shipHasSkills(ship) {
    let result = true;

    // Check if ship skill completed - cannot build unless at 20
    if (ship.shipyard_skill != 20) {
        result = false;
    }

    // Check if shipyard at required skill level - cannot build ship otherwise
    if (ship.shipyard_level < ship.shipyard_min_level) {
        result = false;
    }

    return result;
}

function shipbuildingBusy(launchTime, busyUntil) {
    if (busyUntil === null || busyUntil - launchTime/1000 < 0) {
        return false;
    } else {
        return true;
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

async function findShipsToBuild(user, outputNode) {
    /*
    let shipPriority2 = {
        scout: 0,
        patrol: 0,
        cutter: 0,
        corvette: 63,
        frigate: 64,
        destroyer: 65,
        cruiser: 66,
        battlecruiser: 67,
        carrier: 68,
        transporter: 0,
        dreadnought: 69,
        explorer: 0,
        scout2: 0,
        patrol2: 0,
        cutter2: 82,
        corvette2: 83,
        frigate2: 84,
        destroyer2: 85,
        cruiser2: 86,
        battlecruiser2: 87,
        carrier2: 88,
        transporter2: 89,
        dreadnought2: 90,
        explorer2: 99
    }
    */

    let shipPriority = {
        corvette: 63,
        frigate: 64,
        destroyer: 65,
        cruiser: 66,
        battlecruiser: 67,
        carrier: 68,
        dreadnought: 69,
        cutter2: 82,
        corvette2: 83,
        frigate2: 84,
        destroyer2: 85,
        cruiser2: 86,
        battlecruiser2: 87,
        carrier2: 88,
        transportship2: 89,
        dreadnought2: 90,
        explorer2: 99
    }

    let planetData = [];
    let planetResources = [];
    let shipyardData = [];
    let shipsToUpgrade = [];
    let shipsTransactions = [];

    let dataPlanets = await getPlanetsOfUser(user);

    let i = 0;
    for (const planet of dataPlanets.planets) {
        //if (planet.name === "Apeiron-61" || planet.name === "Delta") {
        planetData[i] = await getPlanetResources(planet.id)
        planetResources[i] = await calculateCurrentResources(planetData[i])
        shipyardData[i] = await getPlanetShipyard(user, planet.id)
        shipsToUpgrade[i] = await shipsToUpgradeForPlanet(planet.id, planetResources[i], shipyardData[i], shipPriority)
        //console.dir(planet)
        //console.log(planet.id, planet.name)
        //}
        //buildingsToUpgrade[i] = await buildingsToUpgradeForPlanet(planet.id, planetResources[i], buildingsData[i], minimumRequiredSkillLevel)
        //for (const upgrade of buildingsToUpgrade[i]) {
        //    outputNode.innerHTML += upgrade.type + " " + upgrade.planetId + " " + upgrade.name + " " + upgrade.current + "<br>"
        //    buildingsTransactions.push(upgrade)
        //}
        for (const upgrade of shipsToUpgrade[i]) {
            outputNode.innerHTML += upgrade.type + " " + upgrade.planetId + " " + upgrade.name + "<br>"
            shipsTransactions.push(upgrade)
        }
        i += 1
    }

    return shipsTransactions;
}

async function findExplorationTransactions(user, outputNode) {

    let planetPriority = [
        {user: "miniature-tiger", planets: ["P-Z3STEWYEMDC", "P-ZJWCQN4SU00", "P-Z7M914SV034", "P-ZUEF2H4ZVFK", "P-ZSHCI4Y9BBK", "P-Z6NP7GS7LN4", "P-Z9C2P737XQ8", "P-Z0OXZ5QK3GG"], planetNames: []},
        {user: "tiger-zaps", planets: ["P-ZS3RWN9D840", "P-ZXPZG03WPXC", "P-ZZA367LJYRK", "P-ZSJR1UCWGJK", "P-ZL1K8I8Y86O", "P-Z2A6EKIIC00", "P-ZKNJOCNKC0W", "P-Z142YAEQFO0", "P-ZE8TH46FVK0"], planetNames: []},
        //{user: "tiger-zaps", planets: ["P-ZZA367LJYRK"], planetNames: []},
    ]


    let maxArea = 18;
    let userAvailableMissions = 0;

    let galaxyData = [];

    let space = [];

    let planetMissionInfo = [];
    let planetFleetInfo = [];

    let proposedExplorations = [];
    let explorationTransactions = [];

    let dataPlanets = await getPlanetsOfUser(user);
    //console.dir(dataPlanets)
    let priorityPlanetIndex = planetPriority.findIndex(entry => entry.user == user)
    let userPriorityPlanets = planetPriority[priorityPlanetIndex].planets;

    let planetData = [];
    let i=0;

    for (const priorityPlanet of userPriorityPlanets) {
        let dataPlanetIndex = dataPlanets.planets.findIndex(planet => planet.id == priorityPlanet);
        let dataPlanet = dataPlanets.planets[dataPlanetIndex];
        let planetCoords = [dataPlanet.posx, dataPlanet.posy];


        planetFleetInfo[i] = await getPlanetFleet(user, priorityPlanet)
        let explorerFleetIndex = planetFleetInfo[i].findIndex(fleet => fleet.type == "explorership");
        let explorersAvailable = 0;
        if (explorerFleetIndex != -1) {
            explorersAvailable = planetFleetInfo[i][explorerFleetIndex].quantity;
        }
        //console.dir(planetFleetInfo[i])

        planetMissionInfo[i] = await getPlanetMissionInfo(user, priorityPlanet);
        //console.dir(planetMissionInfo[i])
        let availableMissions = planetMissionInfo[i].planet_unused;
        let availableExplorerMissions = Math.min(availableMissions, explorersAvailable);

        if (i==0) {
            userAvailableMissions = planetMissionInfo[i].user_unused;
            outputNode.innerHTML += "<br>";
            outputNode.innerHTML += user + " available missions: " + userAvailableMissions + "<br>";
        }

        outputNode.innerHTML += "<br>";
        outputNode.innerHTML += dataPlanet.id + " " + dataPlanet.name + ":<br>";
        outputNode.innerHTML += "available missions: " + availableMissions + " available explorers: " + explorersAvailable + ".<br>";

        galaxyData[i] = await getGalaxy(planetCoords[0], planetCoords[1], maxArea, maxArea);
        //console.dir(galaxyData[i])
        space[i] = [];
        let xmin = galaxyData[i].area.xmin;
        let xmax = galaxyData[i].area.xmax;
        let ymin = galaxyData[i].area.ymin;
        let ymax = galaxyData[i].area.ymax;

        for (let x=xmin; x<=xmax; x+=1) {
            for (let y=ymin; y<=ymax; y+=1) {
                let spaceInfo = {x: x, y: y};

                let exploredIndex = galaxyData[i].explored.findIndex(entry => entry.x == x && entry.y == y)
                spaceInfo["explored"] = true;
                if (exploredIndex == -1) {
                    spaceInfo["explored"] = false;
                }

                let explorations = galaxyData[i].explore.filter(entry => entry.x == x && entry.y == y)
                spaceInfo["underSearch"] = false;
                if (explorations.length > 0) {
                    spaceInfo["exploration"] = true;
                    let k=0;
                    for (const exploration of explorations) {
                    if (exploration.user == user) {
                        spaceInfo["underSearch"] = true;
                    }
                    //let spaceCoords = [mission.end_x, mission.end_y]
                    //let missionDistance = distance(planetCoords, spaceCoords)

                        k+=1;
                    }
                } else {
                    spaceInfo["exploration"] = false;
                }

                let spaceCoords = [x, y]
                spaceInfo["distance"] = distance(planetCoords, spaceCoords)
                //console.log(spaceInfo)
                space[i].push(spaceInfo)
            }
        }
        //console.log(space[i])
        proposedExplorations[i] = space[i].filter(space => space.explored == false);
        //console.log(proposedExplorations[i])
        proposedExplorations[i] = proposedExplorations[i].filter(space => space.underSearch == false);
        //console.log(proposedExplorations[i])
        proposedExplorations[i].sort((a, b) => a.distance - b.distance);
        //console.log(proposedExplorations[i])
        proposedExplorations[i] = proposedExplorations[i].slice(0, availableExplorerMissions);
        //console.log(proposedExplorations[i])

        for (const proposal of proposedExplorations[i]) {
            let exploration = {};
            exploration.type = "explorespace";
            exploration.planetId = priorityPlanet;
            exploration.x = proposal.x;
            exploration.y = proposal.y;
            exploration.shipName = "explorership";
            explorationTransactions.push(exploration)

            outputNode.innerHTML += exploration.type + " " + exploration.x + " " + exploration.y + " " + exploration.shipName + " " + proposal.distance + "<br>";
        }

        i+=1;
    }

    explorationTransactions = explorationTransactions.slice(0, userAvailableMissions);
    console.dir(explorationTransactions);
    return explorationTransactions;

}



async function findMarketTrades(user, outputNode) {

    let shipMarket = [
        //{type: "corvette", minPrice: 20},
        {type: "frigate", version: 0, minPrice: 30},
        {type: "destroyer", version: 0, minPrice: 40},
        {type: "cruiser", version: 0, minPrice: 60},
        {type: "battlecruiser", version: 0, minPrice: 150},
        {type: "carrier", version: 0, minPrice: 300},
        {type: "dreadnought", version: 0, minPrice: 900},
        {type: "cutter2", version: 2, minPrice: 40},
        {type: "corvette2", version: 2, minPrice: 80},
        {type: "frigate2", version: 2, minPrice: 120},
        {type: "destroyer2", version: 2, minPrice: 160},
        {type: "cruiser2", version: 2, minPrice: 300},
        {type: "battlecruiser2", version: 2, minPrice: 500},
        {type: "carrier2", version: 2, minPrice: 5000},
        {type: "dreadnought2", version: 2, minPrice: 9000}
    ];

    function findIndexInShipMarket(shipType) {
        return  shipMarket.findIndex(ship => ship.type == shipType);
    }

    let planetOrderForShipSales = [
        {user: "tiger-zaps", version0: ["Alpha", "Epsilon", "Zeta", "Theta", "Rho", "Sigma"], version2: ["Pi", "Kappa", "Beta", "Rho", "Sigma", "Delta"]},
     ]



    let planetData = [];

    let activeMarketData = [];
    let soldMarketData = [];
    let userActiveMarketData = [];
    let userSoldMarketData = [];
    let askPrices = [];
    let marketAsks = [];

    let planetShips = [];
    let allShips = [];

    let marketTransactions = [];
    //planetData[i] = await getPlanetResources(planet.id)

    let j=0
    for (const ship of shipMarket) {
        if (j==0) {
            activeMarketData[j] = await getMarketForShip(ship.type, 1, 0);
            soldMarketData[j] = await getMarketForShip(ship.type, 0, 1);
            userActiveMarketData[j] = await getMarketForShipAndUser(user, ship.type, 1, 0);
            userSoldMarketData[j] = await getMarketForShipAndUser(user, ship.type, 0, 1);
            marketAsks[j] = determineMarketAsks(activeMarketData[j], soldMarketData[j], shipMarket[j])
            //console.log(activeMarketData[j])
            //console.log(soldMarketData[j])
            //console.log(userActiveMarketData[j])
            //console.log(userSoldMarketData[j])

            for (const ask of marketAsks[j]) {

                outputNode.innerHTML += ask.category + " " + ask.type + " " + ask.price + "<br>"
                marketTransactions.push(ask)
            }
        }

        j+=1;
    }

    // If lots of ships at lowest price then match this
    // If only 3 ships at lowest price then match for match but sell rest at 1 below next price

    let dataPlanets = await getPlanetsOfUser(user);
    let i = 0;
    for (const planet of dataPlanets.planets) {
        if (i<5) {
            console.log(user, planet.id)
            planetShips[i] = await getPlanetShips(user, planet.id);
            let usefulShips = planetShips[i].filter(ship => findIndexInShipMarket(ship.type) != -1);
            usefulShips = usefulShips.filter(ship => ship.for_sale == 0);
            usefulShips = usefulShips.filter(ship => ship.busy < launchTime/1000);
            usefulShips = usefulShips.map(ship => ({type: ship.type, id: ship.id, planet: planet.id, version: shipMarket[findIndexInShipMarket(ship.type)].version}))
            //usefulShips = usefulShips.map(ship => ({...ship, priority: shipPriority[ship.type]}))
            allShips += usefulShips;
            console.dir(usefulShips)
        }


        i += 1
    }

    return marketTransactions;
}

function summariseAndSort(data) {
    let summary = [];

    for (const ask of data) {
        let index = summary.findIndex(level => level.price == ask.price);
        if (index == -1) {
            summary.push({price: ask.price, count: 1})
        } else {
            summary[index].count+=1;
        }
    }

    summary.sort((a, b) => a.price - b.price);

    return summary;
}

function determineMarketAsks(activeMarketData, soldMarketData, shipMarket) {
    //for (const ask of activeMarketData) {

    //}
    let priceFactor = 100000000;
    let minPrice = shipMarket.minPrice * priceFactor;
    console.log(shipMarket.type, minPrice)
    let reducedActiveMarketData = activeMarketData.map(ask => ({price: ask.price}))
    let marketTransactions = [];


    let activeMarketSummary = summariseAndSort(reducedActiveMarketData);
    console.dir(activeMarketSummary)

    let currentCount = 0;
    let totalTransactions = 20;
    for (const level of activeMarketSummary) {
        level.price = Math.max(level.price, minPrice);
        level.count = Math.min(level.count, totalTransactions - currentCount);
        currentCount += level.count
    }

    activeMarketSummary = activeMarketSummary.filter(level => level.count > 0);
    //let askPrices = activeMarketSummary.map(ask => ({price: Math.max(ask.price, minPrice), count: ask.count-1}))

    for (const level of activeMarketSummary) {
        for (i = 0; i < level.count; i+=1) {
            // Create market transaction and push to transaction list
            let askInfo = {}
            askInfo.category = "ship"
            askInfo.type = shipMarket.type
            askInfo.itemUID = "";
            //askInfo.price = activeMarketSummary.price / priceFactor;
            askInfo.price = level.price / priceFactor;
            marketTransactions.push(askInfo);
        }
    }




    //var activeMarketSummaryCount = activeMarketSummary.reduce(function(object, item) {
  //      object[item.price] = (object[item.price] || 0) + 1;
    //    return object;
    //}, {})



    //activeMarketSummaryCount = activeMarketSummaryCount.map(level => ({price: Object.keys[level][0], count: level[Object.keys[level][0]]})
    //activeMarketSummaryCount = activeMarketSummaryCount.map(level => ({price: Object.keys[level][0]}))

    //let lowestPrice = activeMarketSummaryCount[0]



    //let activeMarketSummaryCount = count(activeMarketSummary);

    /*
    let currentPrice = activeMarketData[0].price
    let activeMarketSummary = [{price: currentPrice, count: 0}];
    for (const ask of activeMarketData) {
        activeMarketSummary
        if (ask.price == currentPrice) {
            activeMarketSummary
        }
    }
    */

    console.dir(activeMarketSummary)
    //console.dir(askPrices)
    return marketTransactions;
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
