import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

export async function downloadDoc({ sessions, plan, docente }) {
  try {
    const response = await fetch('/plantilla_maestra.docx');
    const arrayBuffer = await response.arrayBuffer();
    const zip = new PizZip(arrayBuffer);
    const doc = new Docxtemplater(zip, { 
      delimiters: { start: "[[", end: "]]" },
      paragraphLoop: true,
      linebreaks: true
    });

    // Preparar datos dinámicos
    const data = {
      nombre_docente: docente?.nombre_completo || "DOCENTE NO IDENTIFICADO",
      ciclo_escolar: plan.ciclo_escolar, 
      clave: plan.clave,
      ciclo_amco: plan.cicloAmco, 
      rango_fechas: plan.rango_fechas,
      link_clase: plan.link_clase.trim() !== "" ? plan.link_clase : "NO APLICA",
      recursos_generales: plan.recursos_generales,
      sesiones: sessions.filter(s => s.materias.length > 0).map((s, index) => ({
        numero_sesion: index + 1, 
        fecha_sesion: s.fecha_exacta || s.dia, 
        tema_relevancia: s.tema_relevancia || "",
        materias: s.materias.map(m => ({ 
          ...m, 
          campo_formativo: m.campo 
        }))
      }))
    };

    // Renderizar directamente con datos (nueva API sin setData deprecado)
    doc.render(data);
    
    // Generar el archivo
    const out = doc.getZip().generate({ type: 'blob' });
    
    // Nombre del archivo personalizado
    const nombreArchivo = `Planeacion_${docente?.nombre_completo || 'Docente'}_${plan.rango_fechas || 'Semana'}.docx`;
    saveAs(out, nombreArchivo);

  } catch (e) { 
    console.error(e);
    alert("Error al generar el Word: " + e.message); 
  }
}
