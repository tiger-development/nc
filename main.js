let keychainFunctioning = false;




// On page load
window.addEventListener('load', async (event) => {
    // Temp
    console.log(window.steem_keychain)

    // Get status output
    const status = document.getElementById('status');

    // Get the username input field
    const usernameSelect = document.getElementById('usernameSelect');

    // Get login button
    const loginButton = document.getElementById('login');

    // Get logout button
    const logoutButton = document.getElementById('logout');

    // Get mission buttons
    const runLoginMissionButton = document.getElementById('runLoginMission');
    const runInfoMissionButton = document.getElementById('runInfoMission');

    var loginMissionSelect = document.getElementById("loginMissionSelect")
    var infoMissionSelect = document.getElementById("infoMissionSelect")

    // Other data inputs
    const xCoordinateField = document.getElementById("xCoordinate")
    const yCoordinateField = document.getElementById("yCoordinate")
    const maxProcessField = document.getElementById("numberOfTransactions")
    const explorerRangeField = document.getElementById("explorerRange")

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

    for (const userName of userList) {
        await createUserData(userName);
    }

    // Check if anyone is already logged in or set for info
    let user = getUser();
    let logInStatus = getLogInStatus();

    let userData = [];
    if (user && logInStatus == "keychain") {
        loginDisplay(user)
        userData = loginUserData(user);
    } else if (user && logInStatus == "setForInfo") {
        loginDisplay(user)
        userData =loginUserData(user);
    } else {
        logoutDisplay();
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
                        userData =loginUserData(user);
                    }
                });
            } else {
                console.log('Keychain not installed');
                user = setUser(userValue);
                logInStatus = setLogInStatus("setForInfo")
                loginDisplay(userValue)
                userData = loginUserData(user);
            }
    });

    // When the logout button is clicked
    logoutButton.addEventListener('click', (e) => {
        // Stop the default action from doing anything
        e.preventDefault();
        user = false
        logInStatus = false
        logoutUser();
        logoutDisplay();
        userData = [];
    });

    runLoginMissionButton.addEventListener('click', (e) => {
        // Stop the default action from doing anything
        e.preventDefault();

        const mission = loginMissionSelect.value;
        const maxProcess = maxProcessField.value;
        const explorerRange = explorerRangeField.value;
        const xCoordinate = xCoordinateField.value;
        const yCoordinate = yCoordinateField.value;

        if (user && logInStatus == "keychain") {
            runLoginMission(user, userData, mission, maxProcess, explorerRange, xCoordinate, yCoordinate, outputNode);
        } else {
            console.log('User not logged in with keychain.');
        }
    });

    runInfoMissionButton.addEventListener('click', (e) => {
        // Stop the default action from doing anything
        e.preventDefault();

        const mission = infoMissionSelect.value;
        const explorerRange = explorerRangeField.value;
        const xCoordinate = xCoordinateField.value;
        const yCoordinate = yCoordinateField.value;

        if (user && (logInStatus == "setForInfo" || logInStatus == "keychain")) {
            runInfoMission(user, userData, mission, explorerRange, xCoordinate, yCoordinate, outputNode);
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

    function loginUserData(user) {
        return fetchUserData(user);
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
let missionLaunchTime = Date.now();
let workFlowMonitor = true



async function runLoginMission(user, userData, mission, maxProcess, explorerRange, xCoordinate, yCoordinate, outputNode) {
    outputNode.innerHTML = "";
    missionLaunchTime = Date.now();

    if (mission == "check") {
        check(user)
    } else if (mission == "build ships") {
        console.log("runLoginMission - build ships")
        //buildShip(user, "P-ZCBO9MBOJ2O", "corvette")
        let buildShipTransactions = await findShipsToBuild(user, userData, outputNode)
        processKeychainTransactions(user, buildShipTransactions, maxProcess, 500);

    } else if (mission == "upgrade buildings") {
        console.log("runLoginMission - upgrade buildings")
        let buildingsTransactions = await findBuildingsToUpgrade(user, userData, outputNode)
        //upgradeBuilding(user, "P-Z142YAEQFO0", "shieldgenerator")
        processKeychainTransactions(user, buildingsTransactions, maxProcess, 500);
        // buildShip(user, "P-ZCBO9MBOJ2O", "corvette")
        //upgradeBuilding(user, planetId, buildingName)
    } else if (mission == "send explorers") {
        console.log("runLoginMission - send explorers")
        let explorationTransactions = await findExplorationTransactions(user, userData, explorerRange, outputNode)
        processKeychainTransactions(user, explorationTransactions, maxProcess, 3000);
    } else if (mission == "send explorerII") {
        console.log("runLoginMission - send explorerII")
        let explorationTransactions = await findExplorerTwoTransactions(user, userData, explorerRange, xCoordinate, yCoordinate, outputNode)
        processKeychainTransactions(user, explorationTransactions, maxProcess, 3000);
    } else if (mission == "sell ships") {
        console.log("runLoginMission - sell ships")
        let askTransactions = await findMarketTrades(user, userData, outputNode)
        processKeychainTransactions(user, askTransactions, maxProcess, 500);
    }
}

async function runInfoMission(user, userData, mission, explorerRange, xCoordinate, yCoordinate, outputNode) {
    outputNode.innerHTML = "";
    missionLaunchTime = Date.now();

    if (mission == "targets") {
        targets(user, outputNode)
    } else if (mission == "snipes") {
        snipes(user,outputNode)
    } else if (mission == "buildings") {
        let buildingsTransactions = await findBuildingsToUpgrade(user, userData, outputNode)
    } else if (mission == "ships") {
        let buildShipTransactions = await findShipsToBuild(user, userData, outputNode)
    } else if (mission == "market") {
        let marketInfo = await findMarketTrades(user, userData, outputNode)
    } else if (mission == "send explorers") {
        let explorationTransactions = await findExplorationTransactions(user, userData, explorerRange, outputNode)
    } else if (mission == "explorerII scoping") {
        let explorationTwoTransactions = await findExplorerTwoTransactions(user, userData, explorerRange, xCoordinate, yCoordinate, outputNode)
    } else if (mission == "define strategy") {
        await defineStrategy(user, outputNode)
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
                    let timeRemaining = arrival - missionLaunchTime
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

function convertDistanceToTimeInSeconds(speed, distance) {
    let timeToTravelInHours = distance / speed;
    let timeToTravelInSeconds = timeToTravelInHours * 60 * 60;
    return timeToTravelInSeconds;
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
        outputNode.innerHTML += "Shield charge:" + ((planetInfo[i].shieldcharge_busy - missionLaunchTime/1000) / 3600) + " Shield charged:" + planetInfo[i].shieldcharged + " Shield protection:" + ((planetInfo[i].shieldprotection_busy - missionLaunchTime/1000)/ 3600) + "<br>";
        console.log(planetInfo[i].shieldcharge_busy, planetInfo[i].shieldprotection, missionLaunchTime)
        i += 1
    }
}

async function getPlanetsOfUser(user) {
    let response = await fetch("https://api.nextcolony.io/loadplanets?user=" + user + "&from=0&to=10000&sort=date");
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

async function getLimitedUserMissions(user, limit) {
    let response = await fetch("https://api.nextcolony.io/loadfleetmission?user=" + user + "&limit=" + limit);
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
  let timeSinceUpdate = ((missionLaunchTime - planet.lastUpdate * 1000) / 3600 / 1000);

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

async function shipsToUpgradeForPlanet(planetId, resources, shipyard, shipPriority, minimumShipPriority) {
    //let scarceResource = findScarceResource(JSON.parse(JSON.stringify(resources)));
    let remainingResources = JSON.parse(JSON.stringify(resources));

    let shipyardActivated = shipyard.filter(ship => ship.activated === true);
    //console.dir(shipyardActivated)
    //let shipyardPriorityOnly = shipyardActivated.filter(ship => shipHasPriority(ship.type, shipPriority) === true);
    let shipyardPriorityOnly = shipyardActivated.filter(ship => shipHasSufficientPriority(ship.type, shipPriority, minimumShipPriority) === true);
    //console.dir(shipyardPriorityOnly)

    let shipyardWithPriority = shipyardPriorityOnly.map(ship => ({...ship, priority: shipPriority[ship.type]}))
    //console.dir(shipyardWithPriority)

    let shipyardWithSkills = shipyardWithPriority.filter(ship => shipHasSkills(ship) === true)

    let shipyardAvailableToBuild = shipyardWithSkills.filter(ship => shipbuildingBusy(missionLaunchTime, ship.busy_until) === false);

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
         } else {
              // Do not build any ships if cannot build
              console.log(planetId + " not enough resources to build " + ship.type)
              break
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
            let busy = checkIfBuildingBusy(missionLaunchTime, building.busy)

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

function shipHasSufficientPriority(type, shipPriority, minimumShipPriority) {
    let result = false;
    if (shipPriority[type] != undefined) {
        if (shipPriority[type] >= minimumShipPriority) {
            result = true;
        } else {
            //console.log("cannot build " + type + " as shipPriority of " + shipPriority + " < " + minimumShipPriority)
        }
    }
    return result;
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


async function findBuildingsToUpgrade(user, userData, outputNode) {

    let minimumRequiredSkillLevel = 18;

    let planetData = [];
    let planetResources = [];
    let buildingsData = [];
    let buildingsToUpgrade = [];
    let buildingsTransactions = [];

    let dataPlanets = await getPlanetsOfUser(user);

    let i = 0;
    for (const planet of dataPlanets.planets) {

        let userDataPlanetIndex = userData.planets.findIndex(entry => entry.id == planet.id)
        let build = true;
        if (userDataPlanetIndex != -1) {
            build = userData.planets[userDataPlanetIndex].build;
        }

        if (build == true) {
            planetData[i] = await getPlanetResources(planet.id)
            planetResources[i] = await calculateCurrentResources(planetData[i])
            buildingsData[i] = await getBuildings(planet.id);
            buildingsToUpgrade[i] = await buildingsToUpgradeForPlanet(planet.id, planetResources[i], buildingsData[i], minimumRequiredSkillLevel)
            for (const upgrade of buildingsToUpgrade[i]) {
                outputNode.innerHTML += upgrade.type + " " + upgrade.planetId + " " + upgrade.name + " " + upgrade.current + "<br>"
                buildingsTransactions.push(upgrade)
            }
        }

        i += 1
    }

    console.dir(buildingsTransactions)
    return buildingsTransactions;
}

async function findShipsToBuild(user, userData, outputNode) {
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
        cutter2: 81,
        corvette2: 82,
        frigate2: 83,
        destroyer2: 84,
        cruiser2: 85,
        battlecruiser2: 86,
        carrier2: 87,
        transportship2: 91,
        dreadnought2: 92,
        explorership1: 99
    }

    let planetData = [];
    let planetResources = [];
    let shipyardData = [];
    let shipsToUpgrade = [];
    let shipsTransactions = [];

    let dataPlanets = await getPlanetsOfUser(user);

    let i = 0;
    for (const planet of dataPlanets.planets) {

        let userDataPlanetIndex = userData.planets.findIndex(entry => entry.id == planet.id)
        let shipbuild = true;
        let minimumShipPriority = 0;
        if (userDataPlanetIndex != -1) {
            shipbuild = userData.planets[userDataPlanetIndex].shipbuild;
            minimumShipPriority = userData.planets[userDataPlanetIndex].minimumShipPriority;
        }
        console.log(planet.id, shipbuild, planet.name, minimumShipPriority)

        if (shipbuild == true) {
            planetData[i] = await getPlanetResources(planet.id)
            planetResources[i] = await calculateCurrentResources(planetData[i])
            shipyardData[i] = await getPlanetShipyard(user, planet.id)
            shipsToUpgrade[i] = await shipsToUpgradeForPlanet(planet.id, planetResources[i], shipyardData[i], shipPriority, minimumShipPriority)
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
        }
        i += 1
    }

    return shipsTransactions;
}


async function findExplorerTwoTransactions(user, userData, explorerRange, xCoordinate, yCoordinate, outputNode) {
    let closeHour = 0;
    let reopenHour = 7;

    let planetFleetInfo = [];
    let planetMissionInfo = [];
    //let planetUserMissions = [];
    let space = [];
    let proposedExplorations = [];
    let explorationTransactions = [];
    let userAvailableMissions = 0;


    let userMissions = await getLimitedUserMissions(user, 400)
    //let finishedMissions = await getUserMissions(user, 0)
    //let userMissions = activeMissions.concat(finishedMissions)

    //console.log(xCoordinate)
    //console.log(yCoordinate)
    //console.dir(userMissions)
    //console.dir(finishedMissions)
    //console.dir(userMissions)
    //for (const mission of userMissions) {


        //let planetCoords = [mission.start_x, mission.start_y]
        //let spaceCoords = [mission.end_x, mission.end_y]
        //let missionDistance = distance(planetCoords, spaceCoords)

    //}

    galaxyData = await getGalaxy(xCoordinate, yCoordinate, explorerRange, explorerRange);
    console.dir(galaxyData)

    let xmin = galaxyData.area.xmin;
    let xmax = galaxyData.area.xmax;
    let ymin = galaxyData.area.ymin;
    let ymax = galaxyData.area.ymax;




    let availableExplorerMissions = 0;

    let i=0;
    let dataPlanets = await getPlanetsOfUser(user);
    for (const dataPlanet of dataPlanets.planets) {
        space[i] = [];

        let planetUserMissions = userMissions.filter(mission => mission.from_planet.id == dataPlanet.id)
        let planetExplorerTwoMissions = planetUserMissions.filter(mission => Object.keys(mission.ships).includes("explorership1"))

        planetFleetInfo[i] = await getPlanetFleet(user, dataPlanet.id)
        let explorerFleetIndex = planetFleetInfo[i].findIndex(fleet => fleet.type == "explorership1");
        let explorersAvailable = 0;
        if (explorerFleetIndex != -1) {
            explorersAvailable = planetFleetInfo[i][explorerFleetIndex].quantity;
        }

        if (i==0) {
            planetMissionInfo[i] = await getPlanetMissionInfo(user, dataPlanet.id);
            userAvailableMissions = planetMissionInfo[i].user_unused;
            outputNode.innerHTML += "<br>";
            outputNode.innerHTML += user + " available missions: " + userAvailableMissions + "<br>";
        }

        if (explorersAvailable > 0 || planetExplorerTwoMissions.length > 0) {
            if (i>0) {
                planetMissionInfo[i] = await getPlanetMissionInfo(user, dataPlanet.id);
            }
            let availableMissions = planetMissionInfo[i].planet_unused;
            availableExplorerMissions = Math.min(availableMissions, explorersAvailable);
            outputNode.innerHTML += "<br>";
            outputNode.innerHTML += dataPlanet.id + " " + dataPlanet.name + ":<br>";
            outputNode.innerHTML += "available missions: " + availableMissions + " available explorers: " + explorersAvailable + ".<br>";
        }

        if (explorersAvailable > 0) {

            if (planetExplorerTwoMissions.length > 0) {
                outputNode.innerHTML += "recent ExplorerII missions:<br>";

                for (const mission of planetExplorerTwoMissions) {
                    let planetCoords = [mission.start_x, mission.start_y]
                    let spaceCoords = [mission.end_x, mission.end_y]
                    let missionDistance = distance(planetCoords, spaceCoords)
                    outputNode.innerHTML += "x: " + mission.end_x + " y: " + mission.end_y + " distance: " + missionDistance + " <br>";
                }
            }

            for (let x=xmin; x<=xmax; x+=1) {
                for (let y=ymin; y<=ymax; y+=1) {
                    let spaceInfo = {x: x, y: y};

                    let planetCoords = [dataPlanet.posx, dataPlanet.posy];
                    let spaceCoords = [x, y];
                    spaceInfo["distance"] = distance(planetCoords, spaceCoords);

                    let travelTime = convertDistanceToTimeInSeconds(1, spaceInfo.distance);
                    spaceInfo["arrival"] = (missionLaunchTime/1000) + travelTime;
                    spaceInfo["return"] = (missionLaunchTime/1000) + (travelTime * 2);
                    spaceInfo["returnDate"] = new Date(spaceInfo.return * 1000);
                    spaceInfo["returnHour"] = spaceInfo.returnDate.getHours();


                    let priorTransactionIndex = explorationTransactions.findIndex(entry => entry.x == x && entry.y == y)
                    spaceInfo["priorTransaction"] = true;
                    if (priorTransactionIndex == -1) {
                        spaceInfo["priorTransaction"] = false;
                    }

                    let planetsIndex = galaxyData.planets.findIndex(entry => entry.x == x && entry.y == y)
                    spaceInfo["planet"] = true;
                    if (planetsIndex == -1) {
                        spaceInfo["planet"] = false;
                    }

                    let exploredIndex = galaxyData.explored.findIndex(entry => entry.x == x && entry.y == y)
                    spaceInfo["explored"] = true;
                    if (exploredIndex == -1) {
                        spaceInfo["explored"] = false;
                    }

                    let explorations = galaxyData.explore.filter(entry => entry.x == x && entry.y == y)

                    spaceInfo["underSearch"] = false;
                    spaceInfo["sniped"] = "none";
                    if (explorations.length > 0) {
                        spaceInfo["exploration"] = true;

                        let snipes = [];

                        let k=0;
                        for (const exploration of explorations) {


                            if (exploration.user == user) {
                                spaceInfo["underSearch"] = true;
                            } else {
                                let snipeInfo = {x: x, y: y};
                                snipeInfo["rivalUser"] = exploration.user;
                                snipeInfo["rivalArrival"] = exploration.date;
                                snipeInfo["userArrival"] = spaceInfo.arrival;
                                snipeInfo["winner"] = "user";
                                if (snipeInfo.rivalArrival < snipeInfo.userArrival) {
                                    snipeInfo["winner"] = "rival"
                                    spaceInfo["sniped"] = "lost";
                                } else if (snipeInfo.rivalArrival >= snipeInfo.userArrival && spaceInfo["sniped"] != "lost") {
                                    spaceInfo["sniped"] = "opportunity";
                                }
                                snipes.push(snipeInfo)
                            }


                        //let spaceCoords = [mission.end_x, mission.end_y]
                        //let missionDistance = distance(planetCoords, spaceCoords)

                            k+=1;
                        }
                        if (snipes.length > 0) {
                            //console.dir(snipes)
                            //console.dir(spaceInfo)
                        }

                    } else {
                        spaceInfo["exploration"] = false;
                    }

                    //console.log(spaceInfo)
                    space[i].push(spaceInfo)
                }
            }

            proposedExplorations[i] = space[i].filter(space => space.explored == false);
            //console.log(proposedExplorations[i])
            proposedExplorations[i] = proposedExplorations[i].filter(space => space.priorTransaction == false);
            //console.log(proposedExplorations[i])
            proposedExplorations[i] = proposedExplorations[i].filter(space => space.underSearch == false);
            proposedExplorations[i] = proposedExplorations[i].filter(space => space.sniped != "lost");
            proposedExplorations[i] = proposedExplorations[i].filter(space => space.returnHour > reopenHour);
            //console.log(proposedExplorations[i])
            proposedExplorations[i] = proposedExplorations[i].filter(space => space.planet == false);
            //console.log(proposedExplorations[i])
            //proposedExplorations[i].sort((a, b) => a.distance - b.distance);
            //console.log(proposedExplorations[i])
            snipeOpportunities = proposedExplorations[i].filter(space => space.sniped == "opportunity");
            snipeOpportunities = snipeOpportunities.slice(0, availableExplorerMissions);

            nonSnipeExplorations = proposedExplorations[i].filter(space => space.sniped == "none");
            nonSnipeExplorations = nonSnipeExplorations.slice(0, availableExplorerMissions - snipeOpportunities.length);
            //proposedExplorations[i] = proposedExplorations[i].slice(0, availableExplorerMissions);
            //console.log(proposedExplorations[i])
            proposedExplorations[i] = snipeOpportunities.concat(nonSnipeExplorations);

            for (const proposal of proposedExplorations[i]) {
                let exploration = {};
                exploration.type = "explorespace";
                exploration.planetId = dataPlanet.id;
                exploration.x = proposal.x;
                exploration.y = proposal.y;
                exploration.shipName = "explorership1";
                exploration.sniped = proposal.sniped;
                if (proposal.sniped == "opportunity") {
                    let opportunityCount = explorationTransactions.filter(transaction => transaction.sniped == "opportunity").length;
                    explorationTransactions.splice(opportunityCount, 0, exploration);
                    outputNode.innerHTML += exploration.type + " " + exploration.x + " " + exploration.y + " " + exploration.shipName + " " + proposal.distance + " --- SNIPE HAS PRIORITY OVER PLANET ORDER --- <br>";
                } else {
                    explorationTransactions.push(exploration);
                    outputNode.innerHTML += exploration.type + " " + exploration.x + " " + exploration.y + " " + exploration.shipName + " " + proposal.distance + "<br>";
                }
            }

        }
        i+=1;
    }
    console.log("explorationTransactions", explorationTransactions)
    let finalExplorationTransactions = explorationTransactions.slice(0, userAvailableMissions);
    console.dir(finalExplorationTransactions);
    return finalExplorationTransactions;


}




async function findExplorationTransactions(user, userData, explorerRange, outputNode) {

    //let planetPriority = [
    //    {user: "miniature-tiger", planets: ["P-Z3STEWYEMDC", "P-ZJWCQN4SU00", "P-Z7M914SV034", "P-ZUEF2H4ZVFK", "P-ZSHCI4Y9BBK", "P-Z6NP7GS7LN4", "P-Z9C2P737XQ8", "P-Z0OXZ5QK3GG"], planetNames: []},
    //    {user: "tiger-zaps", planets: ["P-ZS3RWN9D840", "P-ZXPZG03WPXC", "P-ZZA367LJYRK", "P-ZSJR1UCWGJK", "P-ZL1K8I8Y86O", "P-Z2A6EKIIC00", "P-ZKNJOCNKC0W", "P-Z142YAEQFO0", "P-ZE8TH46FVK0"], planetNames: []},
        //{user: "tiger-zaps", planets: ["P-ZZA367LJYRK"], planetNames: []},
    //]

    console.log("explorerRange", explorerRange)
    let closeHour = 0;
    let reopenHour = 7;

    let userAvailableMissions = 0;

    let galaxyData = [];

    let space = [];

    let planetMissionInfo = [];
    let planetFleetInfo = [];

    let proposedExplorations = [];
    let explorationTransactions = [];

    let dataPlanets = await getPlanetsOfUser(user);
    //console.dir(dataPlanets)
    //let priorityPlanetIndex = planetPriority.findIndex(entry => entry.user == user)
    //let userPriorityPlanets = planetPriority[priorityPlanetIndex].planets;
    let userPriorityPlanets = fetchUserPlanetPriorityData(user).planets;

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

        galaxyData[i] = await getGalaxy(planetCoords[0], planetCoords[1], explorerRange, explorerRange);
        console.dir(galaxyData[i])
        space[i] = [];
        let xmin = galaxyData[i].area.xmin;
        let xmax = galaxyData[i].area.xmax;
        let ymin = galaxyData[i].area.ymin;
        let ymax = galaxyData[i].area.ymax;

        for (let x=xmin; x<=xmax; x+=1) {
            for (let y=ymin; y<=ymax; y+=1) {
                let spaceInfo = {x: x, y: y};

                let spaceCoords = [x, y];
                spaceInfo["distance"] = distance(planetCoords, spaceCoords);

                let travelTime = convertDistanceToTimeInSeconds(1, spaceInfo.distance);
                spaceInfo["arrival"] = (missionLaunchTime/1000) + travelTime;
                spaceInfo["return"] = (missionLaunchTime/1000) + (travelTime * 2);
                spaceInfo["returnDate"] = new Date(spaceInfo.return * 1000);
                spaceInfo["returnHour"] = spaceInfo.returnDate.getHours();


                let priorTransactionIndex = explorationTransactions.findIndex(entry => entry.x == x && entry.y == y)
                spaceInfo["priorTransaction"] = true;
                if (priorTransactionIndex == -1) {
                    spaceInfo["priorTransaction"] = false;
                }

                let planetsIndex = galaxyData[i].planets.findIndex(entry => entry.x == x && entry.y == y)
                spaceInfo["planet"] = true;
                if (planetsIndex == -1) {
                    spaceInfo["planet"] = false;
                }

                let exploredIndex = galaxyData[i].explored.findIndex(entry => entry.x == x && entry.y == y)
                spaceInfo["explored"] = true;
                if (exploredIndex == -1) {
                    spaceInfo["explored"] = false;
                }

                let explorations = galaxyData[i].explore.filter(entry => entry.x == x && entry.y == y)

                spaceInfo["underSearch"] = false;
                spaceInfo["sniped"] = "none";
                if (explorations.length > 0) {
                    spaceInfo["exploration"] = true;

                    let snipes = [];

                    let k=0;
                    for (const exploration of explorations) {


                        if (exploration.user == user) {
                            spaceInfo["underSearch"] = true;
                        } else {
                            let snipeInfo = {x: x, y: y};
                            snipeInfo["rivalUser"] = exploration.user;
                            snipeInfo["rivalArrival"] = exploration.date;
                            snipeInfo["userArrival"] = spaceInfo.arrival;
                            snipeInfo["winner"] = "user";
                            if (snipeInfo.rivalArrival < snipeInfo.userArrival) {
                                snipeInfo["winner"] = "rival"
                                spaceInfo["sniped"] = "lost";
                            } else if (snipeInfo.rivalArrival >= snipeInfo.userArrival && spaceInfo["sniped"] != "lost") {
                                spaceInfo["sniped"] = "opportunity";
                            }
                            snipes.push(snipeInfo)
                        }


                    //let spaceCoords = [mission.end_x, mission.end_y]
                    //let missionDistance = distance(planetCoords, spaceCoords)

                        k+=1;
                    }
                    if (snipes.length > 0) {
                        //console.dir(snipes)
                        //console.dir(spaceInfo)
                    }

                } else {
                    spaceInfo["exploration"] = false;
                }





                //console.log(spaceInfo)
                space[i].push(spaceInfo)
            }
        }
        //console.log(space[i])
        proposedExplorations[i] = space[i].filter(space => space.explored == false);
        //console.log(proposedExplorations[i])
        proposedExplorations[i] = proposedExplorations[i].filter(space => space.priorTransaction == false);
        //console.log(proposedExplorations[i])
        proposedExplorations[i] = proposedExplorations[i].filter(space => space.underSearch == false);
        proposedExplorations[i] = proposedExplorations[i].filter(space => space.sniped != "lost");
        proposedExplorations[i] = proposedExplorations[i].filter(space => space.returnHour > reopenHour);
        //console.log(proposedExplorations[i])
        proposedExplorations[i] = proposedExplorations[i].filter(space => space.planet == false);
        //console.log(proposedExplorations[i])
        proposedExplorations[i].sort((a, b) => a.distance - b.distance);
        //console.log(proposedExplorations[i])
        snipeOpportunities = proposedExplorations[i].filter(space => space.sniped == "opportunity");
        snipeOpportunities = snipeOpportunities.slice(0, availableExplorerMissions);

        nonSnipeExplorations = proposedExplorations[i].filter(space => space.sniped == "none");
        nonSnipeExplorations = nonSnipeExplorations.slice(0, availableExplorerMissions - snipeOpportunities.length);
        //proposedExplorations[i] = proposedExplorations[i].slice(0, availableExplorerMissions);
        //console.log(proposedExplorations[i])
        proposedExplorations[i] = snipeOpportunities.concat(nonSnipeExplorations);
        //console.log(proposedExplorations[i])
        /*
        let reportingExplorations = space[i].filter(space => space.explored == false);
        reportingExplorations = reportingExplorations.filter(space => space.priorTransaction == false);
        reportingExplorations = reportingExplorations.filter(space => space.underSearch == false);
        reportingExplorations = reportingExplorations.filter(space => space.planet == false);
        reportingExplorations = reportingExplorations.slice(0, availableExplorerMissions);
        */

        for (const proposal of proposedExplorations[i]) {
            let exploration = {};
            exploration.type = "explorespace";
            exploration.planetId = priorityPlanet;
            exploration.x = proposal.x;
            exploration.y = proposal.y;
            exploration.shipName = "explorership";
            exploration.sniped = proposal.sniped;
            if (proposal.sniped == "opportunity") {
                let opportunityCount = explorationTransactions.filter(transaction => transaction.sniped == "opportunity").length;
                explorationTransactions.splice(opportunityCount, 0, exploration);
                outputNode.innerHTML += exploration.type + " " + exploration.x + " " + exploration.y + " " + exploration.shipName + " " + proposal.distance + " --- SNIPE HAS PRIORITY OVER PLANET ORDER --- <br>";
            } else {
                explorationTransactions.push(exploration);
                outputNode.innerHTML += exploration.type + " " + exploration.x + " " + exploration.y + " " + exploration.shipName + " " + proposal.distance + "<br>";
            }
        }

        i+=1;
    }

    let finalExplorationTransactions = explorationTransactions.slice(0, userAvailableMissions);
    console.dir(finalExplorationTransactions);
    return finalExplorationTransactions;

}



async function findMarketTrades(user, userData, outputNode) {


    let priceFactor = 100000000;

    let planetData = [];

    let activeMarketData = [];
    let soldMarketData = [];
    let userActiveMarketData = [];
    let userSoldMarketData = [];
    let askPrices = [];
    let marketAsks = [];
    let currentUserAsks = [];

    let planetShips = [];
    let userVersionZeroShips = [];
    let userVersionTwoShips = [];
    let userAllShipsForSale = [];

    let marketCancelTransactions = [];
    let marketAskTransactions = [];
    let marketTransactions = [];
    //planetData[i] = await getPlanetResources(planet.id)

    // Fetch ships for sale on planets marked for ship sale
    let dataPlanets = await getPlanetsOfUser(user);
    let userPlanetOrderForShipSales = fetchUserPlanetOrderForShipSales(user);
    salePlanets = dataPlanets.planets.filter(planet => userPlanetOrderForShipSales.version0.includes(planet.id) || userPlanetOrderForShipSales.version2.includes(planet.id));
    console.log(salePlanets)
    //salePlanets = salePlanets.map(planet => ({...planet, version0: false, version2: false}));
    //for (const planet of salePlanets) {

    /*
    saleZeroPlanets = dataPlanets.planets.filter(planet => userPlanetOrderForShipSales.version0.includes(planet.id));
    saleZeroPlanets = saleZeroPlanets.map(planet => ({...planet, versionZero: true}));
    saleTwoPlanets = dataPlanets.planets.filter(planet => userPlanetOrderForShipSales.version2.includes(planet.id));
    saleTwoPlanets = saleTwoPlanets.map(planet => ({...planet, version: 2}));
    salePlanets = saleZeroPlanets.concat(saleTwoPlanets);
    console.log(salePlanets)
    */

    let i = 0;

    for (const planet of salePlanets) {
        console.log(user, planet.id)
        // Fetch ships on planet
        planetShips[i] = await getPlanetShips(user, planet.id);
        // Filter to ships on "shipMarket" sale list
        let planetShipsForMarket = planetShips[i].filter(ship => findIndexInShipMarket(ship.type) != -1);
        // Filter out ships already sold
        planetShipsForMarket = planetShipsForMarket.filter(ship => ship.for_sale == 0);
        // Filter out ships on missions
        planetShipsForMarket = planetShipsForMarket.filter(ship => ship.busy < missionLaunchTime/1000);
        // Crop ships to useful info only, including ship version tyep
        planetShipsForMarket = planetShipsForMarket.map(ship => ({type: ship.type, id: ship.id, planet: planet.id, version: shipMarket[findIndexInShipMarket(ship.type)].version}))
        //usefulShips = usefulShips.map(ship => ({...ship, priority: shipPriority[ship.type]}))
        console.dir(planetShipsForMarket)

        if (userPlanetOrderForShipSales.version0.includes(planet.id)) {
            let planetVersionZeroShips = planetShipsForMarket.filter(ship => ship.version == 0);
            //userVersionZeroShips = userVersionZeroShips.concat(planetVersionZeroShips);
            userAllShipsForSale = userAllShipsForSale.concat(planetVersionZeroShips);
        }

        if (userPlanetOrderForShipSales.version2.includes(planet.id)) {
            let planetVersionTwoShips = planetShipsForMarket.filter(ship => ship.version == 2);
            //userVersionTwoShips= userVersionTwoShips.concat(planetVersionTwoShips);
            userAllShipsForSale = userAllShipsForSale.concat(planetVersionTwoShips);
        }
        i += 1
    }
    //console.dir(userVersionZeroShips)
    //console.dir(userVersionTwoShips)
    console.dir(userAllShipsForSale)

    let marketAsksDesiredPerShipType = 40;

    let j=0
    for (const ship of shipMarket) {
        // Fetch current market prices and historic sale prices of all market and user
        activeMarketData[j] = await getMarketForShip(ship.type, 1, 0);
        nonUserActiveMarketData = activeMarketData[j].filter(ship => ship.user != user);
        soldMarketData[j] = await getMarketForShip(ship.type, 0, 1);
        nonUserSoldMarketData = soldMarketData[j].filter(ship => ship.user != user);
        userActiveMarketData[j] = await getMarketForShipAndUser(user, ship.type, 1, 0);
        userSoldMarketData[j] = await getMarketForShipAndUser(user, ship.type, 0, 1);

        marketAsks[j] = determineMarketAsks(nonUserActiveMarketData, nonUserSoldMarketData, shipMarket[j], marketAsksDesiredPerShipType)
        //console.log(marketAsks[j])
        currentUserAsks[j] = determineMarketAsks(userActiveMarketData[j], userSoldMarketData[j], shipMarket[j], 50)
        //console.log(currentUserAsks[j])
        console.log(userActiveMarketData[j])
        //console.log(activeMarketData[j])
        //console.log(soldMarketData[j])
        //console.log(userActiveMarketData[j])
        //console.log(userSoldMarketData[j])

        for (const userAsk of userActiveMarketData[j]) {
            let userAskPrice = (userAsk.price / priceFactor);
            let marketAskIndex = marketAsks[j].findIndex(marketAsk => marketAsk.price == userAskPrice);
            if (marketAskIndex == -1) {
                // Create cancel transaction for user ask
                let cancelInfo = {}
                cancelInfo.type = "cancelAsk";
                cancelInfo.askId = userAsk.id;
                cancelInfo.shipType = userAsk.type;
                marketCancelTransactions.push(cancelInfo);
                outputNode.innerHTML += cancelInfo.type + " " + cancelInfo.shipType + " " + cancelInfo.askId + " " + userAskPrice + "<br>"
            } else {
                // Remove market ask from list
                marketAsks[j].splice(marketAskIndex, 1);
                // Do not create cancel transaction
            }

        }


        for (const ask of marketAsks[j]) {
            let shipIndex = userAllShipsForSale.findIndex(ship => ship.type == ask.shipType);
            if (shipIndex == -1) {
                ask["haveShip"] == false
            } else {
                ask["haveShip"] == true
                let ship = userAllShipsForSale.splice(shipIndex, 1);
                ask["itemUID"] = ship[0].id;
                outputNode.innerHTML += ask.type + " " + ask.shipType + " " + ask.itemUID + " " + ask.price + "<br>"
                marketAskTransactions.push(ask)
            }
        }
        j+=1;
    }

    // If lots of ships at lowest price then match this
    // If only 3 ships at lowest price then match for match but sell rest at 1 below next price

    marketTransactions = marketCancelTransactions.concat(marketAskTransactions);
    console.dir(marketTransactions);
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

// For one ship type
function determineMarketAsks(activeMarketData, soldMarketData, shipMarket, marketAsksDesiredPerShipType) {
    //for (const ask of activeMarketData) {

    //}

    let priceFactor = 100000000;
    let marketTransactions = [];

    let minPrice = shipMarket.minPrice * priceFactor;
    //console.log(shipMarket.type, minPrice)


    // Summarise active market data for ship
    let reducedActiveMarketData = activeMarketData.map(ask => ({price: ask.price}))
    let activeMarketSummary = summariseAndSort(reducedActiveMarketData);
    console.dir(activeMarketSummary)

    // Reduce market summary to number of totalTransactions
    let currentCount = 0;
    for (const level of activeMarketSummary) {
        level.price = Math.max(level.price, minPrice);
        level.count = Math.min(level.count, marketAsksDesiredPerShipType - currentCount);
        currentCount += level.count
    }
    activeMarketSummary = activeMarketSummary.filter(level => level.count > 0);

    //let askPrices = activeMarketSummary.map(ask => ({price: Math.max(ask.price, minPrice), count: ask.count-1}))

    for (const level of activeMarketSummary) {
        for (i = 0; i < level.count; i+=1) {
            // Create market transaction and push to transaction list
            let askInfo = {}
            askInfo.type = "sellShip";
            askInfo.category = "ship"
            askInfo.shipType = shipMarket.type;
            askInfo.version = shipMarket.version;
            //askInfo.price = activeMarketSummary.price / priceFactor;

            //askInfo.price = (level.price / priceFactor) - 0.01;
            askInfo.price = (level.price / priceFactor);
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

    //console.dir(marketTransactions)
    //console.dir(askPrices)
    return marketTransactions;
}



async function defineStrategy(user, outputNode) {
    //let userData = await createUserData(user);
    console.log(userData);
    /*
    let dataPlanets = await getPlanetsOfUser(user);
    let i = 0;
    for (const planet of dataPlanets.planets) {
        outputNode.innerHTML += "{id: \"" + planet.id + "\", name: \"" + planet.name + "\", build: true, shipbuild: true, minimumShipPriority: 0, explore: false}"
        + "<br>"
        //outputNode.innerHTML += "{id: """ + planet.id + """, name: "

        i+=1;
    }
    */

}


    //outputNode.innerHTML += upgrade.type + " " + upgrade.planetId + " " + upgrade.name + " " + upgrade.current + "<br>"
    //{id: "P-ZCBO9MBOJ2O", name: "Alpha", build: true, shipbuild: true, minimumShipPriority: 0, explore: false}
