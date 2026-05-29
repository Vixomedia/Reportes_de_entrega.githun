 // ── Iniciar ambas firmas ──────────────────────────────────────────────────────
const firmas = [
  { canvasId: 'canvas1', wrapperId: 'wrapper1' },
  { canvasId: 'canvas2', wrapperId: 'wrapper2' },
];

firmas.forEach(({ canvasId, wrapperId }) => {
  iniciarFirma(canvasId, wrapperId);
});

// ── Función principal de firma ────────────────────────────────────────────────
function iniciarFirma(canvasId, wrapperId) {
  const canvas  = document.getElementById(canvasId);
  const wrapper = document.getElementById(wrapperId);
  const ctx     = canvas.getContext('2d');

  // Aquí guardamos la firma como dataURL para restaurarla si el canvas cambia
  let firmaGuardada = null;
  let dibujando     = false;

  // ── Ajustar resolución interna del canvas al tamaño real del wrapper ────────
  function ajustarTamano() {
    const dpr = window.devicePixelRatio || 1;
    const w   = wrapper.clientWidth  || 300;
    const h   = wrapper.clientHeight || 150;

    // Solo redimensionar si cambió algo (evita borrar el dibujo innecesariamente)
    const nuevoW = Math.round(w * dpr);
    const nuevoH = Math.round(h * dpr);

    if (canvas.width === nuevoW && canvas.height === nuevoH) return;

    canvas.width  = nuevoW;
    canvas.height = nuevoH;

    // Resetear transformación limpiamente y aplicar escala del dispositivo
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    configurarEstilo();

    // Restaurar firma si había una guardada
    restaurarFirma();
  }

  function configurarEstilo() {
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth   = 2;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.imageSmoothingEnabled = true;
  }

  // ── Guardar firma como imagen cada vez que el usuario termina de trazar ─────
  function guardarSnapshot() {
    // Sólo guardar si hay algo dibujado (evita guardar canvas vacíos)
    firmaGuardada = canvas.toDataURL('image/png');
  }

  // ── Restaurar la firma guardada al canvas ────────────────────────────────────
  function restaurarFirma() {
    if (!firmaGuardada) return;
    const img = new Image();
    img.onload = () => {
      // Dibujar en coordenadas del canvas sin escala (CSS coords)
      const dpr = window.devicePixelRatio || 1;
      ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
    };
    img.src = firmaGuardada;
  }

  // ── Obtener posición del toque/clic relativa al canvas ──────────────────────
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return {
      x: src.clientX - rect.left,
      y: src.clientY - rect.top,
    };
  }

  // ── Handlers de dibujo ───────────────────────────────────────────────────────
  function iniciar(e) {
    e.preventDefault();
    e.stopPropagation();
    dibujando = true;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function dibujar(e) {
    if (!dibujando) return;
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function terminar(e) {
    if (!dibujando) return;
    dibujando = false;
    ctx.beginPath(); // evita que el siguiente trazo conecte con el anterior
    guardarSnapshot(); // ← guardar la firma al soltar
  }

  // ── Eventos mouse ────────────────────────────────────────────────────────────
  canvas.addEventListener('mousedown',  iniciar);
  canvas.addEventListener('mousemove',  dibujar);
  canvas.addEventListener('mouseup',    terminar);
  canvas.addEventListener('mouseleave', terminar);

  // ── Eventos touch (móvil / tablet) ──────────────────────────────────────────
  canvas.addEventListener('touchstart', iniciar,  { passive: false });
  canvas.addEventListener('touchmove',  dibujar,  { passive: false });
  canvas.addEventListener('touchend',   terminar, { passive: false });
  canvas.addEventListener('touchcancel',terminar, { passive: false });

  // ── Ajuste inicial: doble RAF para garantizar que el DOM tenga dimensiones ───
  requestAnimationFrame(() => requestAnimationFrame(ajustarTamano));

  // ── Ajuste en resize (orientación, ventana) ──────────────────────────────────
  // Usamos ResizeObserver para detectar cambios del wrapper específicamente
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => ajustarTamano());
    ro.observe(wrapper);
  } else {
    window.addEventListener('resize', ajustarTamano);
  }

  // ── Exponemos el método de restauración para uso externo ────────────────────
  canvas._restaurarFirma = restaurarFirma;
  canvas._limpiarFirma   = () => { firmaGuardada = null; };
}

// ── Limpiar canvas ────────────────────────────────────────────────────────────
function limpiar(canvasId, wrapperId) {
  const canvas = document.getElementById(canvasId);
  const ctx    = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (canvas._limpiarFirma) canvas._limpiarFirma();
  document.getElementById(wrapperId).classList.remove('signed');
}

// ── Descargar firma ───────────────────────────────────────────────────────────
function descargar(canvasId, nombre) {
  const canvas = document.getElementById(canvasId);
  const link   = document.createElement('a');
  link.download = nombre + '.png';
  link.href     = canvas.toDataURL('image/png');
  link.click();
}

// ── Mostrar fotos (sin borrar firmas) ─────────────────────────────────────────
function mostrarFotos(input) {
  const preview = document.getElementById('fotoPreview');
  preview.innerHTML = '';
  if (!input.files) return;

  Array.from(input.files).forEach((file, index) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const container = document.createElement('div');
      container.className = 'foto-card';
      container.innerHTML = `
        <img src="${reader.result}" alt="${file.name}">
        <p>${file.name}</p>
        <input type="text" id="descripcion_${index}" name="descripcion_${index}"
          class="w3-input" placeholder="Descripción de la foto ${index + 1}">
      `;
      preview.appendChild(container);

      // Restaurar firmas después de agregar imágenes (el DOM puede haber
      // forzado un reflow que borra los canvas)
      requestAnimationFrame(() => {
        document.querySelectorAll('canvas').forEach(c => {
          if (c._restaurarFirma) c._restaurarFirma();
        });
      });
    };
    reader.readAsDataURL(file);
  });
}

// ── Agregar técnico ───────────────────────────────────────────────────────────
function tenicos() {
  const filaBoton = document.getElementById('fila-tecnicos');
  const nuevaFila = document.createElement('tr');
  nuevaFila.innerHTML = `
    <td colspan="3"></td>
    <td class="w3-center label-col">Técnico:</td>
    <td>
      <div style="display:flex; gap:6px; align-items:center;">
        <textarea class="w3-input" rows="2" placeholder="Nombre del técnico..."
          style="resize:vertical; width:100%;"></textarea>
        <button class="w3-button w3-red w3-round no_print"
          onclick="this.closest('tr').remove()" style="white-space:nowrap;">✕</button>
      </div>
    </td>
  `;
  filaBoton.parentNode.insertBefore(nuevaFila, filaBoton);
}

// ── Agregar descripción ───────────────────────────────────────────────────────
function descripcion() {
  const filaBoton = document.getElementById('fila-descripcion');
  const nuevaFila = document.createElement('tr');
  nuevaFila.innerHTML = `
    <td>
      <div style="display:flex; gap:6px; align-items:flex-start;">
        <textarea class="w3-input" rows="3" placeholder="Descripción del trabajo..."
          style="resize:vertical; width:100%;"></textarea>
        <button class="w3-button w3-red w3-round no_print"
          onclick="this.closest('tr').remove()">✕</button>
      </div>
    </td>
  `;
  filaBoton.parentNode.insertBefore(nuevaFila, filaBoton);
}

// ── Agregar material ──────────────────────────────────────────────────────────
function materiales() {
  const filaBoton = document.getElementById('fila-materiales');
  const nuevaFila = document.createElement('tr');
  nuevaFila.innerHTML = `
    <td><input class="w3-input canitdad" type="number" min="0" placeholder="0"></td>
    <td><input class="w3-input marca" type="text" placeholder="Marca"></td>
    <td><input class="w3-input modelo" type="text" placeholder="Modelo"></td>
    <td><input class="w3-input numero-serie" type="text" placeholder="Número de serie"></td>
    <td class="no_print">
      <button class="w3-button w3-red w3-round"
        onclick="this.closest('tr').remove()">✕</button>
    </td>
  `;
  filaBoton.parentNode.insertBefore(nuevaFila, filaBoton);
}

// ── Agregar conclusión ────────────────────────────────────────────────────────
function conclusion() {
  const filaBoton = document.getElementById('fila-conclusion');
  const nuevaFila = document.createElement('tr');
  nuevaFila.innerHTML = `
    <td>
      <div style="display:flex; gap:6px; align-items:flex-start;">
        <textarea class="w3-input" rows="3" placeholder="Conclusión y acciones requeridas..."
          style="resize:vertical; width:100%;"></textarea>
        <button class="w3-button w3-red w3-round no_print"
          onclick="this.closest('tr').remove()">✕</button>
      </div>
    </td>
  `;
  filaBoton.parentNode.insertBefore(nuevaFila, filaBoton);
}

// ── Imprimir / Descargar PDF ──────────────────────────────────────────────────
function imprimir() {
  // Guardar valores de todos los inputs/textareas
  const valores = [];
  document.querySelectorAll('input, textarea').forEach(el => {
    valores.push({ el, value: el.value });
  });

  // Nombre del archivo PDF
  const campo1   = document.getElementById('num-reporte')?.value.trim()   || '';
  const campo2   = document.getElementById('num-cotizacion')?.value.trim() || '';
  const fechaRaw = document.getElementById('fecha_llenado')?.value          || '';
  const campo3   = fechaRaw ? fechaRaw.split('-').reverse().join('-') : '';

  const partes        = [campo1, campo2, campo3].filter(Boolean);
  const nombreArchivo = partes.length > 0
    ? partes.join('_').replace(/\s+/g, '_')
    : 'Reporte_Vixomedia';

  const tituloOriginal = document.title;
  document.title = nombreArchivo;

  setTimeout(() => {
    window.print();
    setTimeout(() => {
      document.title = tituloOriginal;
      valores.forEach(({ el, value }) => { el.value = value; });
    }, 1200);
  }, 250);
}
