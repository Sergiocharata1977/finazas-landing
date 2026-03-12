jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

jest.mock('@/lib/api/withAuth', () => ({
  withAuth: (handler: any) => {
    return (request: any, context: any = { params: Promise.resolve({}) }) =>
      handler(request, context, {
        uid: request.__uid || 'user-1',
        email: 'user@test.com',
        organizationId: request.__orgId || 'org-1',
        role: request.__role || 'admin',
        user: {
          id: request.__uid || 'user-1',
          email: 'user@test.com',
          rol: request.__role || 'admin',
          organization_id: request.__orgId || 'org-1',
          personnel_id: null,
          activo: true,
          status: 'active',
        },
      });
  },
}));

const mockResolveAuthorizedOrganizationId = jest.fn();
const mockToOrganizationApiError = jest.fn();
jest.mock('@/middleware/verifyOrganization', () => ({
  resolveAuthorizedOrganizationId: (...args: unknown[]) =>
    mockResolveAuthorizedOrganizationId(...args),
  toOrganizationApiError: (...args: unknown[]) =>
    mockToOrganizationApiError(...args),
}));

const mockUnifiedConverse = jest.fn();
jest.mock('@/services/ai-core/UnifiedConverseService', () => ({
  UnifiedConverseService: {
    converse: (...args: unknown[]) => mockUnifiedConverse(...args),
  },
}));

import { POST } from '@/app/api/ai/converse/route';

describe('POST /api/ai/converse', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockResolveAuthorizedOrganizationId.mockResolvedValue({
      ok: true,
      organizationId: 'org-1',
    });
    mockUnifiedConverse.mockResolvedValue({
      reply: 'Respuesta desde Don Candido',
      sessionId: 'session-1',
      tokensUsed: 321,
    });
  });

  it('returns the unified converse contract for authenticated channels', async () => {
    const response = await POST(
      {
        json: async () => ({
          channel: 'chat',
          message: 'Como funciona auditorias?',
          sessionId: 'session-1',
          organizationId: 'org-1',
          pathname: '/auditorias',
        }),
      } as any,
      { params: Promise.resolve({}) } as any
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      reply: 'Respuesta desde Don Candido',
      sessionId: 'session-1',
      tokensUsed: 321,
    });
    expect(mockUnifiedConverse).toHaveBeenCalledWith({
      channel: 'chat',
      message: 'Como funciona auditorias?',
      sessionId: 'session-1',
      organizationId: 'org-1',
      userId: 'user-1',
      userRole: 'admin',
      pathname: '/auditorias',
    });
  });

  it('rejects cross-organization access', async () => {
    mockResolveAuthorizedOrganizationId.mockResolvedValue({
      ok: false,
      status: 403,
      error: 'Acceso denegado',
      errorCode: 'ORGANIZATION_MISMATCH',
    });
    mockToOrganizationApiError.mockReturnValue({
      status: 403,
      error: 'Acceso denegado',
      errorCode: 'ORGANIZATION_MISMATCH',
    });

    const response = await POST(
      {
        json: async () => ({
          channel: 'voice',
          message: 'Necesito ayuda',
          sessionId: 'session-1',
          organizationId: 'org-2',
        }),
      } as any,
      { params: Promise.resolve({}) } as any
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body).toEqual({
      error: 'Acceso denegado',
      errorCode: 'ORGANIZATION_MISMATCH',
    });
    expect(mockUnifiedConverse).not.toHaveBeenCalled();
  });
});
