import {
  resolvePostLoginDestination,
  resolvePostLoginRoute,
} from '@/lib/auth/postLoginRouting';

describe('postLoginRouting', () => {
  describe('resolvePostLoginRoute', () => {
    it('returns /noticias when user is null', () => {
      expect(resolvePostLoginRoute(null)).toBe('/noticias');
    });

    it('returns /super-admin for super_admin role', () => {
      expect(
        resolvePostLoginRoute({
          rol: 'super_admin',
          organization_id: 'org-1',
        })
      ).toBe('/super-admin');
    });

    it('returns /onboarding when user has no organization_id', () => {
      expect(
        resolvePostLoginRoute({
          rol: 'usuario',
          organization_id: null,
        })
      ).toBe('/onboarding');
    });

    it('returns /onboarding when first_login is true', () => {
      expect(
        resolvePostLoginRoute({
          rol: 'usuario',
          organization_id: 'org-1',
          first_login: true,
        })
      ).toBe('/onboarding');
    });

    it('returns /onboarding when is_first_login is true', () => {
      expect(
        resolvePostLoginRoute({
          rol: 'usuario',
          organization_id: 'org-1',
          is_first_login: true,
        })
      ).toBe('/onboarding');
    });

    it('returns /mi-panel when user belongs to an organization and is not first login', () => {
      expect(
        resolvePostLoginRoute({
          rol: 'usuario',
          organization_id: 'org-1',
          first_login: false,
          is_first_login: false,
        })
      ).toBe('/mi-panel');
    });

    it('returns strategy planning route when onboarding is strategy_pending and user is owner', () => {
      expect(
        resolvePostLoginRoute({
          id: 'user-1',
          rol: 'usuario',
          organization_id: 'org-1',
          onboarding_phase: 'strategy_pending',
          onboarding_owner_user_id: 'user-1',
          first_login: false,
        })
      ).toBe('/planificacion-revision-direccion?onboarding=1');
    });

    it('keeps /mi-panel when onboarding is strategy_pending but user is not owner', () => {
      expect(
        resolvePostLoginRoute({
          id: 'user-2',
          rol: 'usuario',
          organization_id: 'org-1',
          onboarding_phase: 'strategy_pending',
          onboarding_owner_user_id: 'user-1',
          first_login: false,
        })
      ).toBe('/mi-panel');
    });
  });

  describe('resolvePostLoginDestination', () => {
    it.each(['/login', '/register', '/pending'])(
      'ignores blocked returnUrl %s',
      returnUrl => {
        expect(
          resolvePostLoginDestination(
            {
              rol: 'usuario',
              organization_id: null,
            },
            returnUrl
          )
        ).toBe('/onboarding');
      }
    );

    it.each(['/login?x=1', '/register?redirect=/mi-sgc', '/pending?step=1'])(
      'ignores blocked returnUrl with querystring %s',
      returnUrl => {
        expect(
          resolvePostLoginDestination(
            {
              rol: 'usuario',
              organization_id: null,
            },
            returnUrl
          )
        ).toBe('/onboarding');
      }
    );

    it('allows a valid returnUrl for user without organization', () => {
      expect(
        resolvePostLoginDestination(
          {
            rol: 'usuario',
            organization_id: null,
          },
          '/mi-sgc'
        )
      ).toBe('/mi-sgc');
    });

    it('forces /mi-panel for user with organization even if returnUrl is /mi-sgc', () => {
      expect(
        resolvePostLoginDestination(
          {
            rol: 'usuario',
            organization_id: 'org-1',
          },
          '/mi-sgc'
        )
      ).toBe('/mi-panel');
    });

    it('forces strategy planning route for onboarding owner even if returnUrl is valid', () => {
      expect(
        resolvePostLoginDestination(
          {
            id: 'user-1',
            rol: 'usuario',
            organization_id: 'org-1',
            onboarding_phase: 'strategy_pending',
            onboarding_owner_user_id: 'user-1',
          },
          '/mi-sgc'
        )
      ).toBe('/planificacion-revision-direccion?onboarding=1');
    });

    it('allows a valid returnUrl for super_admin', () => {
      expect(
        resolvePostLoginDestination(
          {
            rol: 'super_admin',
            organization_id: 'org-1',
          },
          '/admin/auditoria'
        )
      ).toBe('/admin/auditoria');
    });

    it('ignores invalid returnUrl for super_admin and falls back to /super-admin', () => {
      expect(
        resolvePostLoginDestination(
          {
            rol: 'super_admin',
            organization_id: 'org-1',
          },
          'https://evil.com'
        )
      ).toBe('/super-admin');
    });

    it.each(['//evil.com/phish', 'mi-sgc', 'https://evil.com'])(
      'ignores invalid returnUrl %s',
      returnUrl => {
        expect(
          resolvePostLoginDestination(
            {
              rol: 'usuario',
              organization_id: null,
            },
            returnUrl
          )
        ).toBe('/onboarding');
      }
    );
  });
});
