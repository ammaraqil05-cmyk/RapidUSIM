// Data Laluan Bas USIM & Hentian
const routesData = {
    "USIM01": {
        name: "Laluan 01 - Nilai Impian ke Kampus Utama",
        buses: [
            { id: "NDB 1082", driver: "En. Azman", status: "ON TRIP", capacity: "80%" },
            { id: "NDB 3041", driver: "En. Khairul", status: "ON TRIP", capacity: "45%" }
        ],
        stops: [
            { id: 1, name: "Kolej Kediaman Nilai Impian", lat: 2.8312, lng: 101.7821, time: "0 Min", isPointA: true, oku: true },
            { id: 2, name: "Persiaran Negeri Sembilan", lat: 2.8420, lng: 101.7800, time: "4 Min", oku: false },
            { id: 3, name: "Pusat Kesihatan USIM", lat: 2.8510, lng: 101.7835, time: "8 Min", oku: true },
            { id: 4, name: "Fakulti Kepimpinan & Pengurusan (FKP)", lat: 2.8542, lng: 101.7850, time: "12 Min", oku: true },
            { id: 5, name: "Pusat Sukan USIM", lat: 2.8570, lng: 101.7880, time: "16 Min", oku: false },
            { id: 6, name: "Chancellery Kampus Utama", lat: 2.8601, lng: 101.7912, time: "20 Min", isPointB: true, oku: true }
        ]
    },
    "USIM02": {
        name: "Laluan 02 - Stesen KTM Nilai ke Chancellery",
        buses: [
            { id: "NDB 5520", driver: "En. Rahman", status: "ON TRIP", capacity: "90%" },
            { id: "NDB 8812", driver: "En. Faizal", status: "OFF TRIP", capacity: "0%" }
        ],
        stops: [
            { id: 101, name: "Stesen KTM Nilai", lat: 2.8180, lng: 101.7970, time: "0 Min", isPointA: true, oku: true },
            { id: 102, name: "Bandar Baru Nilai (AEON)", lat: 2.8240, lng: 101.7910, time: "5 Min", oku: true },
            { id: 103, name: "Kolej Kediaman Acacia Avenue", lat: 2.8380, lng: 101.7880, time: "10 Min", oku: false },
            { id: 104, name: "Fakulti Sains & Teknologi (FST)", lat: 2.8530, lng: 101.7870, time: "16 Min", oku: true },
            { id: 105, name: "Chancellery Kampus Utama", lat: 2.8601, lng: 101.7912, time: "22 Min", isPointB: true, oku: true }
        ]
    },
    "USIM03": {
        name: "Laluan 03 - Pusat Perubatan USIM ke FST",
        buses: [
            { id: "NDB 7741", driver: "En. Hafiz", status: "ON TRIP", capacity: "30%" }
        ],
        stops: [
            { id: 201, name: "Pusat Perubatan & Klinik USIM", lat: 2.8480, lng: 101.7750, time: "0 Min", isPointA: true, oku: true },
            { id: 202, name: "Perpustakaan Utama USIM", lat: 2.8550, lng: 101.7860, time: "6 Min", oku: true },
            { id: 203, name: "Fakulti Perubatan & Sains Kesihatan", lat: 2.8580, lng: 101.7890, time: "11 Min", oku: true },
            { id: 204, name: "Fakulti Sains & Teknologi (FST)", lat: 2.8530, lng: 101.7870, time: "15 Min", isPointB: true, oku: true }
        ]
    }
};

let currentRouteKey = "USIM01";
let selectedBusIndex = 0;
let map, markersGroup, busMarker;
let simInterval = null;
let simProgress = 0;

// Inisialisasi Peta Leaflet
function initMap() {
    // Coordinate USIM Nilai
    map = L.map('map').setView([2.8530, 101.7850], 14);

    // Dark Mode Tile Map (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    markersGroup = L.layerGroup().addTo(map);

    renderSelectedRoute();
}

// Tukar Laluan Bas
function changeRoute() {
    currentRouteKey = document.getElementById('route-select').value;
    selectedBusIndex = 0;
    simProgress = 0;
    renderSelectedRoute();
}

// Paparkan Unit Bas
function renderBusUnits() {
    const route = routesData[currentRouteKey];
    const container = document.getElementById('bus-unit-container');
    container.innerHTML = '';

    route.buses.forEach((bus, index) => {
        const isSelected = index === selectedBusIndex;
        const btn = document.createElement('button');
        btn.onclick = () => {
            selectedBusIndex = index;
            simProgress = 0;
            renderSelectedRoute();
        };
        btn.className = `p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
            isSelected 
            ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg' 
            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
        }`;

        btn.innerHTML = `
            <div class="flex items-center justify-between w-full mb-1">
                <span class="font-bold text-xs ${isSelected ? 'text-blue-400' : 'text-slate-300'}">${bus.id}</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded font-bold ${bus.status === 'ON TRIP' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}">${bus.status}</span>
            </div>
            <div class="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Pemandu: ${bus.driver}</span>
                <span class="text-amber-400 font-semibold">${bus.capacity}</span>
            </div>
        `;
        container.appendChild(btn);
    });

    const activeBus = route.buses[selectedBusIndex];
    document.getElementById('active-bus-tag').innerText = `Bas: ${activeBus ? activeBus.id : 'Tiada'}`;
}

// Paparkan Laluan, Hentian & Marker Peta
function renderSelectedRoute() {
    markersGroup.clearLayers();
    renderBusUnits();

    const route = routesData[currentRouteKey];
    const stops = route.stops;
    const stopsContainer = document.getElementById('stops-container');
    stopsContainer.innerHTML = '';

    // Draw Route Polyline on Map
    const latLngs = stops.map(s => [s.lat, s.lng]);
    const polyline = L.polyline(latLngs, {
        color: '#3b82f6',
        weight: 5,
        opacity: 0.8,
        dashArray: '10, 10'
    }).addTo(markersGroup);

    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    // Add Stop Markers & Populate Sidebar List
    stops.forEach((stop, idx) => {
        // Map Marker Icon
        const isTerminus = stop.isPointA || stop.isPointB;
        const markerHtml = `
            <div class="w-6 h-6 rounded-full ${isTerminus ? 'bg-amber-500' : 'bg-blue-600'} text-white text-[10px] font-black flex items-center justify-center border-2 border-slate-900 shadow-xl">
                ${idx + 1}
            </div>
        `;
        const customIcon = L.divIcon({
            html: markerHtml,
            className: '',
            iconSize: [24, 24]
        });

        L.marker([stop.lat, stop.lng], { icon: customIcon })
            .bindPopup(`<strong class="text-slate-900">${stop.name}</strong><br>Anggaran Masa: ${stop.time}`)
            .addTo(markersGroup);

        // Thermometer List Item in Sidebar
        const item = document.createElement('div');
        item.className = "relative flex items-start gap-3 p-3 bg-slate-950 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors";
        
        item.innerHTML = `
            <div class="flex flex-col items-center">
                <div class="w-6 h-6 rounded-full ${isTerminus ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'} text-xs font-bold flex items-center justify-center">
                    ${idx + 1}
                </div>
                ${idx < stops.length - 1 ? '<div class="w-0.5 h-8 bg-slate-800 my-1"></div>' : ''}
            </div>
            <div class="flex-1">
                <div class="flex items-center justify-between">
                    <h4 class="text-xs font-bold text-slate-200">${stop.name}</h4>
                    <span class="text-[10px] font-bold bg-slate-900 text-blue-400 px-2 py-0.5 rounded border border-slate-800">${stop.time}</span>
                </div>
                <div class="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                    ${stop.oku ? '<span class="text-indigo-400"><i class="fa-solid fa-wheelchair"></i> Mesra OKU</span>' : ''}
                    ${stop.isPointA ? '<span class="text-amber-400 font-semibold">• Hentian Permulaan</span>' : ''}
                    ${stop.isPointB ? '<span class="text-amber-400 font-semibold">• Hentian Akhir</span>' : ''}
                </div>
            </div>
        `;
        stopsContainer.appendChild(item);
    });

    // Initial Simulated Bus Position on Map
    updateBusPositionOnMap(stops[0].lat, stops[0].lng);
}

// Kemaskini Kedudukan Bas dalam Peta
function updateBusPositionOnMap(lat, lng) {
    if (busMarker) {
        markersGroup.removeLayer(busMarker);
    }

    const busHtml = `
        <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center animate-ping absolute"></div>
            <div class="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-white shadow-2xl z-10">
                <i class="fa-solid fa-bus"></i>
            </div>
        </div>
    `;

    const busIcon = L.divIcon({
        html: busHtml,
        className: 'bus-live-marker',
        iconSize: [32, 32]
    });

    busMarker = L.marker([lat, lng], { icon: busIcon }).addTo(markersGroup);
}

// Simulasi Pergerakan Bas secara Live
function toggleTrafficSim() {
    const btn = document.getElementById('sim-btn');
    if (simInterval) {
        clearInterval(simInterval);
        simInterval = null;
        btn.className = "p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow";
        btn.innerHTML = '<i class="fa-solid fa-play"></i>';
    } else {
        btn.className = "p-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors shadow";
        btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        
        const stops = routesData[currentRouteKey].stops;
        simInterval = setInterval(() => {
            simProgress += 0.05;
            if (simProgress >= stops.length - 1) {
                simProgress = 0;
            }

            const currentIndex = Math.floor(simProgress);
            const nextIndex = Math.min(currentIndex + 1, stops.length - 1);
            const ratio = simProgress - currentIndex;

            const currentStop = stops[currentIndex];
            const nextStop = stops[nextIndex];

            const currentLat = currentStop.lat + (nextStop.lat - currentStop.lat) * ratio;
            const currentLng = currentStop.lng + (nextStop.lng - currentStop.lng) * ratio;

            updateBusPositionOnMap(currentLat, currentLng);
            
            // Update timestamp
            const now = new Date();
            document.getElementById('last-update').innerText = now.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }, 1000);
    }
}

// Semula Kedudukan Peta ke Pusat USIM
function recenterMap() {
    map.setView([2.8530, 101.7850], 14);
}

// Pelancaran Aplikasi pada Window Load
window.onload = function() {
    initMap();
};
