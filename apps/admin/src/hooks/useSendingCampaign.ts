/* eslint-disable prettier/prettier */
import { useQueryClient } from 'react-query'
import { useRecoilState } from 'recoil'

import { API_BASE_URL } from '@/lib/config'
import { sendingInvoiceCampaignState } from '@/stores/studentInvoice.store'
import { SendingCampaignStatus, SendingInvoiceCampaignState, SendingInvoiceData, SendingProcessPhase } from '@/types/studentInvoice.type'
import { InvoiceCampaign } from '@/types/templateManagement'

import useSchoolData from './useSchoolData'

export const useSendingCampaign = () => {
    const queryClient = useQueryClient()
    const { currentSchool } = useSchoolData()
    const [sendingInvoiceCampaign, setSendingInvoiceCampaign] = useRecoilState(
        sendingInvoiceCampaignState
    )
    const startEvent = (invoiceCampaign: InvoiceCampaign) => {
        const eventSource = new EventSource(
            `${API_BASE_URL}/stream/${invoiceCampaign.jobId}`
        )
        eventSource.onerror = () => {
            eventSource.close()
            setSendingInvoiceCampaign(prev => ({
                ...(prev || {}),
                currentPhase: SendingProcessPhase.FAILED,
                processingData: null,
                eventSource: null,
            }))
        }
        eventSource.onmessage = event => {
            const { data } = JSON.parse(event.data)
            const { data: payload, step: phase } = JSON.parse(data) as {
                data: SendingInvoiceData
                step: SendingProcessPhase
            }
            // const { step: phase, data: payload } = data;
            if (phase === SendingProcessPhase.COMPLETE) {
                eventSource.close()
                setSendingInvoiceCampaign(prev => ({
                    ...prev,
                    currentPhase: phase,
                    processingData: null,
                    eventSource: null,
                }))
                queryClient.invalidateQueries({
                    queryKey: ['invoiceCampaigns', currentSchool?.id, invoiceCampaign.id],
                })
                return
            }
            setSendingInvoiceCampaign(prev => {
                return {
                    ...(prev || {}),
                    data: payload,
                    currentPhase: phase || prev?.currentPhase,
                    processingData: payload,
                    eventSource:
                        payload.status === SendingCampaignStatus.SENT ? null : eventSource,
                } as unknown as SendingInvoiceCampaignState
            })
        }
    }
    return {
        sendingInvoiceCampaign,
        setSendingInvoiceCampaign,
        startEvent,
        isEventActive: sendingInvoiceCampaign?.eventSource !== null,
    }
}
