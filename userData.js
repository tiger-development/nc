let userList = ["miniature-tiger", "tiger-zaps"]

let userDataStore = []

let planetPriorityDataStore = [
    {user: "miniature-tiger", planets: ["P-ZB2O5EWEAEO", "P-ZPC3000584W", "P-ZT85WZ49E8G", "P-ZY47DEPG1KW", "P-ZX2LA8UUA9S", "P-Z3M1F0XZFWG","P-ZFTQR14V9Q8", "P-ZA5T7QX5UXS", "P-ZWKNTJIUOB4", "P-ZUZ67YOXKLS", "P-Z286VU12NDC", "P-Z9ECEAFE5E8", "P-ZEICSWT7R68", "P-ZNOZ9F27ALC", "P-Z5RLBT62MHC", "P-ZGJ95KHRNJ4", "P-ZHS6NCDEXZ4", "P-Z6CUYXXSSB4","P-ZN75ISQUAPS", "P-ZTAF77DLPMO", "P-ZQO2CAQAPDS", "P-ZFARKE21180", "P-ZTYHGPLTDXC", "P-Z6NP7GS7LN4", "P-Z3STEWYEMDC", "P-ZJWCQN4SU00", "P-ZUEF2H4ZVFK", "P-ZDTN5L88VBK", "P-Z32XHV5Q8IO", "P-ZWGG4451SJ4", "P-ZQ007X20RGG", "P-ZNZDJF1HE9C", "P-Z9MXBBN13RK", "P-Z8KKOX2ZOQO", "P-Z7M914SV034", "P-ZSHCI4Y9BBK", "P-ZG8IDE649Q8", "P-Z9C2P737XQ8", "P-Z0OXZ5QK3GG"], planetNames: []},
    {user: "tiger-zaps", planets: ["P-Z82YCJTJHTS", "P-Z424F2V11HS", "P-ZS8ZKCBA28W", "P-ZBFU19KYKY8", "P-Z5LWLZUOK2O", "P-ZHO66OAUGGW", "P-ZNAENLHRO4G", "P-Z0OXHZ9MTGW", "P-ZKI1M1IL6O0", "P-Z99RAG1KK00", "P-Z09UAX7W200", "P-ZPAE32T725C", "P-ZQR6EWK4W74", "P-ZUO1JEPA1GG", "P-Z9FUOBRVDWG", "P-ZT1CJ3ZM6R4", "P-Z142YAEQFO0", "P-ZE8TH46FVK0", "P-ZPYNKUAGBPC"], planetNames: []},
    //"P-ZF2GU2MGRWG", "P-ZS3RWN9D840", "P-ZXPZG03WPXC", "P-ZZA367LJYRK", "P-ZSJR1UCWGJK", "P-ZL1K8I8Y86O", "P-Z2A6EKIIC00",
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
            {id: "P-ZUEF2H4ZVFK", minimumShipPriority: 100}, // - Explorer / Base
            {id: "P-ZJWCQN4SU00", minimumShipPriority: 100},
            {id: "P-ZJ9690WS03K", minimumShipPriority: 100}, // Xi - ExII-Base - no ship building

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
            {id: "P-ZF2GU2MGRWG", minimumShipPriority: 100}, // Ap58 - new - Explorer / Base
            {id: "P-ZE8TH46FVK0", minimumShipPriority: 100}, // Ap54 - explorers only
            {id: "P-Z142YAEQFO0", minimumShipPriority: 100}, // Ap55 - explorers only

        ]
    },
]

let doNotBuildDataStore = [
    {user: "miniature-tiger", planets:
        ["P-ZVLTZ1VY9LS", "P-ZTUFNYRJSIO", "P-ZPMH4TWB6WW", "P-Z9OF9M3G840", "P-Z5EHJS21S3K", "P-ZUEF2H4ZVFK", "P-ZJWCQN4SU00", "P-ZJ9690WS03K"]
    },
    {user: "tiger-zaps", planets:
        // Delta, Pi, Kappa, ExII-Factory1, Ap-54, Ap-55
        ["P-ZY9Q75PXWWW", "P-Z8JQAIQIU3K", "P-ZAF8WG5WM00", "P-ZR10UOAG7TS"]
    },
]

let shipMarket = [
    {type: "corvette", version: 0, minPrice: 10},
    {type: "frigate", version: 0, minPrice: 20},
    {type: "destroyer", version: 0, minPrice: 30},
    {type: "cruiser", version: 0, minPrice: 40},
    {type: "battlecruiser", version: 0, minPrice: 100},
    {type: "carrier", version: 0, minPrice: 300},
    {type: "dreadnought", version: 0, minPrice: 800},
    {type: "cutter2", version: 2, minPrice: 20},
    {type: "corvette2", version: 2, minPrice: 40},
    {type: "frigate2", version: 2, minPrice: 70},
    {type: "destroyer2", version: 2, minPrice: 140},
    {type: "cruiser2", version: 2, minPrice: 200},
    {type: "battlecruiser2", version: 2, minPrice: 500},
    {type: "carrier2", version: 2, minPrice: 5000},
    //{type: "dreadnought2", version: 2, minPrice: 9000}
];

let planetOrderForShipSales = [
    // tiger-zaps
    // "Alpha", "Epsilon", "Zeta", "Theta", "Rho", "Sigma"
    // "Pi", "Kappa", "Beta", "Rho", "Sigma", "Delta"
    {user: "tiger-zaps", version0: ["P-ZCBO9MBOJ2O", "P-ZKEAGJ7U4LC", "P-ZF6H61862UO", "P-ZHC7OXN5PIO", "P-Z1T7TSC5EZ4", "P-ZI65C8IRYY8", "P-Z3OROQ7NVC0", "P-ZK5N7AA9HXC", "P-Z7QZW0I1B4G", "P-ZT3JJ1U11A8"], version2: ["P-ZKJ1RH4KDE8", "P-Z7BD6L8E58G", "P-Z6U5W8PSG34", "P-Z8JQAIQIU3K", "P-ZAF8WG5WM00", "P-ZTNYF56W2VK", "P-Z1T7TSC5EZ4", "P-ZI65C8IRYY8", "P-ZY9Q75PXWWW", "P-Z3OROQ7NVC0"]},
];


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

function findIndexInShipMarket(shipType) {
    return  shipMarket.findIndex(ship => ship.type == shipType);
}

function fetchUserPlanetOrderForShipSales(user) {
    let userIndex = planetOrderForShipSales.findIndex(data => data.user == user);
    return planetOrderForShipSales[userIndex];
}
