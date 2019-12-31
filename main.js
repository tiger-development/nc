let keychainFunctioning = false;

// On page load
window.addEventListener('load', (event) => {
    console.log(window.steem_keychain)

    // Steem Keychain extension installed
    if(window.steem_keychain) {
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

});











document.addEventListener('DOMContentLoaded', () => {

    // Get the username input field
    const usernameField = document.getElementById('username');

    // Get login button
    const loginButton = document.getElementById('login');

    // Get logout button
    const logoutButton = document.getElementById('logout');

    // Get status output
    const status = document.getElementById('status');

    if(window.steem_keychain) {
            let keychain = window.steem_keychain;
            console.log(keychain)
    }

    // When login button is clicked
    loginButton.addEventListener('click', (e) => {
            // Stop the default action from doing anything
            e.preventDefault();

            // Check window.steem_keychain exists
            if (keychainFunctioning == true) {
                // Get the value from the username field
                const username = usernameField.value;

                steem_keychain.requestSignBuffer(username, 'login', 'Posting', response => {
                    console.log(response)
                });

            } else {
                console.log('Keychain not installed');
            }




    });

});




const launchTime = Date.now();
let workFlowMonitor = true

let outputNode = document.querySelector('div.output');

//console.log(window)
//console.log(window.document.documentURI)
//console.log(window.screenY)
//console.log(window.missions)
//console.log(window.steem_keychain)



async function runMission() {
    outputNode.innerHTML = ""

    var inputs = document.getElementById("inputForm")

    let user = inputs.elements[0].value
    let mission = inputs.elements[1].value

    if (mission == "targets") {
        targets(user)
    } else if (mission == "snipes") {
        snipes(user)
    } else if (mission == "check") {
        check(user)
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


async function snipes(user) {
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



async function targets(user) {
    let targetAccounts = []
    if (user == "miniature-tiger") {
        targetAccounts = ['loliver', 'aniestudio', 'xunityx', 'giornalista', 'elprutest', 'z3ll', 'mcoinz79']
    } else if (user == "tiger-zaps") {
        targetAccounts = ['chilis', 'ga-sm', 'anshia', 'balder', 'jomeszaros', 'arteaga-juan', 'dungeonandpig', 'velazblog', 'szf', 'pladozero']
    }

    for (const target of targetAccounts) {
        await checkPotentialForAttack(target)
    }
}

async function checkPotentialForAttack(target) {
    let outputNode = document.querySelector('div.output');
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
