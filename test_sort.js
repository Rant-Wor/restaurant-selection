const fs = require('fs');
const https = require('https');

const urls = [
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTmnMQBGIfVWa1sHLlYBbvT6A8qtNwFYysF-gNS4gJuuLBO6pQi7JrhyrwiPBegobjad4ErtwIlvLiI/pub?gid=0&single=true&output=csv",
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTmnMQBGIfVWa1sHLlYBbvT6A8qtNwFYysF-gNS4gJuuLBO6pQi7JrhyrwiPBegobjad4ErtwIlvLiI/pub?gid=133828882&single=true&output=csv",
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTmnMQBGIfVWa1sHLlYBbvT6A8qtNwFYysF-gNS4gJuuLBO6pQi7JrhyrwiPBegobjad4ErtwIlvLiI/pub?gid=170905705&single=true&output=csv",
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTmnMQBGIfVWa1sHLlYBbvT6A8qtNwFYysF-gNS4gJuuLBO6pQi7JrhyrwiPBegobjad4ErtwIlvLiI/pub?gid=427322320&single=true&output=csv",
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTmnMQBGIfVWa1sHLlYBbvT6A8qtNwFYysF-gNS4gJuuLBO6pQi7JrhyrwiPBegobjad4ErtwIlvLiI/pub?gid=148230599&single=true&output=csv"
];

function fetch(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetch(res.headers.location).then(resolve).catch(reject);
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function run() {
    for (const url of urls) {
        const csv = await fetch(url);
        const lines = csv.split('\n').map(l => l.trim()).filter(l => l);
        const header = lines[0].split(',');
        const scoreIdx = header.indexOf('total_score');
        const nameIdx = header.indexOf('restaurant_name');
        const areaIdx = header.indexOf('area');
        
        let rows = lines.slice(1).map(line => {
            // simple csv parse, ignoring commas in quotes for now if possible
            // actually it's easier to just match from the back since total_score is 6th from end
            // id,restaurant_name,area,food_type,google_rating,review_count,price_range,location,travel_note,opening_hours,suitable_for_group,source_url,score_rating,score_group,score_price,score_travel,score_data,score_unique,total_score,image_url,phone,map_embed_url,ai_reasoning,ai_tradeoff
            const parts = line.split('http')[0].split(',');
            // let's just find total_score with regex or assume the frontend papaparse handles it.
            // But doing it via node easily:
            let p = line.split(',');
            return {
                name: p[1],
                area: p[2],
                score: parseFloat(p[18]) || 0,
                line: line
            };
        });
        
        // precise regex for total_score: it's right before http...
        rows.sort((a,b) => b.score - a.score);
        console.log(`Top in ${rows[0].area}: ${rows[0].name} - Score: ${rows[0].score}`);
    }
}
run();
