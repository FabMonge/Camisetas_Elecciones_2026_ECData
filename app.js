// ===============================================
// CONFIGURACIÓN MACRO (ARQUITECTURA)
// ===============================================
const CONFIG = {
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
let timelineChartInstance = null; // Instancia para el gráfico de la Fase 4

// ===============================================
// UTILIDADES COMUNES
// ===============================================
const getInitials = (name) => {
    if (!name) return "?";
    let parts = name.split(' ').filter(n => n.length > 0);
    if(parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0] ? parts[0][0].toUpperCase() : "?";
};

// Convierte colores HEX a RGBA para las burbujas
function hexToRgba(hex, alpha) {
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
    }
    return `rgba(150,150,150,${alpha})`;
}

// ===============================================
// FASE 1: RANKINGS DINÁMICOS Y FILTRADOS
// ===============================================
function calcularRankings(candidatos, partidoFiltro = "ALL") {
    let pool = candidatos;
    if (partidoFiltro !== "ALL") {
        pool = candidatos.filter(c => c.partidoActual === partidoFiltro);
    }

    let rankingCamisetas = pool.map(c => {
        let partidosUsados = c.historialElectoral.map(h => h.partido).filter(Boolean);
        let uniqueParties = new Set(partidosUsados);
        return { ...c, metrica: uniqueParties.size };
    }).sort((a, b) => b.metrica - a.metrica).slice(0, 5);

    let rankingMilitancias = pool.map(c => {
        let partidosMilitados = c.historialPartidario.map(h => h.partido).filter(Boolean);
        let uniqueMilitancias = new Set(partidosMilitados);
        return { ...c, metrica: uniqueMilitancias.size };
    }).sort((a, b) => b.metrica - a.metrica).slice(0, 5);

    let rankingDerrotas = pool.map(c => {
        let derrotas = c.historialElectoral.filter(h => h.elegido && h.elegido.toUpperCase() === "NO").length;
        return { ...c, metrica: derrotas };
    }).sort((a, b) => b.metrica - a.metrica).slice(0, 5);

    return [
        { titulo: "Top 5 con más cambios de camiseta para postular", data: rankingCamisetas, label: "partidos" },
        { titulo: "Top 5 con más militancias en organizaciones políticas", data: rankingMilitancias, label: "afiliaciones" },
        { titulo: "Top 5 que postularon más veces sin éxito", data: rankingDerrotas, label: "derrotas" }
    ];
}

function renderRankings(rankingsData) {
    const wrapper = document.getElementById('rankings-wrapper');
    if(!wrapper) return;

    let html = '';
    rankingsData.forEach(ranking => {
        if(ranking.data.length === 0) {
            html += `<div class="ranking-column"><div class="ranking-header">${ranking.titulo}</div><p style="color:#888; font-size:13px;">Sin datos para este filtro</p></div>`;
            return;
        }

        const top1 = ranking.data[0];
        const resto = ranking.data.slice(1); 

        let colHtml = `
            <div class="ranking-column">
                <div class="ranking-header">${ranking.titulo}</div>
                <div class="chameleon-top">
                    <div class="photo" style="background-color: #eee;"></div>
                    <div class="chameleon-name">${top1.nombre}</div>
                    <div class="chameleon-metric"><span>${top1.metrica}</span> ${ranking.label}</div>
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
                        <div class="metric">${cand.metrica} ${ranking.label}</div>
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
// FASE 2: COMPARADOR CARA A CARA
// ===============================================
function generarCamisetasHTML(historial) {
    if (!historial || historial.length === 0) {
        return `<p style="text-align:left; font-size:14px; color:#888; padding: 10px 0; margin:0; font-style: italic;">Sin registros previos.</p>`;
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

function renderTarjetaCandidato(candidato, containerId) {
    const container = document.getElementById(containerId);
    
    if (!candidato) {
        container.innerHTML = `
            <div style="background:#f9f9f9; border: 1px dashed #ccc; padding:40px 20px; text-align:center; border-radius:6px; color:#888;">
                Utiliza el buscador superior para seleccionar a un candidato y ver su historial aquí.
            </div>`;
        return;
    }

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
                    <div class="card-current-party">Postula por: ${pActual} <br> <span style="font-size:11px; color:#888;">(${candidato.cargo || ''})</span></div>
                </div>
            </div>
            
            <div class="histories-container">
                <div class="history-section">
                    <div class="history-title">Postulaciones (Orden cronológico)</div>
                    <div class="jersey-track">${camElectorales}</div>
                </div>
                <div class="history-section">
                    <div class="history-title">Militancia Partidaria</div>
                    <div class="jersey-track">${camPartidarias}</div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function setupBuscadorComparador(inputId, selectId, panelId, resultId) {
    const input = document.getElementById(inputId);
    const select = document.getElementById(selectId);
    const panel = document.getElementById(panelId);
    let timeout;

    const ejecutarBusqueda = () => {
        const val = input.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const partidoFiltro = select.value;
        
        if (!val || val.length < 3) {
            panel.style.display = "none";
            return;
        }

        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const matches = todosLosCandidatos.filter(cand => {
                if(!cand.nombre) return false;
                const nom = cand.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const matchText = nom.includes(val);
                const matchPartido = partidoFiltro === "" || cand.partidoActual === partidoFiltro;
                return matchText && matchPartido;
            }).slice(0, 15);

            if (matches.length > 0) {
                panel.style.display = "block";
                let html = '';
                matches.forEach(cand => {
                    let pActual = cand.partidoActual || "Indep.";
                    html += `
                        <div class="preselector-item" data-id="${cand.dni}">
                            <div class="preselector-info">
                                <div class="preselector-name">${cand.nombre}</div>
                            </div>
                            <div class="preselector-badge">${pActual}</div>
                        </div>
                    `;
                });
                panel.innerHTML = html;

                panel.querySelectorAll('.preselector-item').forEach(item => {
                    item.addEventListener('click', function() {
                        const dniSeleccionado = this.getAttribute('data-id');
                        const candidato = todosLosCandidatos.find(c => c.dni === dniSeleccionado);
                        input.value = ""; 
                        panel.style.display = "none";
                        renderTarjetaCandidato(candidato, resultId);
                    });
                });
            } else {
                panel.style.display = "block";
                panel.innerHTML = `<div style="padding: 15px; color: #888; font-size:13px;">No hay coincidencias para ese filtro.</div>`;
            }
        }, 300);
    };

    input.addEventListener('input', ejecutarBusqueda);
    select.addEventListener('change', ejecutarBusqueda); 

    document.addEventListener("click", function (e) {
        if (e.target !== input && e.target !== select && e.target !== panel && !panel.contains(e.target)) {
            panel.style.display = "none";
        }
    });
}

// ===============================================
// FASE 3: HEATMAP NATIVO CSS GRID (Partidos vs Postulaciones)
// ===============================================
function renderHeatmap(candidatos, partidoFiltro = "ALL") {
    const grid = document.getElementById('heatmap-grid');
    if (!grid) return;

    let pool = candidatos;
    if (partidoFiltro !== "ALL") {
        pool = candidatos.filter(c => c.partidoActual === partidoFiltro);
    }

    const matriz = Array(5).fill(0).map(() => Array(10).fill(null).map(() => ({ count: 0, ejemplos: [] })));
    let maxDensity = 0; 

    pool.forEach(c => {
        const totalParticipaciones = c.historialElectoral ? c.historialElectoral.length : 0;
        
        if (totalParticipaciones > 0) {
            const partidosUsados = c.historialElectoral.map(h => h.partido).filter(Boolean);
            const uniqueParties = new Set(partidosUsados).size;
            
            let colIndex = totalParticipaciones - 1;
            if (colIndex > 9) colIndex = 9;

            let rowIndex;
            if (uniqueParties >= 5) rowIndex = 0;
            else if (uniqueParties === 4) rowIndex = 1;
            else if (uniqueParties === 3) rowIndex = 2;
            else if (uniqueParties === 2) rowIndex = 3;
            else rowIndex = 4; // 1 partido

            matriz[rowIndex][colIndex].count++;
            
            if (matriz[rowIndex][colIndex].ejemplos.length < 4) {
                matriz[rowIndex][colIndex].ejemplos.push(c.nombre);
            }

            if (matriz[rowIndex][colIndex].count > maxDensity) {
                maxDensity = matriz[rowIndex][colIndex].count;
            }
        }
    });

    let html = '';
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 10; c++) { 
            const bucket = matriz[r][c];
            let colorClass = 'heat-0';
            
            if (bucket.count > 0) {
                const intensidad = Math.ceil((bucket.count / maxDensity) * 5);
                colorClass = `heat-${Math.max(1, intensidad)}`;
            }

            let tooltipHtml = '';
            if (bucket.count > 0) {
                const labelIntentos = (c === 9) ? "10 a más postulaciones" : `${c + 1} postulación(es)`;
                const labelPartidos = (r === 0) ? "5 o más partidos" : `${5 - r} partido(s)`;
                
                tooltipHtml = `<div class="tooltip">
                    <strong style="color:#fff; font-size:12px; margin-bottom:2px;">${labelIntentos} con ${labelPartidos}</strong>
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
// FASE 4: TIMELINE 1D (Antigüedad de Afiliación)
// ===============================================

// Fecha límite oficial: 12 de Julio de 2025
const FECHA_LIMITE = new Date(2025, 6, 12); // Meses en JS van de 0 a 11

// Plugin para la Línea Roja de Cierre
const deadlinePlugin = {
    id: 'deadlinePlugin',
    afterDraw(chart) {
        const ctx = chart.ctx;
        const xAxis = chart.scales.x;
        const xPos = xAxis.getPixelForValue(FECHA_LIMITE.getTime()); 

        if (xPos >= chart.chartArea.left && xPos <= chart.chartArea.right) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(xPos, chart.chartArea.top);
            ctx.lineTo(xPos, chart.chartArea.bottom);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(229, 57, 53, 0.9)'; // Rojo ECData
            ctx.setLineDash([5, 5]);
            ctx.stroke();

            ctx.fillStyle = 'rgba(229, 57, 53, 1)';
            ctx.font = 'bold 11px Arial';
            ctx.fillText('12 JUL 2025', xPos - 75, chart.chartArea.top + 15);
            ctx.fillText('CIERRE PADRÓN', xPos - 100, chart.chartArea.top + 30);
            ctx.restore();
        }
    }
};
Chart.register(deadlinePlugin);

// Extrae el timestamp de inicio de afiliación (Requiere la variable fechaInicio generada en R)
function extractAffiliationTimestamp(candidato) {
    if (!candidato.partidoActual || !candidato.historialPartidario) return null;

    const activeAffiliation = candidato.historialPartidario.find(h =>
        h.partido === candidato.partidoActual && h.anio.includes("Act.")
    );

    if (activeAffiliation && activeAffiliation.fechaInicio) {
        // Asumiendo formato DD/MM/YYYY
        const parts = activeAffiliation.fechaInicio.split('/');
        if (parts.length === 3) {
            return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
        }
    }
    return null;
}

// Calcula los días exactos entre afiliación y límite
function getDiasAntiguedad(timestampAfiliacion) {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((FECHA_LIMITE.getTime() - timestampAfiliacion) / msPerDay);
}

function renderTimeline(candidatos, partidoFiltro = "ALL") {
    const ctx = document.getElementById('timeline-chart').getContext('2d');
    if (timelineChartInstance) timelineChartInstance.destroy();

    let datasets = [];

    if (partidoFiltro === "ALL") {
        // VISTA PROMEDIO
        const partyStats = {};
        candidatos.forEach(c => {
            const timestamp = extractAffiliationTimestamp(c);
            if (timestamp !== null && timestamp <= FECHA_LIMITE.getTime()) {
                const p = c.partidoActual;
                if (!partyStats[p]) partyStats[p] = { sumTimestamp: 0, count: 0 };
                partyStats[p].sumTimestamp += timestamp;
                partyStats[p].count++;
            }
        });

        const dataPoints = Object.keys(partyStats).map(p => {
            const avgTimestamp = partyStats[p].sumTimestamp / partyStats[p].count;
            return { 
                x: avgTimestamp, 
                y: 0, 
                partido: p, 
                count: partyStats[p].count,
                diasPromedio: getDiasAntiguedad(avgTimestamp)
            };
        });

        datasets.push({
            label: 'Promedio por Partido',
            data: dataPoints,
            backgroundColor: dataPoints.map(d => hexToRgba(CONFIG.colores.partidos[d.partido] || CONFIG.colores.partidos["DEFECTO"], 0.85)),
            borderColor: '#111',
            borderWidth: 1.5,
            pointRadius: 8,
            pointHoverRadius: 12
        });

    } else {
        // VISTA ENJAMBRE (JITTER)
        const dataPoints = [];
        candidatos.forEach(c => {
            if (c.partidoActual === partidoFiltro) {
                const timestamp = extractAffiliationTimestamp(c);
                if (timestamp !== null && timestamp <= FECHA_LIMITE.getTime()) {
                    dataPoints.push({
                        x: timestamp,
                        y: (Math.random() * 2) - 1, 
                        nombre: c.nombre,
                        partido: c.partidoActual,
                        diasAfiliado: getDiasAntiguedad(timestamp)
                    });
                }
            }
        });

        let pColor = CONFIG.colores.partidos[partidoFiltro] || CONFIG.colores.partidos["DEFECTO"];
        datasets.push({
            label: 'Afiliados Vigentes',
            data: dataPoints,
            backgroundColor: hexToRgba(pColor, 0.7),
            borderColor: hexToRgba(pColor, 1),
            borderWidth: 1,
            pointRadius: 5,
            pointHoverRadius: 8
        });
    }

    timelineChartInstance = new Chart(ctx, {
        type: 'scatter',
        data: { datasets: datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            layout: { padding: { top: 30, right: 20, left: 20 } },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17,17,17,0.95)',
                    titleFont: { size: 14, family: 'Arial', weight: 'bold' },
                    bodyFont: { size: 13, family: 'Arial', lineHeight: 1.4 },
                    padding: 12,
                    callbacks: {
                        label: (context) => {
                            const p = context.raw;
                            const fechaLegible = new Date(p.x).toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' });
                            
                            if (partidoFiltro === "ALL") {
                                return [
                                    `Partido: ${p.partido}`,
                                    `Militantes contabilizados: ${p.count}`,
                                    `Afiliación promedio: ${fechaLegible}`,
                                    `Antigüedad promedio: ${p.diasPromedio} días antes del cierre`
                                ];
                            } else {
                                return [
                                    `Candidato: ${p.nombre}`,
                                    `Se afilió el: ${fechaLegible}`,
                                    `Antigüedad: ${p.diasAfiliado} días antes del cierre`
                                ];
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: 'Línea de tiempo (Años)', font: { weight: 'bold', size: 13, family: 'Arial' } },
                    min: new Date(2000, 0, 1).getTime(), 
                    max: new Date(2025, 11, 31).getTime(),
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: {
                        callback: function(value) { return new Date(value).getFullYear(); },
                        maxTicksLimit: 12,
                        font: { family: 'Arial' }
                    }
                },
                y: { display: false, min: -2, max: 2 }
            }
        }
    });
}

// ===============================================
// CARGA MAESTRA E INYECCIÓN DE LA ELECCIÓN 2026
// ===============================================
async function inicializarBaseDatos() {
    try {
        const response = await fetch(CONFIG.archivos.masterJSON);
        if (!response.ok) throw new Error("JSON no encontrado.");
        todosLosCandidatos = await response.json();
        
        // PROCESAMIENTO CRÍTICO: Inyectar 2026 y ordenar
        todosLosCandidatos.forEach(c => {
            if (!c.historialElectoral) c.historialElectoral = [];
            if (!c.historialPartidario) c.historialPartidario = [];

            if (c.partidoActual && c.cargo) {
                const has2026 = c.historialElectoral.some(h => parseInt(h.anio) === 2026);
                if (!has2026) {
                    c.historialElectoral.push({
                        anio: "2026",
                        partido: c.partidoActual,
                        rol: c.cargo,
                        elegido: "Pendiente" 
                    });
                }
            }

            c.historialElectoral.sort((a, b) => parseInt(a.anio) - parseInt(b.anio));
            c.historialPartidario.sort((a, b) => parseInt(a.anio) - parseInt(b.anio));
        });
        
        // Extraer partidos únicos 
        const partidosUnicos = [...new Set(todosLosCandidatos.map(c => c.partidoActual).filter(Boolean))].sort();
        
        // 1. Iniciar Rankings
        const selectRankings = document.getElementById('ranking-partido-select');
        partidosUnicos.forEach(p => { selectRankings.innerHTML += `<option value="${p}">${p}</option>`; });
        selectRankings.addEventListener('change', (e) => {
            renderRankings(calcularRankings(todosLosCandidatos, e.target.value));
        });
        renderRankings(calcularRankings(todosLosCandidatos, "ALL"));

        // 2. Iniciar Comparador 
        const selectComp1 = document.getElementById('select-partido-1');
        const selectComp2 = document.getElementById('select-partido-2');
        partidosUnicos.forEach(p => { 
            selectComp1.innerHTML += `<option value="${p}">${p}</option>`; 
            selectComp2.innerHTML += `<option value="${p}">${p}</option>`; 
        });

        setupBuscadorComparador('input-busqueda-1', 'select-partido-1', 'preselector-panel-1', 'results-container-1');
        setupBuscadorComparador('input-busqueda-2', 'select-partido-2', 'preselector-panel-2', 'results-container-2');
        renderTarjetaCandidato(null, 'results-container-1');
        renderTarjetaCandidato(null, 'results-container-2');

        // 3. Iniciar Heatmap
        const selectHeatmap = document.getElementById('heatmap-partido-select');
        partidosUnicos.forEach(p => { selectHeatmap.innerHTML += `<option value="${p}">${p}</option>`; });
        selectHeatmap.addEventListener('change', (e) => {
            renderHeatmap(todosLosCandidatos, e.target.value);
        });
        renderHeatmap(todosLosCandidatos, "ALL");

        // 4. Iniciar Timeline
        const selectTimeline = document.getElementById('timeline-partido-select');
        partidosUnicos.forEach(p => { selectTimeline.innerHTML += `<option value="${p}">${p}</option>`; });
        selectTimeline.addEventListener('change', (e) => {
            renderTimeline(todosLosCandidatos, e.target.value);
        });
        renderTimeline(todosLosCandidatos, "ALL");

    } catch (error) {
        console.error("Fallo:", error);
        document.getElementById('rankings-wrapper').innerHTML = `<p style="color:red; text-align:center;">Error cargando datos: ${error.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', inicializarBaseDatos);