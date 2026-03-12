/**
 * Types for Survey Module
 * Customer Satisfaction Surveys with multiple question types
 */

export type SurveyType = 'anual' | 'post_entrega';
export type SurveyStatus = 'draft' | 'active' | 'completed';

// Question types
export type QuestionType = 'scale' | 'yes_no' | 'text' | 'multiple_choice';

export interface BaseQuestion {
  id: string;
  question: string;
  type: QuestionType;
  order: number;
  required: boolean;
}

export interface ScaleQuestion extends BaseQuestion {
  type: 'scale';
  minValue: number;
  maxValue: number;
  minLabel?: string; // e.g., "Muy insatisfecho"
  maxLabel?: string; // e.g., "Muy satisfecho"
}

export interface YesNoQuestion extends BaseQuestion {
  type: 'yes_no';
}

export interface TextQuestion extends BaseQuestion {
  type: 'text';
  multiline: boolean;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: string[];
  allowMultiple: boolean; // true = checkbox, false = radio
}

export type SurveyQuestion =
  | ScaleQuestion
  | YesNoQuestion
  | TextQuestion
  | MultipleChoiceQuestion;

// Response types for each question type
export interface ScaleResponse {
  questionId: string;
  type: 'scale';
  value: number;
}

export interface YesNoResponse {
  questionId: string;
  type: 'yes_no';
  value: boolean;
}

export interface TextResponse {
  questionId: string;
  type: 'text';
  value: string;
}

export interface MultipleChoiceResponse {
  questionId: string;
  type: 'multiple_choice';
  value: string | string[]; // single or multiple selections
}

export type QuestionResponse =
  | ScaleResponse
  | YesNoResponse
  | TextResponse
  | MultipleChoiceResponse;

export interface SurveyResponseData {
  id: string;
  surveyId: string;
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  responses: QuestionResponse[];
  comments?: string;
  createdAt: Date;
}

export interface Survey {
  id: string;
  surveyNumber: string;
  title: string;
  type: SurveyType;
  status: SurveyStatus;

  // Fixed questions (cannot be edited for now)
  questions: SurveyQuestion[];

  // Responses
  responseCount: number;
  averageRating?: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  createdByName: string;

  // For post-delivery surveys
  relatedOrderId?: string;
  relatedOrderNumber?: string;

  // Findings generated from this survey
  findingIds?: string[];
}

export interface SurveyFormData {
  title: string;
  type: SurveyType;
  relatedOrderId?: string;
  relatedOrderNumber?: string;
}

export interface SurveyResponseFormData {
  clientName: string;
  clientEmail?: string;
  responses: QuestionResponse[];
  comments?: string;
}

// Fixed questions for customer satisfaction surveys
export const CUSTOMER_SATISFACTION_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'q1',
    type: 'scale',
    question:
      '¿Qué tan satisfecho está con la calidad de nuestros productos/servicios?',
    order: 1,
    required: true,
    minValue: 1,
    maxValue: 5,
    minLabel: 'Muy insatisfecho',
    maxLabel: 'Muy satisfecho',
  } as ScaleQuestion,
  {
    id: 'q2',
    type: 'scale',
    question: '¿Cómo califica el tiempo de entrega?',
    order: 2,
    required: true,
    minValue: 1,
    maxValue: 5,
    minLabel: 'Muy lento',
    maxLabel: 'Muy rápido',
  } as ScaleQuestion,
  {
    id: 'q3',
    type: 'multiple_choice',
    question: '¿Qué aspectos de nuestro servicio considera más importantes?',
    order: 3,
    required: true,
    options: [
      'Calidad del producto',
      'Precio competitivo',
      'Tiempo de entrega',
      'Atención al cliente',
      'Garantía y soporte',
    ],
    allowMultiple: true,
  } as MultipleChoiceQuestion,
  {
    id: 'q4',
    type: 'yes_no',
    question: '¿Recomendaría nuestros productos/servicios a otros?',
    order: 4,
    required: true,
  } as YesNoQuestion,
  {
    id: 'q5',
    type: 'scale',
    question: '¿Qué tan satisfecho está con la atención al cliente?',
    order: 5,
    required: true,
    minValue: 1,
    maxValue: 5,
    minLabel: 'Muy insatisfecho',
    maxLabel: 'Muy satisfecho',
  } as ScaleQuestion,
  {
    id: 'q6',
    type: 'text',
    question: '¿Qué podríamos mejorar en nuestros productos o servicios?',
    order: 6,
    required: false,
    multiline: true,
  } as TextQuestion,
  {
    id: 'q7',
    type: 'multiple_choice',
    question: '¿Cómo conoció nuestros productos/servicios?',
    order: 7,
    required: false,
    options: [
      'Recomendación de conocido',
      'Búsqueda en internet',
      'Redes sociales',
      'Publicidad',
      'Otro',
    ],
    allowMultiple: false,
  } as MultipleChoiceQuestion,
];

// Labels and configurations
export const SURVEY_TYPE_LABELS: Record<SurveyType, string> = {
  anual: 'Encuesta Anual',
  post_entrega: 'Post-Entrega',
};

export const SURVEY_STATUS_LABELS: Record<SurveyStatus, string> = {
  draft: 'Borrador',
  active: 'Activa',
  completed: 'Completada',
};

export const SURVEY_STATUS_COLORS: Record<SurveyStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  scale: 'Escala',
  yes_no: 'Sí/No',
  text: 'Texto',
  multiple_choice: 'Opción Múltiple',
};
