// app.js - cálculos para Steel Frame y Durlock + export con jsPDF/print

// --- Helpers ---
const ceil = Math.ceil;
const floor = Math.floor;
const round = (v,n=2) => Number.parseFloat(v).toFixed(n);

// Estimaciones/constantes (ajustalas según tus materiales reales)
const TORNILLOS_POR_M2_PLACA = 8 * 1; // ejemplo: 8 tornillos por m2 (ajustar)
const RINDE_MASILLA_POR_M2 = 0.15; // kg por m2 (estimado)
const RINDE_CINTA_POR_M2 = 0.03; // rollo por m2 (estimado)

/* ---------- STEEL FRAME ---------- */
if (document.getElementById('sf-calc')) {
  document.getElementById('sf-calc').addEventListener('click', ()=>{
    const width = parseFloat(document.getElementById('sf-width').value) || 0;
    const height = parseFloat(document.getElementById('sf-height').value) || 0;
    const spacing = parseFloat(document.getElementById('sf-spacing').value) || 0.4;
    const openings = parseFloat(document.getElementById('sf-openings').value) || 0;

    // Superficie en m2
    const area = width * height;

    // Longitud neta a cubrir en metros (restamos aberturas)
    const netWidth = Math.max(0, width - openings);

    // Cantidad de montantes (studs): colocamos cada "spacing" metros, siempre 1 montante en cada extremo
    // studs = ceil(netWidth / spacing) + 1
    const studs = Math.max(2, ceil(netWidth / spacing) + 1);

    // Soleras: normalmente arriba y abajo por cada tramo -> 2 soleras por pared (si es una sola pared)
    const soleras = 2;

    // Largo total de perfiles (en metros) = montantes * altura + soleras * ancho
    const totalPerfil = studs * height + soleras * width;

    // Tornillos estimados (se suele fijar placas con tornillos cada cierto espacio; damos estimación)
    // Si 1 m2 necesita ~ (altura/0.3) * (width/0.3) tornillos, simplificamos con constante:
    const tornillos = ceil(area * 60); // 60 tornillos por m2 como estimación

    // Placas: se calcula por m2, cada placa tiene X m2
    // aquí no sabemos si se usan placas en ambos lados. Asumimos 1 lado. (ajustar si hace falta)
    const placas_m2 = area;
    const results = {
      area: round(area,2),
      studs: studs,
      soleras: soleras,
      totalPerfil: round(totalPerfil,2),
      tornillos: tornillos,
      placas_m2: round(placas_m2,2),
      masillaKg: round(placas_m2 * RINDE_MASILLA_POR_M2,2),
      cinta: Math.max(1, round(placas_m2 * RINDE_CINTA_POR_M2,2))
    };

    // Mostrar
    const el = document.getElementById('sf-results');
    el.style.display = 'block';
    el.innerHTML = `
      <div class="row"><div>Área</div><div>${results.area} m²</div></div>
      <div class="row"><div>Montantes (studs)</div><div>${results.studs}</div></div>
      <div class="row"><div>Soleras</div><div>${results.soleras}</div></div>
      <div class="row"><div>Largo total perfiles</div><div>${results.totalPerfil} m</div></div>
      <div class="row"><div>Tornillos (estimado)</div><div>${results.tornillos}</div></div>
      <div class="row"><div>Placas (m²)</div><div>${results.placas_m2}</div></div>
      <div class="row"><div>Masilla (kg)</div><div>${results.masillaKg}</div></div>
      <div class="row"><div>Cinta (rollos estimados)</div><div>${results.cinta}</div></div>
    `;

    document.getElementById('sf-export').style.display = 'block';
    // guardamos lo último en localStorage
    localStorage.setItem('sf-last', JSON.stringify(results));
  });

  document.getElementById('sf-export').addEventListener('click', ()=>{
    const data = JSON.parse(localStorage.getItem('sf-last') || '{}');
    if (!data || !data.area) { window.print(); return; }
    // Export simple con jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({unit:'mm',format:'a4'});
    doc.setFontSize(14);
    doc.text('Resultado - Steel Frame', 15, 20);
    doc.setFontSize(11);
    let y = 30;
    Object.entries(data).forEach(([k,v])=>{
      doc.text(`${k}: ${v}`, 15, y);
      y += 8;
    });
    doc.save('sf-result.pdf');
  });
}

/* ---------- DURLOCK (PLACAS) ---------- */
if (document.getElementById('dl-calc')) {
  document.getElementById('dl-calc').addEventListener('click', ()=>{
    const area = parseFloat(document.getElementById('dl-area').value) || 0;
    const plate = document.getElementById('dl-plate').value;
    const thickness = parseFloat(document.getElementById('dl-thickness').value) || 12.5;

    // placa area por unidad:
    let plateArea = 2.88; // default 2.4x1.2
    if (plate === '2.4x0.9') plateArea = 2.16;

    // Cantidad de placas (siempre redondeamos hacia arriba)
    const plates = ceil(area / plateArea);

    // Tornillos
    const tornillos = ceil(area * TORNILLOS_POR_M2_PLACA);

    // Masilla y cinta
    const masillaKg = round(area * RINDE_MASILLA_POR_M2,2);
    const cintaRollos = Math.max(1, round(area * RINDE_CINTA_POR_M2,2));

    const results = {
      area: round(area,2),
      plateArea,
      plates,
      tornillos,
      masillaKg,
      cintaRollos,
      thickness
    };

    const el = document.getElementById('dl-results');
    el.style.display = 'block';
    el.innerHTML = `
      <div class="row"><div>Área</div><div>${results.area} m²</div></div>
      <div class="row"><div>Área placa</div><div>${results.plateArea} m²</div></div>
      <div class="row"><div>Placas necesarias</div><div>${results.plates}</div></div>
      <div class="row"><div>Tornillos estimados</div><div>${results.tornillos}</div></div>
      <div class="row"><div>Masilla (kg)</div><div>${results.masillaKg}</div></div>
      <div class="row"><div>Cinta (rollos)</div><div>${results.cintaRollos}</div></div>
    `;

    document.getElementById('dl-export').style.display = 'block';
    localStorage.setItem('dl-last', JSON.stringify(results));
  });

  document.getElementById('dl-export').addEventListener('click', ()=>{
    const data = JSON.parse(localStorage.getItem('dl-last') || '{}');
    if (!data || !data.area) { window.print(); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({unit:'mm',format:'a4'});
    doc.setFontSize(14);
    doc.text('Resultado - Durlock', 15, 20);
    doc.setFontSize(11);
    let y = 30;
    Object.entries(data).forEach(([k,v])=>{
      doc.text(`${k}: ${v}`, 15, y);
      y += 8;
    });
    doc.save('durlock-result.pdf');
  });
}
