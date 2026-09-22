'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface Props {
  elementId: string;
  fileName?: string;
}

export default function ExportPdfButton({ elementId, fileName = 'Informe_Semanal_Ruta2027.pdf' }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExportPdf = async () => {
    try {
      setIsGenerating(true);

      const target = document.getElementById(elementId);
      if (!target) {
        alert('No se encontró el contenido del informe para exportar.');
        return;
      }

      // Importar dinámicamente librerías en cliente
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      // Capturar elemento HTML a canvas con escala retina
      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: target.scrollWidth,
      });

      const imgData = canvas.toDataURL('image/png');

      // Crear documento PDF en formato A4
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Ajustar proporción
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Primera página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Páginas adicionales si el informe es extenso
      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      // Descargar PDF generado
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Hubo un error al generar el archivo PDF. Intenta usar la opción de Imprimir.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleExportPdf}
      disabled={isGenerating}
      className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition shadow flex items-center gap-1.5 disabled:opacity-50"
      title="Descargar informe completo en formato PDF nativo"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Generando PDF...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span>Descargar PDF</span>
        </>
      )}
    </button>
  );
}
