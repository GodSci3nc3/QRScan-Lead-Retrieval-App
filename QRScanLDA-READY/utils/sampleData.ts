import { ProspectDatabase } from '../services/prospectDatabase';

export const addSampleProspects = async () => {
  try {
    const existingProspects = await ProspectDatabase.getAllProspects();
    if (existingProspects.length > 0) {
      console.log('Ya existen prospectos, no agregando muestras');
      return;
    }

    const sampleProspects = [
      {
        fullName: 'Juan Pérez Martínez',
        name: 'Juan Pérez Martínez',
        company: 'Tech Solutions Inc.',
        position: 'Desarrollador Senior',
        email: 'juan.perez@techsolutions.com',
        phone: '+1 (555) 123-4567',
        registrationType: 'VIP' as const,
        notes: 'Muy interesado en nuestras soluciones',
        isStarred: true,
        tags: ['JavaScript', 'React']
      }
    ];

    for (const prospect of sampleProspects) {
      await ProspectDatabase.saveProspect(prospect);
    }

    console.log('Prospectos de muestra agregados exitosamente');
  } catch (error) {
    console.error('Error agregando prospectos de muestra:', error);
  }
};
