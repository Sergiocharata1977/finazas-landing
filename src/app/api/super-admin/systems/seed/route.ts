import { SUPER_ADMIN_AUTH_OPTIONS } from '@/lib/api/superAdminAuth';
import { withAuth } from '@/lib/api/withAuth';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextResponse } from 'next/server';

/**
 * POST /api/super-admin/systems/seed — Registrar los 3 sistemas iniciales
 * Solo ejecutar una vez para inicializar la collection platform_systems.
 */
export const POST = withAuth(async () => {
  try {
    const db = getAdminFirestore();

    const systems = [
      {
        id: 'iso9001',
        name: 'ISO 9001 · Quality Management',
        description:
          'Sistema de gestión de calidad: auditorías, hallazgos, acciones correctivas, documentos, RRHH, procesos, CRM.',
        url: 'https://doncandidoia.com',
        healthEndpoint: '/api/health',
        color: 'emerald',
        icon: 'ShieldCheck',
        status: 'active',
        version: '8.0.0',
        modules: [
          'noticias',
          'calendario',
          'documentos',
          'puntos-norma',
          'crm',
          'rrhh',
          'procesos',
          'mejoras',
          'mi-sgc',
          'planificacion',
        ],
      },
      {
        id: 'finanzas',
        name: 'Don Cándido · Finanzas',
        description:
          'Simulador de inversiones, gestión financiera, análisis de riesgo y scoring crediticio.',
        url: 'https://finanzas.doncandidoia.com',
        healthEndpoint: '/api/health',
        color: 'rose',
        icon: 'TrendingUp',
        status: 'active',
        version: '1.0.0',
        modules: [
          'simulador',
          'clientes',
          'portafolios',
          'scoring',
          'reportes',
        ],
      },
      {
        id: 'sig-agro',
        name: 'SIG Agro · Gestión Agropecuaria',
        description:
          'Sistema integrado de gestión agropecuaria: trazabilidad, lotes, cosecha, clima, compliance.',
        url: 'https://sigagro.doncandidoia.com',
        healthEndpoint: '/api/health',
        color: 'amber',
        icon: 'Wheat',
        status: 'active',
        version: '0.5.0',
        modules: [
          'campos',
          'lotes',
          'cosecha',
          'insumos',
          'trazabilidad',
          'clima',
          'compliance',
        ],
      },
    ];

    const batch = db.batch();
    const now = new Date();

    for (const sys of systems) {
      const ref = db.collection('platform_systems').doc(sys.id);
      batch.set(ref, {
        ...sys,
        created_at: now,
        updated_at: now,
      });
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `${systems.length} sistemas inicializados`,
      systems: systems.map(s => s.id),
    });
  } catch (error) {
    console.error('Error al seedear sistemas:', error);
    return NextResponse.json(
      { error: 'Error al seedear sistemas' },
      { status: 500 }
    );
  }
}, SUPER_ADMIN_AUTH_OPTIONS);
