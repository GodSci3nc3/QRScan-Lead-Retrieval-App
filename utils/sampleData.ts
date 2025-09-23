import { ProspectDatabase } from '../services/prospectDatabase';

export const addSampleProspects = async () => {
  try {
    // Verificar si ya existen prospectos
    const existingProspects = await ProspectDatabase.getAllProspects();
    if (existingProspects.length > 0) {
      console.log('Ya existen prospectos, no agregando muestras');
      return;
    }

    // Agregar prospectos de muestra
    const sampleProspects = [
      {
        fullName: 'Juan Pérez Martínez',
        company: 'Tech Solutions Inc.',
        jobTitle: 'Desarrollador Senior',
        email: 'juan.perez@techsolutions.com',
        phone: '+1 (555) 123-4567',
        registrationType: 'VIP' as const,
        notes: [],
        isStarred: true,
        tags: ['JavaScript', 'React']
      },
      {
        fullName: 'María García López',
        company: 'Digital Innovations Corp',
        jobTitle: 'Product Manager',
        email: 'maria.garcia@digitalinnovations.com',
        phone: '+1 (555) 987-6543',
        registrationType: 'General' as const,
        notes: [],
        isStarred: false,
        tags: ['Product', 'Strategy']
      },
      {
        fullName: 'Carlos Rodríguez Silva',
        company: 'StartupHub Ventures',
        jobTitle: 'CEO & Founder',
        email: 'carlos@startuphub.vc',
        phone: '+1 (555) 456-7890',
        registrationType: 'Speaker' as const,
        notes: [],
        isStarred: true,
        tags: ['Entrepreneurship', 'Ventures']
      },
      {
        fullName: 'Ana Fernández Torres',
        company: 'Design Studio Pro',
        jobTitle: 'UX/UI Designer',
        email: 'ana.fernandez@designstudio.pro',
        phone: '+1 (555) 234-5678',
        registrationType: 'General' as const,
        notes: [],
        isStarred: false,
        tags: ['Design', 'UX']
      }
    ];

    // Guardar cada prospecto
    for (const prospect of sampleProspects) {
      await ProspectDatabase.saveProspect(prospect);
    }

    console.log('Prospectos de muestra agregados exitosamente');
  } catch (error) {
    console.error('Error agregando prospectos de muestra:', error);
  }
};