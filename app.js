document.getElementById('calcular').addEventListener('click', () => {
  const m2 = parseFloat(document.getElementById('m2').value);
  const tipo = document.getElementById('tipo').value;
  let resultado = '';

  if (!m2 || m2 <= 0) {
    resultado = 'Ingrese un valor válido.';
  } else {
    if (tipo === 'steel') {
      resultado = `Necesitarás ${Math.ceil(m2 * 3)} perfiles de Steel Frame y ${Math.ceil(m2 * 2)} placas.`;
    } else {
      resultado = `Necesitarás ${Math.ceil(m2 * 1.5)} placas de Durlock y ${Math.ceil(m2 * 2)} tornillos.`;
    }
  }

  document.getElementById('resultado').textContent = resultado;
});
