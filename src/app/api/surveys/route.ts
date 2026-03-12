import { SurveyService } from '@/services/surveys/SurveyService';
import { withAuth } from '@/lib/api/withAuth';
import { NextResponse } from 'next/server';

// GET - List all surveys
export const GET = withAuth(async () => {
  try {
    const surveys = await SurveyService.list();

    return NextResponse.json({
      success: true,
      data: surveys,
    });
  } catch (error) {
    console.error('Error in GET /api/surveys:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
});

// POST - Create new survey
export const POST = withAuth(async (request, _context, auth) => {
  try {
    const body = await request.json();
    const userId = auth.uid;
    const userName = auth.email;

    const surveyId = await SurveyService.create(body, userId, userName);

    return NextResponse.json({
      success: true,
      data: { id: surveyId },
      message: 'Encuesta creada exitosamente',
    });
  } catch (error) {
    console.error('Error in POST /api/surveys:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
});
