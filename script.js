// URL for fetching data. 
// แทนที่ URL เหล่านี้ด้วย "Published CSV URL" จาก Google Sheets ในแต่ละย่าน
const CSV_URLS = {
    "Siam": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTmnMQBGIfVWa1sHLlYBbvT6A8qtNwFYysF-gNS4gJuuLBO6pQi7JrhyrwiPBegobjad4ErtwIlvLiI/pub?gid=0&single=true&output=csv",
    "Ari": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTmnMQBGIfVWa1sHLlYBbvT6A8qtNwFYysF-gNS4gJuuLBO6pQi7JrhyrwiPBegobjad4ErtwIlvLiI/pub?gid=133828882&single=true&output=csv",
    "Thong Lo": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTmnMQBGIfVWa1sHLlYBbvT6A8qtNwFYysF-gNS4gJuuLBO6pQi7JrhyrwiPBegobjad4ErtwIlvLiI/pub?gid=170905705&single=true&output=csv",
    "Asok": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTmnMQBGIfVWa1sHLlYBbvT6A8qtNwFYysF-gNS4gJuuLBO6pQi7JrhyrwiPBegobjad4ErtwIlvLiI/pub?gid=427322320&single=true&output=csv",
    "Phrom Phong": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTmnMQBGIfVWa1sHLlYBbvT6A8qtNwFYysF-gNS4gJuuLBO6pQi7JrhyrwiPBegobjad4ErtwIlvLiI/pub?gid=148230599&single=true&output=csv"
}; 

// Cache สำหรับเก็บข้อมูลที่เคยโหลดมาแล้วจะได้ไม่ต้องโหลดใหม่
let cachedData = {};
let currentFilter = 'top';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Area Selector
    const areaSelect = document.getElementById('area-select');
    areaSelect.addEventListener('change', handleAreaChange);

    // Initialize Filter Buttons
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.addEventListener('click', handleFilterChange);
    });

    // Initialize Modal
    setupModal();

    // Fetch initial data based on default selection
    const initialArea = areaSelect.value;
    fetchDataForArea(initialArea);
});

function handleAreaChange(e) {
    const selectedArea = e.target.value;
    const body = document.body;
    const overlay = document.getElementById('theme-overlay');
    
    // Smooth transition effect
    overlay.classList.add('active');
    
    setTimeout(() => {
        // Remove existing theme classes
        body.className = '';
        
        // Add new theme class based on selection
        const themeClass = 'theme-' + selectedArea.replace(/\s+/g, '').toLowerCase();
        body.classList.add(themeClass);
        
        // Update area text in UI
        document.querySelectorAll('.current-area-text').forEach(el => {
            el.textContent = selectedArea;
        });

        // Fetch or render cached data
        fetchDataForArea(selectedArea);
        
        // Fade out overlay
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 100);
    }, 400);
}

function handleFilterChange(e) {
    // Update active class
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    currentFilter = e.target.getAttribute('data-filter');
    
    // Re-render
    const area = document.getElementById('area-select').value;
    if (cachedData[area]) {
        renderData(cachedData[area], area);
    }
}

function fetchDataForArea(area) {
    // ถ้ามีข้อมูลใน Cache แล้ว ให้ Render เลย
    if (cachedData[area]) {
        renderData(cachedData[area], area);
        return;
    }

    // ถ้ายังไม่มีให้โชว์ Loading
    document.getElementById('loading-indicator').style.display = 'block';
    document.getElementById('data-content').style.display = 'none';

    const url = CSV_URLS[area];

    Papa.parse(url, {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
            let data = results.data;
            
            if(url.includes('data.csv')) {
                data = data.filter(r => r.area === area);
            }

            cachedData[area] = data;
            document.getElementById('loading-indicator').style.display = 'none';
            document.getElementById('data-content').style.display = 'block';
            
            renderData(data, area);
        },
        error: function(error) {
            console.error("Error fetching CSV:", error);
            document.getElementById('loading-indicator').style.display = 'block';
            document.getElementById('loading-indicator').innerHTML = `<p style="color:red">Failed to load data for ${area}. Please check your CSV URL. (${error.message})</p>`;
        }
    });
}

function renderData(data, area) {
    // กรองร้านที่เหมาะกับกลุ่มเบื้องต้น
    let validRestaurants = data.filter(r => r.suitable_for_group === 'Yes' || String(r.suitable_for_group).toLowerCase() === 'true');
    
    // All Restaurants (ข้อมูลทั้งหมด จัดเรียงตามคะแนนรวมเป็นหลัก)
    let allSorted = [...validRestaurants].sort((a, b) => b.total_score - a.total_score);
    renderAllRestaurants(allSorted);

    // Top 3 Recommendations (จัดเรียงตาม Filter ที่เลือก)
    let filteredTop = [...validRestaurants];

    if (currentFilter === 'top') {
        filteredTop.sort((a, b) => b.total_score - a.total_score);
    } 
    else if (currentFilter === 'budget') {
        // เน้นคะแนนราคา (score_price)
        filteredTop.sort((a, b) => {
            if (b.score_price !== a.score_price) return b.score_price - a.score_price;
            return b.total_score - a.total_score;
        });
    } 
    else if (currentFilter === 'meeting') {
        // เน้นคะแนนความเหมาะสมกับกลุ่ม (score_group)
        filteredTop.sort((a, b) => {
            if (b.score_group !== a.score_group) return b.score_group - a.score_group;
            return b.total_score - a.total_score;
        });
    } 
    else if (currentFilter === 'fastfood') {
        // กรองหาคำที่เกี่ยวข้องกับฟาสต์ฟู้ด อาหารจานด่วน หรือคาเฟ่
        let fastFoodMatches = filteredTop.filter(r => {
            const type = String(r.food_type).toLowerCase();
            return type.includes('fast') || type.includes('ด่วน') || type.includes('cafe') || type.includes('คาเฟ่') || type.includes('burger') || type.includes('กาแฟ') || type.includes('เบเกอรี่');
        });
        
        // ถ้าเจอร้านที่ตรงหมวด ให้ใช้กลุ่มนั้น ถ้าไม่เจอให้ใช้ทั้งหมด
        if (fastFoodMatches.length > 0) {
            filteredTop = fastFoodMatches;
        }
        filteredTop.sort((a, b) => b.total_score - a.total_score);
    }

    const top3 = filteredTop.slice(0, 3);

    renderTop3(top3);
    renderComparison(top3);
}

function formatOpeningHours(hoursStr) {
    if (!hoursStr) return '-';
    let parts = hoursStr.split(';').map(s => s.trim());
    
    const dayOrder = {
        'วันอาทิตย์': 0, 'อาทิตย์': 0, 'อา.': 0,
        'วันจันทร์': 1, 'จันทร์': 1, 'จ.': 1,
        'วันอังคาร': 2, 'อังคาร': 2, 'อ.': 2,
        'วันพุธ': 3, 'พุธ': 3, 'พ.': 3,
        'วันพฤหัสบดี': 4, 'พฤหัสบดี': 4, 'พฤ.': 4,
        'วันศุกร์': 5, 'ศุกร์': 5, 'ศ.': 5,
        'วันเสาร์': 6, 'เสาร์': 6, 'ส.': 6
    };
    
    parts.sort((a, b) => {
        let orderA = 99, orderB = 99;
        for (const [day, val] of Object.entries(dayOrder)) {
            if (a.includes(day)) { orderA = Math.min(orderA, val); }
            if (b.includes(day)) { orderB = Math.min(orderB, val); }
        }
        return orderA - orderB;
    });

    return parts.join('<br>');
}

function renderAllRestaurants(data) {
    const tbody = document.getElementById('all-restaurants-body');
    tbody.innerHTML = '';

    if(data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center">No data available for this area.</td></tr>`;
        return;
    }

    data.forEach((restaurant, index) => {
        const rank = index + 1;
        let rankHtml = rank;
        if(rank <= 3) {
            rankHtml = `<span class="rank-badge rank-${rank}">${rank}</span>`;
        }
        
        const phoneHtml = restaurant.phone ? `<br><small><i class="fa-solid fa-phone" style="font-size:0.8em"></i> ${restaurant.phone}</small>` : '';
        const hoursHtml = formatOpeningHours(restaurant.opening_hours);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${rankHtml}</td>
            <td><strong>${restaurant.restaurant_name}</strong><br><small>${restaurant.location}</small>${phoneHtml}</td>
            <td>${restaurant.food_type}<br><small>${restaurant.price_range || '-'}</small></td>
            <td><small>${hoursHtml}</small></td>
            <td><i class="fa-solid fa-star" style="color:var(--accent-color)"></i> ${restaurant.google_rating} <small>(${restaurant.review_count})</small></td>
            <td><strong>${restaurant.total_score}</strong> / 100</td>
            <td>
                <div style="display:flex; flex-direction:column; gap:0.5rem;">
                    <a href="${restaurant.source_url}" target="_blank" class="btn-small" style="text-align:center; display:block;">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Go to Restaurant
                    </a>
                    <button class="btn-small" onclick="openMapModal('${restaurant.restaurant_name}', '${restaurant.map_embed_url}')">
                        <i class="fa-solid fa-map"></i> View Map
                    </button>
                    <button class="btn-small" onclick="openDetailsModal('${restaurant.id}', '${restaurant.area}')">
                        <i class="fa-solid fa-circle-info"></i> Details
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderTop3(data) {
    const container = document.getElementById('top3-container');
    container.innerHTML = '';

    if(data.length === 0) {
        container.innerHTML = `<p style="text-align:center; grid-column: 1/-1;">ไม่มีร้านอาหารที่ตรงตามเงื่อนไขนี้</p>`;
        return;
    }

    data.forEach((restaurant, index) => {
        const rank = index + 1;
        const defaultImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800';
        const imgUrl = restaurant.image_url || defaultImage;
        const phone = restaurant.phone || '-';

        const card = document.createElement('div');
        card.className = 'restaurant-card';
        card.innerHTML = `
            <div class="card-img" style="background-image: url('${imgUrl}')">
                <div class="card-rank">#${rank}</div>
            </div>
            <div class="card-content">
                <h3 class="card-title">${restaurant.restaurant_name}</h3>
                <div class="card-meta">
                    <span><i class="fa-solid fa-star"></i> ${restaurant.google_rating}</span>
                    <span><i class="fa-solid fa-coins"></i> ${restaurant.price_range}</span>
                    <span><i class="fa-solid fa-phone"></i> ${phone}</span>
                </div>
                <div class="ai-reasoning">
                    <i class="fa-solid fa-quote-left" style="color:var(--glass-border)"></i>
                    ${restaurant.ai_reasoning}
                </div>
                <div class="card-actions">
                    <a href="${restaurant.source_url}" target="_blank" class="btn-primary">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Go to Restaurant
                    </a>
                    <button class="btn-secondary" onclick="openMapModal('${restaurant.restaurant_name}', '${restaurant.map_embed_url}')">
                        <i class="fa-solid fa-location-dot"></i> Map
                    </button>
                    <button class="btn-secondary" onclick="openDetailsModal('${restaurant.id}', '${restaurant.area}')">
                        <i class="fa-solid fa-circle-info"></i> Details
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderComparison(data) {
    const container = document.getElementById('comparison-container');
    container.innerHTML = '';

    if(data.length === 0) {
        return;
    }

    data.forEach((restaurant, index) => {
        const box = document.createElement('div');
        box.className = 'compare-box glass-card';
        box.innerHTML = `
            <h4 class="compare-title">#${index+1} ${restaurant.restaurant_name}</h4>
            <div class="pro-con">
                <h5 class="pro"><i class="fa-solid fa-check-circle"></i> จุดเด่น (Highlights)</h5>
                <p>${restaurant.ai_reasoning}</p>
            </div>
            <div class="pro-con">
                <h5 class="con"><i class="fa-solid fa-circle-exclamation"></i> ข้อควรระวัง (Trade-offs)</h5>
                <p>${restaurant.ai_tradeoff || 'ไม่พบข้อมูล'}</p>
            </div>
            <hr style="border:0; border-top:1px solid var(--glass-border); margin: 1rem 0;">
            <p style="font-size: 0.85rem; text-align:center;">
                Score breakdown: <br>
                Rate: ${restaurant.score_rating} | Grp: ${restaurant.score_group} | Prc: ${restaurant.score_price} <br>
                Trvl: ${restaurant.score_travel} | Data: ${restaurant.score_data} | Uniq: ${restaurant.score_unique}
            </p>
        `;
        container.appendChild(box);
    });
}

// Modal functions
function setupModal() {
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('show');
        }
    }
}

window.closeMapModal = function() {
    document.getElementById('map-modal').classList.remove('show');
}

window.closeDetailsModal = function() {
    document.getElementById('details-modal').classList.remove('show');
}

window.openMapModal = function(title, mapUrl) {
    document.getElementById('modal-title').textContent = "Map: " + title;
    
    // Sanitize or fallback mapUrl if not present
    if (!mapUrl || mapUrl === 'null' || mapUrl === '') {
        document.getElementById('modal-iframe-container').innerHTML = `<p style="text-align:center; padding: 2rem;">Map embed URL not available.</p>`;
    } else {
        document.getElementById('modal-iframe-container').innerHTML = `<iframe src="${mapUrl}" allowfullscreen="" loading="lazy"></iframe>`;
    }
    
    document.getElementById('map-modal').classList.add('show');
}

window.openDetailsModal = function(id, area) {
    // Find the restaurant data
    const dataList = cachedData[area] || [];
    const restaurant = dataList.find(r => String(r.id) === String(id));
    
    if(!restaurant) return;

    document.getElementById('details-title').innerHTML = `<i class="fa-solid fa-store"></i> ${restaurant.restaurant_name}`;
    
    const body = document.getElementById('details-body');
    body.innerHTML = `
        <div class="details-grid">
            <div class="detail-section">
                <h4>General Information</h4>
                <div class="detail-item"><strong>ID:</strong> <span>${restaurant.id}</span></div>
                <div class="detail-item"><strong>Name:</strong> <span>${restaurant.restaurant_name}</span></div>
                <div class="detail-item"><strong>Area:</strong> <span>${restaurant.area}</span></div>
                <div class="detail-item"><strong>Food Type:</strong> <span>${restaurant.food_type}</span></div>
                <div class="detail-item"><strong>Rating:</strong> <span>${restaurant.google_rating} (${restaurant.review_count} reviews)</span></div>
                <div class="detail-item"><strong>Price Range:</strong> <span>${restaurant.price_range}</span></div>
                <div class="detail-item"><strong>Location:</strong> <span>${restaurant.location}</span></div>
                <div class="detail-item"><strong>Phone:</strong> <span>${restaurant.phone || '-'}</span></div>
                <div class="detail-item"><strong>Travel Note:</strong> <span>${restaurant.travel_note}</span></div>
                <div class="detail-item"><strong>Hours:</strong> <span>${formatOpeningHours(restaurant.opening_hours)}</span></div>
                <div class="detail-item" style="margin-top: 1rem;"><a href="${restaurant.source_url}" target="_blank" class="btn-small" style="text-decoration:none;"><i class="fa-solid fa-link"></i> Source URL</a></div>
            </div>
            
            <div class="detail-section">
                <h4>Scoring Breakdown</h4>
                <div class="detail-item"><strong>Rating Score:</strong> <span>${restaurant.score_rating} / 20</span></div>
                <div class="detail-item"><strong>Group Score:</strong> <span>${restaurant.score_group} / 20</span></div>
                <div class="detail-item"><strong>Price Score:</strong> <span>${restaurant.score_price} / 15</span></div>
                <div class="detail-item"><strong>Travel Score:</strong> <span>${restaurant.score_travel} / 15</span></div>
                <div class="detail-item"><strong>Data Score:</strong> <span>${restaurant.score_data} / 15</span></div>
                <div class="detail-item"><strong>Unique Score:</strong> <span>${restaurant.score_unique} / 15</span></div>
                <div class="detail-item" style="margin-top: 1rem; border-top: 1px dashed var(--glass-border); padding-top: 1rem;">
                    <strong><i class="fa-solid fa-trophy"></i> TOTAL SCORE:</strong> <span style="color:var(--accent-color); font-weight:bold; font-size:1.1rem;">${restaurant.total_score} / 100</span>
                </div>
            </div>
            
            <div class="detail-section detail-full-width">
                <h4><i class="fa-solid fa-robot"></i> AI Analysis</h4>
                <div class="detail-item"><strong>Reasoning:</strong><br> <span style="display:block; margin-top:0.5rem; line-height:1.6; font-style:italic;">${restaurant.ai_reasoning}</span></div>
                <div class="detail-item" style="margin-top:1.5rem;"><strong>Trade-offs:</strong><br> <span style="display:block; margin-top:0.5rem; line-height:1.6; font-style:italic;">${restaurant.ai_tradeoff || 'No trade-offs found.'}</span></div>
            </div>
        </div>
    `;
    
    document.getElementById('details-modal').classList.add('show');
}
