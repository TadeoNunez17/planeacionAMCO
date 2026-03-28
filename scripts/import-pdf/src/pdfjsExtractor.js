import fs from 'fs';
import path from 'path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

export async function extraerTextoPDF(rutaPDF) {
  console.log(`\n📄 Leyendo PDF: ${path.basename(rutaPDF)}`);

  const dataPDF = new Uint8Array(fs.readFileSync(rutaPDF));
  const doc = await getDocument({ data: dataPDF }).promise;
  const totalPaginas = doc.numPages;

  console.log(`📃 Total de páginas detectadas: ${totalPaginas}`);

  let textoCompleto = '';
  let todosLosItems = [];

  for (let numPagina = 1; numPagina <= totalPaginas; numPagina++) {
    const pagina = await doc.getPage(numPagina);
    const contenido = await pagina.getTextContent();

    console.log(`   Procesando página ${numPagina}/${totalPaginas}...`);

    let textoPagina = `\n\n========== PÁGINA ${numPagina} ==========\n`;

    for (const item of contenido.items) {
      if (item.str && item.str.trim() !== '') {
        todosLosItems.push({
          pagina: numPagina,
          texto: item.str,
          x: Math.round(item.transform[4]),
          y: Math.round(item.transform[5]),
        });

        textoPagina += item.str + ' ';
      }
    }

    textoCompleto += textoPagina;
  }

  return { textoCompleto, todosLosItems, totalPaginas };
}