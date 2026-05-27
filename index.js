 const firmas = [
      { canvasId: 'canvas1', wrapperId: 'wrapper1', estadoId: 'estado1', indId: 'ind1' },
      { canvasId: 'canvas2', wrapperId: 'wrapper2', estadoId: 'estado2', indId: 'ind2' },
    ];

    firmas.forEach(({ canvasId, wrapperId, estadoId, indId }) => {
      iniciarFirma(canvasId, wrapperId, estadoId, indId);
    });

    function iniciarFirma(canvasId, wrapperId, estadoId, indId) {
      const canvas  = document.getElementById(canvasId);
      const wrapper = document.getElementById(wrapperId);
      const ctx     = canvas.getContext('2d');

      // Ajustar resolución real del canvas al tamaño CSS
      function ajustarTamano() {
        const rect = canvas.getBoundingClientRect();
        canvas.width  = rect.width  * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth   = 2;
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';
      }
      ajustarTamano();
      window.addEventListener('resize', ajustarTamano);

      let dibujando = false;
      let firmado   = false;

      function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const src  = e.touches ? e.touches[0] : e;
        return {
          x: src.clientX - rect.left,
          y: src.clientY - rect.top,
        };
      }

      function iniciar(e) {
        e.preventDefault();
        dibujando = true;
        const { x, y } = getPos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
      }

      function dibujar(e) {
        if (!dibujando) return;
        e.preventDefault();
        const { x, y } = getPos(e);
        ctx.lineTo(x, y);
        ctx.stroke();

        
      }

      function terminar() { dibujando = false; }

      // Mouse
      canvas.addEventListener('mousedown',  iniciar);
      canvas.addEventListener('mousemove',  dibujar);
      canvas.addEventListener('mouseup',    terminar);
      canvas.addEventListener('mouseleave', terminar);

      // Touch (móvil)
      canvas.addEventListener('touchstart', iniciar,   { passive: false });
      canvas.addEventListener('touchmove',  dibujar,   { passive: false });
      canvas.addEventListener('touchend',   terminar);
    }

    // ─── Limpiar canvas ───────────────────────────────────────────────────────
    function limpiar(canvasId, wrapperId, estadoId) {
      const canvas  = document.getElementById(canvasId);
      const ctx     = canvas.getContext('2d');
      const rect    = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width * window.devicePixelRatio, rect.height * window.devicePixelRatio);
      document.getElementById(wrapperId).classList.remove('signed');
      
    }

    // ─── Descargar firma como imagen ──────────────────────────────────────────
    function descargar(canvasId, nombre) {
      const canvas = document.getElementById(canvasId);
      const link   = document.createElement('a');
      link.download = nombre + '.png';
      link.href     = canvas.toDataURL('image/png');
      link.click();
    }

    // ─── Obtener base64 de una firma (para enviar al servidor) ────────────────
    function obtenerBase64(canvasId) {
      return document.getElementById(canvasId).toDataURL('image/png');
    }

    // ─── Enviar / guardar ─────────────────────────────────────────────────────
    function enviar() {
      const firma1 = obtenerBase64('canvas1');
      const firma2 = obtenerBase64('canvas2');

      // Aquí puedes hacer un fetch/POST a tu servidor:
      // fetch('/guardar-firmas', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ firma1, firma2 })
      // });

      // Demo: solo mostramos confirmación
      alert('✅ Documento firmado correctamente.\n\nEn producción, las firmas se enviarían al servidor como imágenes Base64.'); 
    }   

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

      // Cada imagen genera su propio input usando el índice
      container.innerHTML = `
        <img src="${reader.result}" alt="${file.name}">
        <p>${file.name}</p>
        <input 
          type="text" 
          id="descripcion_${index}" 
          name="descripcion_${index}"
          class="w3-input" 
          placeholder="Descripción de la foto ${index + 1}"
        >
      `;

      preview.appendChild(container);
    };

    reader.readAsDataURL(file);
  });
}

    function tenicos() {
  const filaBoton = document.getElementById("fila-tecnicos");
  
  const nuevaFila = document.createElement("tr");
  nuevaFila.innerHTML = `
    <td colspan="3"></td>
    <td class="w3-center">Técnico:</td>
    <td>
      <div style="display:flex; gap:6px; align-items:center;">
       <textarea class="w3-input" rows="3" placeholder="Tencnicos....." 
          style="resize:vertical; width:100%;"></textarea>
        <button class="w3-button w3-red w3-round" onclick="this.closest('tr').remove()">✕</button>
      </div>
    </td>
  `;

  // Insertar ANTES de la fila del botón
  filaBoton.parentNode.insertBefore(nuevaFila, filaBoton);
}

 function descripcion() {
  const filaBoton = document.getElementById("fila-descripcion");

  const nuevaFila = document.createElement("tr");
  nuevaFila.innerHTML = `
    <td>
      <div style="display:flex; gap:6px; align-items:center;">
         <textarea class="w3-input" rows="3" placeholder="Descripción del trabajo..." 
          style="resize:vertical; width:100%;"></textarea>
        <button class="w3-button w3-red w3-round" onclick="this.closest('tr').remove()">✕</button>
      </div>
    </td>
  `;

  // Inserta ANTES del botón → las descripciones quedan entre el título y el botón
  filaBoton.parentNode.insertBefore(nuevaFila, filaBoton);
}
    function materiales() {
  const filaBoton = document.getElementById("fila-materiales");

  const nuevaFila = document.createElement("tr");
  nuevaFila.innerHTML = `
    <td><input class="w3-input canitdad" type="number" min="0" value="" style="width:60px;"></td>
    <td><input class="w3-input marca" type="text" placeholder="Marca" style="width:300px;"></td>
    <td><input class="w3-input modelo" type="text" placeholder="Modelo"></td>
    <td>
      <div style="display:flex; gap:6px; align-items:center;">
        <input class="w3-input numero-serie" type="text" placeholder="Número de serie">
        <button class="w3-button w3-red w3-round" onclick="this.closest('tr').remove()">✕</button>
      </div>
    </td>
  `;

  filaBoton.parentNode.insertBefore(nuevaFila, filaBoton);
}
    
    function conclusion() {
      const filaBoton = document.getElementById("fila-conclusion");

  const nuevaFila = document.createElement("tr");
  nuevaFila.innerHTML = `
    <td>
      <div style="display:flex; gap:6px; align-items:center;">
         <textarea class="w3-input" rows="3" placeholder="Descripción del trabajo..." 
          style="resize:vertical; width:100%;"></textarea>
        <button class="w3-button w3-red w3-round" onclick="this.closest('tr').remove()">✕</button>
      </div>
    </td>
  `;

  // Inserta ANTES del botón → las descripciones quedan entre el título y el botón
  filaBoton.parentNode.insertBefore(nuevaFila, filaBoton);
    }

    


   /* function imprimir() {
  // Guardar valores de inputs y textareas antes de imprimir
  // (algunos navegadores los pierden al restaurar)
  const valores = [];
  document.querySelectorAll('input, textarea').forEach(el => {
    valores.push({ el, value: el.value });
  });

  window.print();

  // Restaurar valores por si el navegador los resetea
  setTimeout(() => {
    valores.forEach(({ el, value }) => { el.value = value; });
  }, 500);
} */
/*function imprimir() {
  // Guardar valores de inputs y textareas antes de imprimir
  const valores = [];
  document.querySelectorAll('input, textarea').forEach(el => {
    valores.push({ el, value: el.value });
  });

  // --- NOMBRE DEL PDF ---
  // Cambia estos IDs por los de tus campos
  const campo1 = document.getElementById('num-reporte')?.value.trim() || '';
  const campo2 = document.getElementById('num-cotizacion')?.value.trim() || '';
  const campo3 = document.getElementById('fecha_llenado')?.value.trim() || '';

  const partes = [campo1, campo2, campo3].filter(Boolean);
  const nombreArchivo = partes.length > 0
    ? partes.join('_').replace(/\s+/g, '_')
    : 'Reporte';

  const tituloOriginal = document.title;
  document.title = nombreArchivo;
  // ----------------------

  window.print();

  // Restaurar título e inputs
  setTimeout(() => {
    document.title = tituloOriginal;
    valores.forEach(({ el, value }) => { el.value = value; });
  }, 1000);
} */

  function imprimir() {
  const valores = [];
  document.querySelectorAll('input, textarea').forEach(el => {
    valores.push({ el, value: el.value });
  });

  const campo1 = document.getElementById('num-reporte')?.value.trim() || '';
  const campo2 = document.getElementById('num-cotizacion')?.value.trim() || '';
  const fechaRaw = document.getElementById('fecha_llenado')?.value || '';
  const campo3 = fechaRaw ? fechaRaw.split('-').reverse().join('-') : '';

  const partes = [campo1, campo2, campo3].filter(Boolean);
  const nombreArchivo = partes.length > 0
    ? partes.join('_').replace(/\s+/g, '_')
    : 'Reporte';

  const tituloOriginal = document.title;
  document.title = nombreArchivo;

  setTimeout(() => {          // ← espera 200ms antes de abrir el diálogo
    window.print();
    setTimeout(() => {
      document.title = tituloOriginal;
      valores.forEach(({ el, value }) => { el.value = value; });
    }, 1000);
  }, 200);
}