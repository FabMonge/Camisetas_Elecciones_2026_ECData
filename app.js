// ===============================================
// CONFIGURACIÓN MACRO (ARQUITECTURA)
// ===============================================
const CONFIG = {
    // Fase 1: Rankings con sus 3 columnas restauradas
    rankings: [
        {
            titulo: "Presidenciables",
            candidatos: [
                { nombre: "Candidato A", partidos: 8, foto: "cand_a" },
                { nombre: "Candidato B", partidos: 6, foto: "cand_b" },
                { nombre: "Candidato C", partidos: 5, foto: "cand_c" },
                { nombre: "Candidato D", partidos: 4, foto: "cand_d" },
                { nombre: "Candidato E", partidos: 4, foto: "cand_e" }
            ]
        },
        {
            titulo: "Congresistas",
            candidatos: [
                { nombre: "Congresista A", partidos: 7, foto: "cong_a" },
                { nombre: "Congresista B", partidos: 6, foto: "cong_b" },
                { nombre: "Congresista C", partidos: 5, foto: "cong_c" },
                { nombre: "Congresista D", partidos: 5, foto: "cong_d" },
                { nombre: "Congresista E", partidos: 3, foto: "cong_e" }
            ]
        },
        {
            titulo: "Gobernadores",
            candidatos: [
                { nombre: "Gobernador A", partidos: 9, foto: "gob_a" },
                { nombre: "Gobernador B", partidos: 6, foto: "gob_b" },
                { nombre: "Gobernador C", partidos: 4, foto: "gob_c" },
                { nombre: "Gobernador D", partidos: 4, foto: "gob_d" },
                { nombre: "Gobernador E", partidos: 3, foto: "gob_e" }
            ]
        }
    ],
    colores: {
        partidos: {
            "FUERZA POPULAR": "#F39C12",
            "RENOVACION POPULAR": "#2980B9",
            "PERU LIBRE": "#C0392B",
            "AHORA NACION - AN": "#8E44AD",
            "ALIANZA PARA EL PROGRESO": "#27AE60",
            "DEFECTO": "#95A5A6"
        }
    },
    archivos: {
        masterJSON: "data/candidatos_master.json" 
    }
};

let todosLosCandidatos = []; 

// ===============================================
// FASE 1: RENDERIZADO DE RANKINGS
// ===============================================
function renderRankings() {
    const wrapper = document.querySelector('.rankings-wrapper');
    if(!wrapper) return;

    let html = '';
    CONFIG.rankings.forEach(ranking => {
        const top1 = ranking.candidatos[0];
        const resto = ranking.candidatos.slice(1); 

        let colHtml = `
            <div class="ranking-column">
                <div class="ranking-header">${ranking.titulo}</div>
                <div class="chameleon-top">
                    <div class="photo" style="background-color: #eee;"></div>
                    <div class="chameleon-name">${top1.nombre}</div>
                    <div class="chameleon-metric"><span>${top1.partidos}</span> partidos</div>
                </div>
                <div class="chameleon-list">
        `;

        resto.forEach((cand, index) => {
            colHtml += `
                <div class="chameleon-item">
                    <div class="pos">${index + 2}</div>
                    <div class="photo" style="background-color: #eee;"></div>
                    <div class="info">
                        <div class="name">${cand.nombre}</div>
                        <div class="metric">${cand.partidos} partidos</div>
                    </div>
                </div>
            `;
        });
        colHtml += `</div></div>`;
        html += colHtml;
    });

    wrapper.innerHTML = html;
}

// ===============================================
// FASE 2: BUSCADOR Y TARJETA ÚNICA
// ===============================================

const getInitials = (name) => {
    if (!name) return "?";
    let parts = name.split(' ').filter(n => n.length > 0);
    if(parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0] ? parts[0][0].toUpperCase() : "?";
};

// Generador de las Camisetas Grises
function generarCamisetasHTML(historial) {
    if (!historial || historial.length === 0) {
        return `<p style="text-align:left; font-size:14px; color:#888; padding: 10px 0; margin:0; font-style: italic;">Sin registros en esta categoría.</p>`;
    }
    
    return historial.map(h => `
        <div class="jersey-item">
            <div class="jersey-placeholder">IMG</div>
            <div class="jersey-year">${h.anio || 'N/A'}</div>
            <div class="jersey-party-name">${h.partido || 'Desconocido'}</div>
            <div class="jersey-role">${h.rol || ''}</div>
        </div>
    `).join('');
}

// Renderiza ÚNICAMENTE la tarjeta del candidato seleccionado
function renderTarjetaCandidato(candidato) {
    const container = document.getElementById('results-container');
    const stats = document.getElementById('search-stats');
    
    if (!candidato) {
        container.innerHTML = "";
        stats.innerHTML = "<span style='color:#666;'>Busca y selecciona un candidato en la lista superior para ver su historial.</span>";
        return;
    }

    stats.innerHTML = `<span style='color:#2e7d32; font-weight:bold;'>✔️ Mostrando perfil de: ${candidato.nombre}</span>`;

    let pActual = candidato.partidoActual || "INDEPENDIENTE";
    let colorPartido = CONFIG.colores.partidos[pActual] || CONFIG.colores.partidos["DEFECTO"];
    let iniciales = getInitials(candidato.nombre);
    
    let camElectorales = generarCamisetasHTML(candidato.historialElectoral);
    let camPartidarias = generarCamisetasHTML(candidato.historialPartidario);

    const html = `
        <div class="candidate-card" style="border-top-color: ${colorPartido}">
            <div class="card-header-flex">
                <div class="avatar-initials" style="color: ${colorPartido}; background-color: ${colorPartido}20;">${iniciales}</div>
                <div class="card-info">
                    <div class="card-name">${candidato.nombre || 'Desconocido'}</div>
                    <div class="card-current-party">Postula por: ${pActual} (${candidato.cargo || ''})</div>
                </div>
            </div>
            
            <div class="histories-container">
                <div class="history-section">
                    <div class="history-title">Historial Electoral (La camiseta en la cancha)</div>
                    <div class="jersey-track">${camElectorales}</div>
                </div>
                <div class="history-section">
                    <div class="history-title">Historial Partidario (El carnet de militancia)</div>
                    <div class="jersey-track">${camPartidarias}</div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

// Dibuja el panel de lista (Preselector)
function renderPreselector(candidatosFiltrados) {
    const panel = document.getElementById('preselector-panel');
    const stats = document.getElementById('search-stats');
    
    // Si no hay filtro activo, ocultar panel
    if (!candidatosFiltrados) {
        panel.style.display = "none";
        panel.innerHTML = "";
        return;
    }

    if (candidatosFiltrados.length === 0) {
        panel.style.display = "block";
        panel.innerHTML = `<div style="padding: 20px; text-align: center; color: #888;">No se encontraron candidatos que coincidan con tu búsqueda.</div>`;
        stats.innerHTML = "";
        return;
    }

    const LIMITE_LISTA = 50; // Límite para el preselector
    const mostrar = candidatosFiltrados.slice(0, LIMITE_LISTA);
    
    panel.style.display = "block";
    let html = '';
    
    mostrar.forEach(cand => {
        let pActual = cand.partidoActual || "Indep.";
        
        // El SVG funciona como el "Avatar anónimo" circular
        html += `
            <div class="preselector-item" data-id="${cand.dni}">
                <div class="preselector-avatar">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
                <div class="preselector-info">
                    <div class="preselector-name">${cand.nombre}</div>
                    <div class="preselector-detail">${cand.cargo || ''}</div>
                </div>
                <div class="preselector-badge">${pActual}</div>
            </div>
        `;
    });

    if (candidatosFiltrados.length > LIMITE_LISTA) {
        html += `<div style="padding: 10px; text-align: center; font-size:12px; color: #888; background:#f9f9f9;">Hay más resultados. Sigue escribiendo para afinar la búsqueda.</div>`;
    }

    panel.innerHTML = html;
    stats.innerHTML = `<span style='color:#111;'>👆 Selecciona a un candidato de la lista superior para ver su historial. (${candidatosFiltrados.length} encontrados)</span>`;

    // Asignar eventos de clic a cada fila
    const items = panel.querySelectorAll('.preselector-item');
    items.forEach(item => {
        item.addEventListener('click', function() {
            // Buscamos el objeto candidato real usando el DNI
            const dniSeleccionado = this.getAttribute('data-id');
            const candidatoSeleccionado = todosLosCandidatos.find(c => c.dni === dniSeleccionado) || todosLosCandidatos.find(c => c.nombre === this.querySelector('.preselector-name').innerText);
            
            // Ocultamos panel de lista y mostramos SU tarjeta
            renderPreselector(null); 
            renderTarjetaCandidato(candidatoSeleccionado);
        });
    });
}

// Filtra la base de datos según inputs y dropdowns
function filtrarBaseDatos() {
    const texto = document.getElementById('input-busqueda').value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const partidoFiltro = document.getElementById('select-partido').value;
    const cargoFiltro = document.getElementById('select-cargo').value;

    // Si los tres están vacíos, no mostrar la lista
    if (texto === "" && partidoFiltro === "" && cargoFiltro === "") {
        renderPreselector(null);
        renderTarjetaCandidato(null); // Resetea la tarjeta
        return;
    }

    const filtrados = todosLosCandidatos.filter(cand => {
        if(!cand.nombre) return false;
        const nombreLimpio = cand.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        const matchTexto = texto === "" || nombreLimpio.includes(texto);
        const matchP = partidoFiltro === "" || cand.partidoActual === partidoFiltro;
        const matchC = cargoFiltro === "" || cand.cargo === cargoFiltro;
        
        return matchTexto && matchP && matchC;
    });

    // Limpiamos la tarjeta de abajo y mostramos la nueva lista de resultados en el preselector
    renderTarjetaCandidato(null);
    renderPreselector(filtrados);
}

// ===============================================
// INICIALIZACIÓN
// ===============================================
async function inicializarBaseDatos() {
    const stats = document.getElementById('search-stats');
    
    try {
        const response = await fetch(CONFIG.archivos.masterJSON);
        if (!response.ok) throw new Error("JSON no encontrado.");
        todosLosCandidatos = await response.json();
        
        // Poblar Dropdowns
        const selectPartido = document.getElementById('select-partido');
        const partidosUnicos = [...new Set(todosLosCandidatos.map(c => c.partidoActual).filter(Boolean))].sort();
        partidosUnicos.forEach(p => { selectPartido.innerHTML += `<option value="${p}">${p}</option>`; });

        const selectCargo = document.getElementById('select-cargo');
        const cargosUnicos = [...new Set(todosLosCandidatos.map(c => c.cargo).filter(Boolean))].sort();
        cargosUnicos.forEach(c => { selectCargo.innerHTML += `<option value="${c}">${c}</option>`; });

        // Eventos
        let timeoutBusqueda;
        document.getElementById('input-busqueda').addEventListener('input', () => {
            clearTimeout(timeoutBusqueda);
            timeoutBusqueda = setTimeout(filtrarBaseDatos, 300); // 300ms debounce
        });
        
        selectPartido.addEventListener('change', filtrarBaseDatos);
        selectCargo.addEventListener('change', filtrarBaseDatos);

        // Estado inicial
        renderTarjetaCandidato(null);

    } catch (error) {
        console.error("Fallo:", error);
        stats.innerHTML = `<span style="color:#d32f2f;">⚠️ ERROR: ${error.message}</span>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try { renderRankings(); } catch(e) {}
    inicializarBaseDatos();
});