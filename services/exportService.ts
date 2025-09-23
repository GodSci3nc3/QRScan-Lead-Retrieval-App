import { Alert } from 'react-native';
import * as XLSX from 'xlsx';
import { ExportOptions, Prospect } from '../types/prospect';

export class ExportService {
  // Generate CSV content from prospects data
  static generateCSV(prospects: Prospect[], includeNotes: boolean = true): string {
    const headers = [
      'Nombre Completo',
      'Empresa',
      'Cargo',
      'Email',
      'Teléfono',
      'Industria',
      'Sitio Web',
      'Dirección',
      'Prioridad',
      'Fuente del Lead',
      'Fecha de Registro',
      'Destacado'
    ];

    if (includeNotes) {
      headers.push('Notas');
    }

    const csvRows: string[] = [];
    
    // Add headers
    csvRows.push(headers.map(h => `"${h}"`).join(','));
    
    // Add data rows
    prospects.forEach(prospect => {
      const row = [
        `"${prospect.name || ''}"`,
        `"${prospect.company || ''}"`,
        `"${prospect.position || ''}"`,
        `"${prospect.email || ''}"`,
        `"${prospect.phone || ''}"`,
        `"${prospect.industry || ''}"`,
        `"${prospect.website || ''}"`,
        `"${prospect.address || ''}"`,
        `"${prospect.priority || ''}"`,
        `"${prospect.leadSource || ''}"`,
        `"${new Date(prospect.createdAt || Date.now()).toLocaleString('es-ES')}"`,
        `"${prospect.isStarred ? 'Sí' : 'No'}"`
      ];

      if (includeNotes) {
        row.push(`"${prospect.notes || ''}"`);
      }

      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  // Generate Excel workbook from prospects data
  static generateExcel(prospects: Prospect[], includeNotes: boolean = true): ArrayBuffer {
    const workbook = XLSX.utils.book_new();

    // Prepare data for Excel
    const excelData = prospects.map(prospect => {
      const row: any = {
        'Nombre Completo': prospect.name || '',
        'Empresa': prospect.company || '',
        'Cargo': prospect.position || '',
        'Email': prospect.email || '',
        'Teléfono': prospect.phone || '',
        'Industria': prospect.industry || '',
        'Sitio Web': prospect.website || '',
        'Dirección': prospect.address || '',
        'Prioridad': prospect.priority || '',
        'Fuente del Lead': prospect.leadSource || '',
        'Fecha de Registro': new Date(prospect.createdAt || Date.now()).toLocaleDateString('es-ES'),
        'Destacado': prospect.isStarred ? 'Sí' : 'No'
      };

      if (includeNotes && prospect.notes) {
        row['Notas'] = prospect.notes;
      }

      return row;
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Nombre Completo
      { wch: 25 }, // Empresa
      { wch: 20 }, // Cargo
      { wch: 30 }, // Email
      { wch: 15 }, // Teléfono
      { wch: 15 }, // Industria
      { wch: 25 }, // Sitio Web
      { wch: 35 }, // Dirección
      { wch: 10 }, // Prioridad
      { wch: 20 }, // Fuente del Lead
      { wch: 18 }, // Fecha de Registro
      { wch: 10 }, // Destacado
    ];

    if (includeNotes) {
      columnWidths.push({ wch: 40 }); // Notas
    }

    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Prospectos');

    // Create summary sheet
    const summaryData = this.generateSummaryData(prospects);
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [{ wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumen');

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return excelBuffer;
  }

  // Generate summary data for Excel
  static generateSummaryData(prospects: Prospect[]): any[] {
    const summary = [
      { 'Métrica': 'Total de Prospectos', 'Valor': prospects.length },
      { 'Métrica': 'Prospectos Destacados', 'Valor': prospects.filter(p => p.isStarred).length },
      { 'Métrica': 'Con Teléfono', 'Valor': prospects.filter(p => p.phone).length },
      { 'Métrica': 'Con Sitio Web', 'Valor': prospects.filter(p => p.website).length },
      { 'Métrica': 'Prioridad Alta', 'Valor': prospects.filter(p => p.priority === 'Alta').length },
      { 'Métrica': 'Prioridad Media', 'Valor': prospects.filter(p => p.priority === 'Media').length },
      { 'Métrica': 'Prioridad Baja', 'Valor': prospects.filter(p => p.priority === 'Baja').length },
    ];

    // Add company breakdown
    const companies = prospects.reduce((acc, prospect) => {
      if (prospect.company) {
        acc[prospect.company] = (acc[prospect.company] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    summary.push({ 'Métrica': '', 'Valor': 0 }); // Empty row
    summary.push({ 'Métrica': 'Empresas Representadas:', 'Valor': 0 });

    Object.entries(companies)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([company, count]) => {
        summary.push({ 'Métrica': company, 'Valor': count });
      });

    return summary;
  }

  // Save file to device (simplified version)
  static async saveFile(content: string | ArrayBuffer, filename: string, mimeType: string): Promise<string> {
    try {
      // For now, we'll use a simple alert to show the content
      // This can be enhanced later with proper file system access
      if (typeof content === 'string') {
        const preview = content.length > 1000 ? content.substring(0, 1000) + '...' : content;
        Alert.alert(
          'Archivo Generado',
          `Archivo: ${filename}\n\nContenido (primeros 1000 caracteres):\n\n${preview}`,
          [
            { text: 'Copiar Todo', onPress: () => this.copyToClipboard(content) },
            { text: 'Cerrar' }
          ]
        );
      } else {
        Alert.alert(
          'Archivo Excel Generado',
          `Se ha generado el archivo: ${filename}\n\nArchivo binario de ${content.byteLength} bytes.`,
          [{ text: 'OK' }]
        );
      }
      
      return filename; // Return filename as placeholder
    } catch (error) {
      console.error('Error saving file:', error);
      throw new Error('No se pudo guardar el archivo');
    }
  }

  // Export prospects with enhanced file sharing
  static async exportProspects(options: ExportOptions): Promise<boolean> {
    try {
      const { format, includeNotes, prospects } = options;
      
      if (prospects.length === 0) {
        Alert.alert('Sin Datos', 'No hay prospectos para exportar');
        return false;
      }

      let content: string;
      const timestamp = new Date().toISOString().split('T')[0];

      switch (format) {
        case 'CSV':
          content = this.generateCSV(prospects, includeNotes);
          Alert.alert(
            'CSV Generado',
            `Datos de ${prospects.length} prospectos:\n\n${content.substring(0, 500)}${content.length > 500 ? '...' : ''}`,
            [
              { text: 'Copiar Todo', onPress: () => this.copyToClipboard(content) },
              { text: 'Cerrar' }
            ]
          );
          break;
        
        case 'EXCEL':
          const excelData = this.generateExcel(prospects, includeNotes);
          Alert.alert(
            'Excel Generado',
            `Se generó archivo Excel con ${prospects.length} prospectos.\n\nArchivo binario de ${excelData.byteLength} bytes.`,
            [{ text: 'OK' }]
          );
          break;
        
        case 'JSON':
          content = this.generateJSON(prospects);
          Alert.alert(
            'JSON Generado',
            `Datos de ${prospects.length} prospectos:\n\n${content.substring(0, 500)}${content.length > 500 ? '...' : ''}`,
            [
              { text: 'Copiar Todo', onPress: () => this.copyToClipboard(content) },
              { text: 'Cerrar' }
            ]
          );
          break;
        
        default:
          throw new Error('Formato de exportación no compatible');
      }

      return true;
    } catch (error) {
      console.error('Error de exportación:', error);
      Alert.alert('Error de Exportación', 'No se pudo exportar el archivo: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      return false;
    }
  }

  // Generate JSON content from prospects data  
  static generateJSON(prospects: Prospect[]): string {
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalProspects: prospects.length,
      version: '1.0',
      prospects: prospects.map(prospect => ({
        ...prospect,
        createdAt: new Date(prospect.createdAt || Date.now()).toISOString(),
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Copy content to clipboard (simple implementation)
  private static copyToClipboard(content: string) {
    // Simple implementation - show content for manual copying
    Alert.alert(
      'Copiar Contenido',
      'Aquí está el contenido completo para copiar:',
      [
        { 
          text: 'Ver Todo', 
          onPress: () => {
            Alert.alert(
              'Contenido Completo',
              content,
              [{ text: 'Cerrar' }],
              { cancelable: true }
            );
          }
        },
        { text: 'Cerrar' }
      ]
    );
  }

  // Export single prospect
  static async exportSingleProspect(
    prospect: Prospect, 
    format: 'CSV' | 'JSON' | 'EXCEL' = 'CSV',
    includeNotes: boolean = true
  ): Promise<boolean> {
    const prospectName = prospect.name || prospect.fullName || 'prospect';
    return this.exportProspects({
      format,
      includeNotes,
      prospects: [prospect],
      fileName: `prospect_${prospectName.replace(/\s+/g, '_')}`
    });
  }

  // Generate vCard content
  static generateVCard(prospect: Prospect): string {
    const prospectName = prospect.name || prospect.fullName || '';
    const prospectPosition = prospect.position || prospect.jobTitle || '';
    
    const vCard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${prospectName}`,
      `ORG:${prospect.company}`,
      `TITLE:${prospectPosition}`,
      `EMAIL:${prospect.email}`,
    ];

    if (prospect.phone) {
      vCard.push(`TEL:${prospect.phone}`);
    }

    if (prospect.notes) {
      vCard.push(`NOTE:${prospect.notes}`);
    }

    if (prospect.registrationType) {
      vCard.push(`CATEGORIES:${prospect.registrationType}`);
    }
    
    vCard.push('END:VCARD');

    return vCard.join('\n');
  }

  // Export as vCard
  static async exportAsVCard(prospect: Prospect): Promise<boolean> {
    try {
      const vCardContent = this.generateVCard(prospect);
      const prospectName = prospect.name || prospect.fullName || 'Prospecto';
      
      Alert.alert(
        'vCard Generada',
        `Contacto para ${prospectName}:\n\n${vCardContent}`,
        [{ text: 'Cerrar' }]
      );

      return true;
    } catch (error) {
      console.error('vCard export error:', error);
      Alert.alert('Export Error', 'No se pudo exportar el contacto');
      return false;
    }
  }

  // Get export statistics
  static getExportStats(prospects: Prospect[]): {
    total: number;
    byCompany: Record<string, number>;
    byType: Record<string, number>;
    withNotes: number;
    starred: number;
  } {
    const stats = {
      total: prospects.length,
      byCompany: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      withNotes: 0,
      starred: 0
    };

    prospects.forEach(prospect => {
      // Count by company
      if (prospect.company) {
        stats.byCompany[prospect.company] = (stats.byCompany[prospect.company] || 0) + 1;
      }
      
      // Count by registration type
      if (prospect.registrationType) {
        stats.byType[prospect.registrationType] = (stats.byType[prospect.registrationType] || 0) + 1;
      }
      
      // Count prospects with notes
      if (prospect.notes) {
        stats.withNotes++;
      }
      
      // Count starred prospects
      if (prospect.isStarred) {
        stats.starred++;
      }
    });

    return stats;
  }

  // Validate export options
  static validateExportOptions(options: ExportOptions): string[] {
    const errors: string[] = [];

    if (!options.prospects || options.prospects.length === 0) {
      errors.push('No prospects selected for export');
    }

    if (!['CSV', 'JSON', 'EXCEL'].includes(options.format)) {
      errors.push('Invalid export format');
    }

    if (options.fileName && !/^[a-zA-Z0-9._-]+$/.test(options.fileName)) {
      errors.push('Invalid filename characters');
    }

    return errors;
  }

  // Create export preview
  static generateExportPreview(prospects: Prospect[], format: 'CSV' | 'JSON' | 'EXCEL', maxRows: number = 5): string {
    const previewProspects = prospects.slice(0, maxRows);
    
    switch (format) {
      case 'CSV':
        const csvPreview = this.generateCSV(previewProspects, false);
        const lines = csvPreview.split('\n');
        if (prospects.length > maxRows) {
          lines.push(`... and ${prospects.length - maxRows} more rows`);
        }
        return lines.join('\n');
      
      case 'JSON':
        const jsonData = {
          preview: true,
          totalProspects: prospects.length,
          showingFirst: Math.min(maxRows, prospects.length),
          prospects: previewProspects.map(p => ({
            name: p.name || p.fullName,
            company: p.company,
            email: p.email,
            position: p.position || p.jobTitle
          }))
        };
        return JSON.stringify(jsonData, null, 2);
      
      case 'EXCEL':
        return `Excel preview - ${prospects.length} prospectos, mostrando primeros ${Math.min(maxRows, prospects.length)}`;
      
      default:
        return 'Preview not available for this format';
    }
  }
}