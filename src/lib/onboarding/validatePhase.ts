import { AuditLogService } from '@/services/audit/AuditLogService';
import type { OnboardingPhase } from '@/types/onboarding';

type TransitionActor = {
  userId: string;
  userEmail?: string;
  userRole?: string;
};

type TransitionInput = {
  orgId: string;
  nextPhase: OnboardingPhase;
  adminDb: FirebaseFirestore.Firestore;
  actor?: TransitionActor;
  details?: Record<string, unknown>;
};

type OrganizationRecord = Record<string, unknown> | undefined;

function normalizePhase(value: unknown): OnboardingPhase {
  return typeof value === 'string' && value.trim() ? value : 'not_started';
}

function readPhaseFromOrganizationData(
  data: OrganizationRecord
): OnboardingPhase {
  return normalizePhase(data?.onboardingPhase ?? data?.onboarding_phase);
}

export async function readOrganizationOnboardingPhase(
  orgId: string,
  adminDb: FirebaseFirestore.Firestore
): Promise<OnboardingPhase> {
  const orgRef = adminDb.collection('organizations').doc(orgId);
  const orgDoc = await orgRef.get();

  if (!orgDoc.exists) {
    return 'not_started';
  }

  const rootPhase = readPhaseFromOrganizationData(orgDoc.data());
  if (rootPhase !== 'not_started') {
    return rootPhase;
  }

  const legacyDoc = await orgRef.collection('meta').doc('onboarding').get();
  if (!legacyDoc.exists) {
    return rootPhase;
  }

  return normalizePhase(
    legacyDoc.data()?.organization_phase ?? legacyDoc.data()?.onboarding_phase
  );
}

export async function validateOnboardingPhase(
  orgId: string,
  requiredPhase: OnboardingPhase,
  adminDb: FirebaseFirestore.Firestore
): Promise<{ valid: boolean; currentPhase: OnboardingPhase }> {
  const currentPhase = await readOrganizationOnboardingPhase(orgId, adminDb);

  return {
    valid: currentPhase === requiredPhase,
    currentPhase,
  };
}

export async function transitionOrganizationOnboardingPhase(
  input: TransitionInput
): Promise<{ previousPhase: OnboardingPhase; currentPhase: OnboardingPhase }> {
  const orgRef = input.adminDb.collection('organizations').doc(input.orgId);
  const previousPhase = await readOrganizationOnboardingPhase(
    input.orgId,
    input.adminDb
  );
  const now = new Date();

  await orgRef.set(
    {
      onboardingPhase: input.nextPhase,
      onboarding_phase: input.nextPhase,
      onboardingPhaseUpdatedAt: now,
      updated_at: now,
    },
    { merge: true }
  );

  if (previousPhase !== input.nextPhase) {
    console.info(
      `[OnboardingPhase] org=${input.orgId} ${previousPhase} -> ${input.nextPhase}`
    );

    await AuditLogService.log({
      user_id: input.actor?.userId || 'system',
      user_email: input.actor?.userEmail || 'system@local',
      user_role: input.actor?.userRole || 'system',
      organization_id: input.orgId,
      action: 'update',
      module: 'system',
      resource_type: 'onboarding_phase',
      resource_id: input.orgId,
      resource_name: 'organization_onboarding_phase',
      status: 'success',
      details: {
        previous_phase: previousPhase,
        next_phase: input.nextPhase,
        ...input.details,
      },
    });
  }

  return {
    previousPhase,
    currentPhase: input.nextPhase,
  };
}
