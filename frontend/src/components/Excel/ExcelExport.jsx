import React from 'react';
import * as XLSX from 'xlsx';

const ExcelExport = ({ data, fileName }) => {
    
    const handleExport = () => {
        if (!data || data.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }

        // Crear un libro de trabajo (workbook) y una hoja (worksheet)
        const worksheet = XLSX.utils.json_to_sheet(data);  // Convertir los datos JSON a hoja Excel
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

        // Exportar el archivo Excel
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };

    return (
        <div className="excel-export-container">
            <h2>Exportar datos a Excel</h2>
            
            {/* Botón para exportar los datos */}
            <button onClick={handleExport} disabled={!data || data.length === 0}>
                Exportar a Excel
            </button>
        </div>
    );
};

export default ExcelExport;
