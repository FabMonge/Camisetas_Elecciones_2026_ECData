// ===============================================
// CONFIGURACIÓN MACRO (ARQUITECTURA)
// ===============================================
const CONFIG = {
    rankings: [
        {
            titulo: "XXXXX",
            candidatos: [
                { nombre: "Candidato A", partidos: 8, foto: "cand_a" },
                { nombre: "Candidato B", partidos: 6, foto: "cand_b" },
                { nombre: "Candidato C", partidos: 5, foto: "cand_c" },
                { nombre: "Candidato D", partidos: 4, foto: "cand_d" },
                { nombre: "Candidato E", partidos: 4, foto: "cand_e" }
            ]
        },
        {
            titulo: "YYYYYY",
            candidatos: [
                { nombre: "Congresista A", partidos: 7, foto: "cong_a" },
                { nombre: "Congresista B", partidos: 6, foto: "cong_b" },
                { nombre: "Congresista C", partidos: 5, foto: "cong_c" },
                { nombre: "Congresista D", partidos: 5, foto: "cong_d" },
                { nombre: "Congresista E", partidos: 3, foto: "cong_e" }
            ]
        },
        {
            titulo: "ZZZZZ",
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
        masterJSON: "Data_lista/candidatos_master.json" 
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

function renderPreselector(candidatosFiltrados) {
    const panel = document.getElementById('preselector-panel');
    const stats = document.getElementById('search-stats');
    
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

    const LIMITE_LISTA = 50; 
    const mostrar = candidatosFiltrados.slice(0, LIMITE_LISTA);
    
    panel.style.display = "block";
    let html = '';
    
    mostrar.forEach(cand => {
        let pActual = cand.partidoActual || "Indep.";
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

    const items = panel.querySelectorAll('.preselector-item');
    items.forEach(item => {
        item.addEventListener('click', function() {
            const dniSeleccionado = this.getAttribute('data-id');
            const candidatoSeleccionado = todosLosCandidatos.find(c => c.dni === dniSeleccionado) || todosLosCandidatos.find(c => c.nombre === this.querySelector('.preselector-name').innerText);
            
            renderPreselector(null); 
            renderTarjetaCandidato(candidatoSeleccionado);
        });
    });
}

function filtrarBaseDatos() {
    const texto = document.getElementById('input-busqueda').value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const partidoFiltro = document.getElementById('select-partido').value;
    const cargoFiltro = document.getElementById('select-cargo').value;

    if (texto === "" && partidoFiltro === "" && cargoFiltro === "") {
        renderPreselector(null);
        renderTarjetaCandidato(null); 
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

    renderTarjetaCandidato(null);
    renderPreselector(filtrados);
}

// ===============================================
// FASE 3: HEATMAP NATIVO CSS GRID (10 Columnas)
// ===============================================

function renderHeatmap(candidatos) {
    const grid = document.getElementById('heatmap-grid');
    if (!grid) return;

    // 1. Estructura de la Matriz (5 filas de Éxito x 10 columnas de Intentos)
    // Filas (Y): 100%, 51-99%, 50%, 1-49%, 0%
    // Columnas (X): 1 al 10+
    const matriz = Array(5).fill(0).map(() => Array(10).fill(null).map(() => ({ count: 0, ejemplos: [] })));

    let maxDensity = 0; 

    // 2. Llenar la matriz con los datos
    candidatos.forEach(c => {
        const totalParticipaciones = c.historialElectoral ? c.historialElectoral.length : 0;
        
        // Ignoramos a los de 0 participaciones
        if (totalParticipaciones > 0) {
            let victorias = 0;
            c.historialElectoral.forEach(h => {
                if (h.elegido && h.elegido.toUpperCase() === "SI") victorias++;
            });
            
            const porcentajeExito = (victorias / totalParticipaciones) * 100;
            
            // Asignar Columna (Eje X: Intentos 1 al 10+)
            let colIndex = totalParticipaciones - 1;
            if (colIndex > 9) colIndex = 9; // Todo de 10 a más cae en la última columna

            // Asignar Fila (Eje Y: Éxito)
            let rowIndex;
            if (porcentajeExito === 100) rowIndex = 0;
            else if (porcentajeExito > 50) rowIndex = 1;
            else if (porcentajeExito === 50) rowIndex = 2;
            else if (porcentajeExito > 0) rowIndex = 3;
            else rowIndex = 4; // 0%

            // Sumar al bucket
            matriz[rowIndex][colIndex].count++;
            
            if (matriz[rowIndex][colIndex].ejemplos.length < 4) {
                matriz[rowIndex][colIndex].ejemplos.push(c.nombre);
            }

            if (matriz[rowIndex][colIndex].count > maxDensity) {
                maxDensity = matriz[rowIndex][colIndex].count;
            }
        }
    });

    // 3. Renderizar el HTML de la Matriz
    let html = '';
    
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 10; c++) { 
            const bucket = matriz[r][c];
            let colorClass = 'heat-0';
            
            if (bucket.count > 0) {
                // Cálculo de escala de color (1 al 5)
                const intensidad = Math.ceil((bucket.count / maxDensity) * 5);
                colorClass = `heat-${Math.max(1, intensidad)}`;
            }

            let tooltipHtml = '';
            if (bucket.count > 0) {
                const labelIntentos = (c === 9) ? "10 a más intentos" : `${c + 1} intento(s)`;
                
                tooltipHtml = `<div class="tooltip">
                    <strong style="color:#fff; font-size:12px; margin-bottom:2px;">${labelIntentos}</strong>
                    <strong>${bucket.count} candidatos</strong>
                    <div style="margin-bottom:4px; font-size:11px; color:#ccc;">Ejemplos:</div>
                    ${bucket.ejemplos.map(e => `• ${e}`).join('<br>')}
                    ${bucket.count > 4 ? `<br><i style="color:#888;">...y ${bucket.count - 4} más</i>` : ''}
                </div>`;
            }

            html += `
                <div class="heatmap-cell ${colorClass}">
                    ${bucket.count > 0 ? bucket.count : ''}
                    ${tooltipHtml}
                </div>
            `;
        }
    }

    grid.innerHTML = html;
}

// ===============================================
// INICIALIZACIÓN GLOBAL
// ===============================================
async function inicializarBaseDatos() {
    const stats = document.getElementById('search-stats');
    
    try {
        const response = await fetch(CONFIG.archivos.masterJSON);
        if (!response.ok) throw new Error("JSON no encontrado.");
        todosLosCandidatos = await response.json();
        
        const selectPartido = document.getElementById('select-partido');
        const partidosUnicos = [...new Set(todosLosCandidatos.map(c => c.partidoActual).filter(Boolean))].sort();
        partidosUnicos.forEach(p => { selectPartido.innerHTML += `<option value="${p}">${p}</option>`; });

        const selectCargo = document.getElementById('select-cargo');
        const cargosUnicos = [...new Set(todosLosCandidatos.map(c => c.cargo).filter(Boolean))].sort();
        cargosUnicos.forEach(c => { selectCargo.innerHTML += `<option value="${c}">${c}</option>`; });

        let timeoutBusqueda;
        document.getElementById('input-busqueda').addEventListener('input', () => {
            clearTimeout(timeoutBusqueda);
            timeoutBusqueda = setTimeout(filtrarBaseDatos, 300);
        });
        
        selectPartido.addEventListener('change', filtrarBaseDatos);
        selectCargo.addEventListener('change', filtrarBaseDatos);

        renderTarjetaCandidato(null);
        renderHeatmap(todosLosCandidatos);

    } catch (error) {
        console.error("Fallo:", error);
        stats.innerHTML = `<span style="color:#d32f2f;">⚠️ ERROR: ${error.message}</span>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try { renderRankings(); } catch(e) {}
    inicializarBaseDatos();
});