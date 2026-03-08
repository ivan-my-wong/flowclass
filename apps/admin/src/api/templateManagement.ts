import { UserAlias } from '@/types/studentMemo'
import {
  BulkSendDocument,
  DocumentTemplate,
  DocumentTemplateType,
  FieldDocumentTemplate,
  RecipientCampaign,
} from '@/types/templateManagement'

import apiClient from '.'

export const getDocumentTemplates = async (
  institutionId: number,
  type?: DocumentTemplateType.CERTIFICATE
): Promise<DocumentTemplate[]> => {
  return apiClient
    .get({
      url: `/admin/template-management/document-templates`,
      params: { institutionId, type },
      needAuth: true,
    })
    .then(res => res.data?.data)
}

export const getDocumentTemplateById = async (
  templateId: number,
  institutionId: number
): Promise<DocumentTemplate | null> => {
  return apiClient
    .get({
      url: `/admin/template-management/document-templates/${templateId}`,
      params: { institutionId },
      needAuth: true,
    })
    .then(res => res.data?.data)
}

export const createDocumentTemplate = async (
  template: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>
): Promise<DocumentTemplate> => {
  return apiClient
    .post({
      url: `/admin/template-management/document-templates`,
      data: template,
      params: { institutionId: template.institutionId },
      needAuth: true,
    })
    .then(res => res.data?.data)
}

export const updateDocumentTemplate = async ({
  id,
  institutionId,
  ...template
}: Partial<DocumentTemplate> & {
  id: number
}): Promise<DocumentTemplate | null> => {
  return apiClient
    .put({
      url: `/admin/template-management/document-templates/${id}`,
      data: template,
      params: { institutionId },
      needAuth: true,
    })
    .then(res => res.data?.data)
}

export const deleteDocumentTemplate = async (
  templateId: number,
  institutionId: number
): Promise<boolean> => {
  return apiClient
    .delete({
      url: `/admin/template-management/document-templates/${templateId}`,
      params: { institutionId },
      needAuth: true,
    })
    .then(res => res.status === 204)
}

export const getFieldsTemplate = (
  institutionId: number
): FieldDocumentTemplate[] => {
  return [
    {
      id: 1,
      institutionId,
      name: 'Student Name',
      field: 'studentName',
      required: true,
      example: 'John Doe',
    },
    {
      id: 2,
      institutionId,
      name: 'Course Name',
      field: 'courseName',
      required: false,
      example: 'Web Development',
    },
    {
      id: 3,
      institutionId,
      name: 'Class Name',
      field: 'className',
      required: false,
      example: 'Introduction to React',
    },
    {
      id: 4,
      institutionId,
      name: "Today's Date",
      field: 'todayDate',
      required: false,
      example: '2023-10-01',
    },
  ]
}

export const getBulkSendDocuments = async (
  institutionId: number
): Promise<BulkSendDocument[]> => {
  return apiClient
    .get({
      url: `/admin/template-management/document-campaign`,
      params: { institutionId },
      needAuth: true,
    })
    .then(res => res.data?.data)
}

export const getBulkSendDocumentById = async (
  campaignId: number,
  institutionId: number
): Promise<BulkSendDocument | null> => {
  return apiClient
    .get({
      url: `/admin/template-management/document-campaign/${campaignId}`,
      params: { institutionId },
      needAuth: true,
    })
    .then(res => res.data?.data)
}

export const createBulkSendDocument = async (
  data: Omit<
    BulkSendDocument,
    'id' | 'createdAt' | 'updatedAt' | 'user' | 'userId'
  >
): Promise<BulkSendDocument> => {
  return apiClient
    .post({
      url: `/admin/template-management/document-campaign`,
      data,
      params: { institutionId: data.institutionId },
      needAuth: true,
    })
    .then(res => res.data?.data)
}

export const getRecipientsListCampaign = async (
  institutionId: number,
  campaignId: number
): Promise<RecipientCampaign[]> => {
  return apiClient
    .get({
      url: `/admin/template-management/document-campaign-recipients`,
      params: { institutionId, campaignId },
      needAuth: true,
    })
    .then(res => res.data?.data)
}

export const resendDocumentCampaign = async (
  institutionId: number,
  recipientId: number
): Promise<{ student: UserAlias; error: string | null }> => {
  return apiClient
    .post({
      url: `/admin/template-management/document-campaign-recipients/resend/${recipientId}`,
      params: { institutionId },
      data: {},
      needAuth: true,
    })
    .then(res => res.data?.data)
}
