import { z } from 'zod';

/**
 * Esquema de validación para la creación de acciones y tareas
 */
export const TaskCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es obligatorio')
    .max(250, 'El título no puede superar los 250 caracteres'),
  dueDate: z
    .string()
    .min(1, 'La fecha límite es obligatoria')
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: 'La fecha límite proporcionada no es válida',
    })
    .transform((val) => new Date(val)),
  description: z.string().optional().nullable(),
  districtId: z.string().optional().nullable(),
  priorityId: z.string().optional().nullable(),
  competitorPartyId: z.string().optional().nullable(),
  type: z
    .enum(['TASK', 'EVENT', 'VISIT', 'MEETING', 'MEDIA', 'STREET'])
    .default('TASK'),
  targetAudience: z.string().optional().nullable(),
  keyMessage: z.string().optional().nullable(),
});

/**
 * Esquema de validación para la actualización de estado de una tarea
 */
export const TaskUpdateStatusSchema = z.object({
  id: z.string().min(1, 'El ID de la tarea es obligatorio'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'], {
    message: 'Estado de tarea no válido (debe ser PENDING, IN_PROGRESS, BLOCKED o COMPLETED)',
  }),
});

/**
 * Esquema de validación para la clasificación estratégica de distritos
 */
export const DistrictClassificationSchema = z.object({
  districtId: z.string().min(1, 'El ID del distrito es obligatorio'),
  classification: z.enum(
    [
      'FORTALEZA',
      'CRECIMIENTO',
      'DEFENSA',
      'OPORTUNIDAD',
      'COMPETENCIA_ABIERTA',
      'BAJA_PARTICIPACION',
      'PRIORIDAD_TERRITORIAL',
    ],
    {
      message: 'Clasificación estratégica no válida',
    }
  ),
});

/**
 * Esquema para solicitud de restablecimiento de contraseña
 */
export const ResetPasswordRequestSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es obligatorio')
    .email('El formato del correo electrónico no es válido')
    .transform((val) => val.trim().toLowerCase()),
});

/**
 * Esquema para confirmación y actualización de nueva contraseña
 */
export const ResetPasswordConfirmSchema = z.object({
  token: z.string().min(1, 'El token de recuperación es obligatorio'),
  newPassword: z
    .string()
    .min(8, 'La nueva contraseña debe tener como mínimo 8 caracteres')
    .max(128, 'La contraseña excede la longitud máxima permitida'),
});

/**
 * Esquema de validación para creación de campaña municipal
 */
export const CampaignCreateSchema = z.object({
  municipality: z.string().min(1, 'El nombre del municipio es obligatorio'),
  candidacyName: z.string().min(1, 'El nombre de la candidatura es obligatorio'),
  partyOrCoalition: z.string().min(1, 'El partido o coalición es obligatorio'),
  politicalGoal: z.enum(
    ['GANAR', 'GOBERNAR', 'REPRESENTACION', 'FORMAR_GOBIERNO', 'POSICIONAMIENTO'],
    {
      message: 'Objetivo político no válido',
    }
  ),
  electionDate: z
    .string()
    .refine((val) => !isNaN(new Date(val).getTime()), { message: 'Fecha electoral no válida' })
    .transform((val) => new Date(val)),
  teamDescription: z.string().optional().nullable(),
  availableResources: z.string().optional().nullable(),
  mainAdversaries: z.string().optional().nullable(),
  strengths: z.string().optional().nullable(),
  weaknesses: z.string().optional().nullable(),
  risks: z.string().optional().nullable(),
});
