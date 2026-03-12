import { withAuth } from '@/lib/api/withAuth';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextResponse } from 'next/server';

export const POST = withAuth(
  async () => {
    try {
      const db = getAdminFirestore();
      const usersSnapshot = await db.collection('users').get();

      const usersToUpdate: string[] = [];
      const batch = db.batch();

      usersSnapshot.forEach(doc => {
        const data = doc.data() as any;
        if (!data.organization_id && data.rol !== 'super_admin') {
          usersToUpdate.push(doc.id);
          batch.update(doc.ref, {
            organization_id: 'org_los_senores_del_agro',
            updated_at: new Date(),
          });
        }
      });

      if (usersToUpdate.length > 0) {
        await batch.commit();
        return NextResponse.json({
          success: true,
          message: `${usersToUpdate.length} usuarios actualizados con organization_id`,
          updatedUsers: usersToUpdate,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Todos los usuarios ya tienen organization_id asignado',
        updatedUsers: [],
      });
    } catch (error) {
      console.error('[API /users/fix-organization] Error:', error);
      return NextResponse.json(
        {
          error: 'Error al actualizar usuarios',
          message: error instanceof Error ? error.message : 'Error desconocido',
        },
        { status: 500 }
      );
    }
  },
  { roles: ['super_admin'] }
);
