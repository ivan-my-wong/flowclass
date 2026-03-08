import { z } from 'zod'

import i18n from '@/i18n'
import { TypeSupported } from '@/types/class-material'

export const materialItemSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(TypeSupported.DOCUMENT),
    file: z.instanceof(File).optional(),
    fileName: z.string().optional(),
    fileSize: z.number().optional(),
    description: z.string().optional(),
    expiryDate: z.date().nullable().optional(),
  }),
  z.object({
    type: z.literal(TypeSupported.LINK),
    fileType: z.string().nullable().optional(),
    fileSize: z.number().optional(),
    fileName: z
      .string()
      .min(
        1,
        i18n.t('material:uploadMaterials.form.materialNameRequired') as string
      ),
    description: z.string().optional(),
    link: z
      .string()
      .url(i18n.t('material:uploadMaterials.form.invalidUrl') as string),
    expiryDate: z.date().nullable().optional(),
  }),
])

export const materialFormSchema = z.object({
  selectedCourse: z
    .object({
      value: z.number(),
      label: z.string(),
      course: z.string(),
      courseId: z.number(),
      previewImageUrl: z.null(),
    })
    .optional(),
  selectedLesson: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .optional()
    .refine(val => val !== undefined, {
      message: i18n.t(
        'material:uploadMaterials.form.pleaseSelectLesson'
      ) as string,
    }),
  materials: z
    .array(materialItemSchema)
    .min(
      1,
      i18n.t(
        'material:uploadMaterials.form.pleaseAddAtLeastOneMaterial'
      ) as string
    ),
})

export type MaterialFormData = z.infer<typeof materialFormSchema>
export type MaterialItemData = z.infer<typeof materialItemSchema>
