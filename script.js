// Initial values
let aiUsers = 1320000000;
let neverUsed = 6800000000;
const ratePerSecond = 4;
const totalPopulation = aiUsers + neverUsed;

// Fixed sub-stats
const paidUsers = 20000000;
const powerUsers = 3500000;

// DOM Elements
const aiUsersEl = document.getElementById('ai-users');
const neverUsedEl = document.getElementById('never-used');
const aiPercentageLabel = document.getElementById('ai-percentage-label');
const neverPercentageLabel = document.getElementById('never-percentage-label');
const globalAvgPctEl = document.getElementById('global-avg-pct');
const globalAvgFillEl = document.getElementById('global-avg-fill');
const freeUsersEl = document.getElementById('free-users');
const shareBtn = document.getElementById('share-twitter');

// 1. D3 SVG World Map
async function renderMap() {
    const container = document.getElementById('svg-map-container');
    const width = 800;
    const height = 400;

    const svg = d3.select(container)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const projection = d3.geoEquirectangular()
        .scale(130)
        .translate([width / 2, height / 2 + 20]);

    const path = d3.geoPath().projection(projection);

    try {
        const world = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
        const countries = topojson.feature(world, world.objects.countries).features;

        svg.append("g")
            .selectAll("path")
            .data(countries)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", d => {
                const name = d.properties.name ? d.properties.name.toLowerCase() : "";

                const blue = ["united states of america", "united states", "canada", "australia", "united kingdom", "germany", "france", "netherlands", "sweden", "norway", "denmark"];
                const orange = ["china", "japan", "south korea", "korea", "singapore", "united arab emirates", "israel", "spain", "italy"];
                const green = ["brazil", "mexico", "argentina", "turkey", "malaysia", "thailand", "vietnam", "philippines", "south africa"];
                const purple = ["india", "indonesia", "egypt", "nigeria", "kenya", "colombia", "chile", "pakistan"];

                if (blue.includes(name)) return "#4A90D9";
                if (orange.includes(name)) return "#F5A623";
                if (green.includes(name)) return "#7ED321";
                if (purple.includes(name)) return "#9B59B6";
                return "#1E1E1E";
            })
            .attr("stroke", "#080808")
            .attr("stroke-width", 0.5);
    } catch (e) {
        console.error("Failed to load map data: ", e);
    }
}
renderMap();

// 2. Initialize Giant Waffle Grid (2500 squares)
function initGiantWaffle() {
    const container = document.getElementById('giant-waffle');
    if (!container) return;
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    // Total: 2500 squares.
    // 2100 never used (grey) -> Top-left to bottom
    for (let i = 0; i < 2100; i++) {
        const cell = document.createElement('div');
        cell.className = 'giant-waffle-cell cell-never';
        fragment.appendChild(cell);
    }
    // 375 free users (white)
    for (let i = 0; i < 375; i++) {
        const cell = document.createElement('div');
        cell.className = 'giant-waffle-cell cell-free';
        fragment.appendChild(cell);
    }
    // 19 paid users (light grey)
    for (let i = 0; i < 19; i++) {
        const cell = document.createElement('div');
        cell.className = 'giant-waffle-cell cell-paid';
        fragment.appendChild(cell);
    }
    // 6 power users (red) -> Bottom-right
    for (let i = 0; i < 6; i++) {
        const cell = document.createElement('div');
        cell.className = 'giant-waffle-cell cell-power';
        fragment.appendChild(cell);
    }
    container.appendChild(fragment);
}
initGiantWaffle();

// Formatter for numbers
const numberFormatter = new Intl.NumberFormat('en-US');

// Start time to calculate increments accurately based on elapsed time
const startTime = Date.now();

function updateCounters() {
    // Calculate how many seconds have passed, including fractions
    const elapsedSeconds = (Date.now() - startTime) / 1000;

    // Calculate current values (use Math.floor to show integer increments)
    const currentAiUsers = Math.floor(aiUsers + (elapsedSeconds * ratePerSecond));
    const currentNeverUsed = Math.floor(neverUsed - (elapsedSeconds * ratePerSecond));

    // Update percentages
    const adoptionRate = (currentAiUsers / totalPopulation) * 100;
    const neverUsedRate = 100 - adoptionRate;

    // Update DOM texts
    aiUsersEl.textContent = numberFormatter.format(currentAiUsers);
    neverUsedEl.textContent = numberFormatter.format(currentNeverUsed);

    aiPercentageLabel.textContent = adoptionRate.toFixed(2) + '%';
    neverPercentageLabel.textContent = neverUsedRate.toFixed(2) + '%';

    // Global Average Updates
    globalAvgPctEl.textContent = adoptionRate.toFixed(2) + '%';
    globalAvgFillEl.style.width = adoptionRate + '%';

    // Dynamic free users (Total AI - Paid - Power)
    const currentFreeUsers = currentAiUsers - paidUsers - powerUsers;
    freeUsersEl.textContent = numberFormatter.format(currentFreeUsers);

    // Update Twitter Share Link
    const formattedAdoption = adoptionRate.toFixed(1);
    const formattedNever = (100 - adoptionRate).toFixed(1);
    const tweetText = `${formattedAdoption}% of humanity has used AI. ${formattedNever}% haven't. Watch the clock tick in real time [link] via @yourhandle`;
    shareBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

    requestAnimationFrame(updateCounters);
}

// Start counter update loop
updateCounters();
