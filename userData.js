let userList = ["miniature-tiger", "tiger-zaps"]

let userDataStore = []

let planetPriorityDataStore = [
    {user: "miniature-tiger", planets: ["P-Z3STEWYEMDC", "P-ZJWCQN4SU00", "P-ZUEF2H4ZVFK", "P-Z8KKOX2ZOQO", "P-Z7M914SV034", "P-ZSHCI4Y9BBK", "P-ZG8IDE649Q8", "P-Z9C2P737XQ8", "P-Z0OXZ5QK3GG"], planetNames: []},
    {user: "tiger-zaps", planets: ["P-ZS3RWN9D840", "P-ZXPZG03WPXC", "P-ZZA367LJYRK", "P-ZSJR1UCWGJK", "P-ZL1K8I8Y86O", "P-Z2A6EKIIC00", "P-ZKNJOCNKC0W", "P-Z142YAEQFO0", "P-ZE8TH46FVK0"], planetNames: []},
]

// minimumShipPriority: 80 is ship2, transportship2: 91, dreadnought2: 92, explorer2: 99
let minimumShipPriorityDataStore = [

    {user: "miniature-tiger", planets:
        [
            {id: "P-ZVLTZ1VY9LS", minimumShipPriority: 80}, // Rho(2) - ship2 only
            {id: "P-ZTUFNYRJSIO", minimumShipPriority: 80}, // Beta - ship2 and transporter2 only
            {id: "P-Z4QG9SYM1E8", minimumShipPriority: 80}, // Delta - ship2 only
            {id: "P-ZPMH4TWB6WW", minimumShipPriority: 99}, // Theta - ExII-Factory - explorer2 only
            {id: "P-Z9OF9M3G840", minimumShipPriority: 100}, // Eta - ExII-Base - no ship building
            {id: "P-Z5EHJS21S3K", minimumShipPriority: 100}, // Iota - ExII-Base - no ship building
        ]
    },
    {user: "tiger-zaps", planets:
        [
            {id: "P-ZY9Q75PXWWW", minimumShipPriority: 90}, // Delta - transporter2 and dreadnought2 only
            {id: "P-Z8JQAIQIU3K", minimumShipPriority: 80}, // Pi - ship2 only
            {id: "P-ZAF8WG5WM00", minimumShipPriority: 80}, // Kappa - ship2 only
            {id: "P-ZTNYF56W2VK", minimumShipPriority: 80}, // Beta - ship2 only
            {id: "P-ZR10UOAG7TS", minimumShipPriority: 99}, // ExII-Factory1 - explorer2 only
            {id: "P-ZQA36M3JUGW", minimumShipPriority: 100}, // ExII-Base2 - no ship building
            {id: "P-ZIIV5B7IU28", minimumShipPriority: 100}, // ExII-Base3 - no ship building
            {id: "P-ZLKBPD54FM8", minimumShipPriority: 100}, // ExII-Base4 - no ship building
        ]
    },
]

let doNotBuildDataStore = [
    {user: "miniature-tiger", planets:
        ["P-ZVLTZ1VY9LS", "P-ZTUFNYRJSIO", "P-ZPMH4TWB6WW", "P-Z9OF9M3G840", "P-Z5EHJS21S3K"]
    },
    {user: "tiger-zaps", planets:
        ["P-ZY9Q75PXWWW", "P-Z8JQAIQIU3K", "P-ZAF8WG5WM00", "P-ZR10UOAG7TS"]
    },
]


async function createUserData(user) {
    // ADD RESTRICTION ON SHIPBUILDING FOR PLANETS WITH BUILDINGS BELOW LEVEL 18 (EXCL SHIELD)

    let userDataEntry = {}
    userDataEntry["user"] = user;
    userDataEntry["planets"] = [];

    let userPlanetPriorityData = fetchUserPlanetPriorityData(user);
    let doNotBuildData = fetchDoNotBuildData(user);
    let minimumShipPriorityData = fetchMinimumShipPriorityData(user);

    let dataPlanets = await getPlanetsOfUser(user);
    let i = 0;
    for (const planet of dataPlanets.planets) {

        let exploreFromThisPlanet = userPlanetPriorityData.planets.includes(planet.id);
        let buildOnThisPlanet = !doNotBuildData.planets.includes(planet.id);

        let minimumShipPriorityPlanetIndex = minimumShipPriorityData.planets.findIndex(entry => entry.id == planet.id);
        minimumShipPriority = 0;
        if (minimumShipPriorityPlanetIndex != -1) {
            minimumShipPriority = minimumShipPriorityData.planets[minimumShipPriorityPlanetIndex].minimumShipPriority;
        }

        planetData = {};
        planetData["id"] = planet.id;
        planetData["name"] = planet.name;
        planetData["build"] = buildOnThisPlanet;
        planetData["shipbuild"] = true;
        planetData["minimumShipPriority"] = minimumShipPriority;
        planetData["explore"] = exploreFromThisPlanet;

        userDataEntry.planets.push(planetData)

        i+=1;
    }
    userDataStore.push(userDataEntry);
}


function fetchUserData(user) {
    let userIndex = userDataStore.findIndex(data => data.user == user);
    return userDataStore[userIndex];
}

function fetchUserPlanetPriorityData(user) {
    let userIndex = planetPriorityDataStore.findIndex(data => data.user == user);
    return planetPriorityDataStore[userIndex];
}

function fetchDoNotBuildData(user) {
    let userIndex = doNotBuildDataStore.findIndex(data => data.user == user);
    return doNotBuildDataStore[userIndex];
}

function fetchMinimumShipPriorityData(user) {
    let userIndex = minimumShipPriorityDataStore.findIndex(data => data.user == user);
    return minimumShipPriorityDataStore[userIndex];
}
