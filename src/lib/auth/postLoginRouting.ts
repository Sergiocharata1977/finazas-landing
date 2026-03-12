import { isOnboardingOwner } from '@/lib/onboarding/resolveOnboardingOwner';

const STRATEGY_ONBOARDING_ROUTE =
  '/planificacion-revision-direccion?onboarding=1';

type LandingUserLike = {
  id?: string | null;
  uid?: string | null;
  rol?: string | null;
  organization_id?: string | null;
  personnel_id?: string | null;
  first_login?: boolean | null;
  is_first_login?: boolean | null;
  onboarding_phase?: string | null;
  onboarding_owner_user_id?: string | null;
  onboardingState?: {
    onboarding_phase?: string | null;
    onboarding_owner_user_id?: string | null;
  } | null;
};

function normalizeRole(role?: string | null): string {
  return (role || '').toLowerCase().trim();
}

function isReturnUrlAllowed(returnUrl?: string | null): returnUrl is string {
  if (!returnUrl) return false;
  if (!returnUrl.startsWith('/')) return false;
  if (returnUrl.startsWith('//')) return false;

  const blocked = new Set(['/login', '/register', '/pending']);
  const pathname = returnUrl.split(/[?#]/, 1)[0];
  return !blocked.has(pathname);
}

function normalizeText(value?: string | null): string {
  return (value || '').trim().toLowerCase();
}

function shouldRedirectToStrategyPlanning(
  user?: LandingUserLike | null
): boolean {
  if (!user?.organization_id) return false;

  const onboardingPhase = normalizeText(
    user.onboarding_phase ?? user.onboardingState?.onboarding_phase
  );

  if (onboardingPhase !== 'strategy_pending') return false;

  return isOnboardingOwner(user, {
    onboarding_owner_user_id:
      user.onboarding_owner_user_id ??
      user.onboardingState?.onboarding_owner_user_id,
  }).isOwner;
}

export function resolvePostLoginRoute(user?: LandingUserLike | null): string {
  if (!user) return '/noticias';

  const role = normalizeRole(user.rol);
  if (role === 'super_admin') return '/super-admin';

  const isFirstLogin =
    user.first_login === true || user.is_first_login === true;
  if (!user.organization_id || isFirstLogin) return '/onboarding';

  if (shouldRedirectToStrategyPlanning(user)) {
    return STRATEGY_ONBOARDING_ROUTE;
  }

  // Toda cuenta de organizacion entra a Noticias como pantalla de inicio.
  return '/noticias';
}

export function resolvePostLoginDestination(
  user?: LandingUserLike | null,
  returnUrl?: string | null
): string {
  const defaultRoute = resolvePostLoginRoute(user);

  if (defaultRoute === STRATEGY_ONBOARDING_ROUTE) {
    return STRATEGY_ONBOARDING_ROUTE;
  }

  // Regla de producto: usuarios con organizacion entran siempre a Noticias.
  if (user?.organization_id && defaultRoute === '/noticias') {
    return '/noticias';
  }

  if (isReturnUrlAllowed(returnUrl)) return returnUrl;
  return defaultRoute;
}
