import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { FaEnvelope, FaSearch } from 'react-icons/fa'
import { FiMail, FiUser } from 'react-icons/fi'
import { GrDocumentText } from 'react-icons/gr'
import { IoMdAdd } from 'react-icons/io'
import { LuUsers } from 'react-icons/lu'
import { MdDateRange, MdOutlineDone } from 'react-icons/md'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import useTemplateManagement from '@/hooks/useTemplateManagement'
import ContentLayout from '@/layouts/ContentLayout'
import {
  BulkSendDocument,
  BulkSendDocumentStatus,
  DocumentTemplateType,
  getDocumentColorByStatus,
} from '@/types/templateManagement'

import RecipientsList from './RecipientsList'

const BulkSendDocuments = () => {
  const { t } = useTranslation()

  const { useGetBulkSendDocuments } = useTemplateManagement()
  const { data: campaigns = [] } = useGetBulkSendDocuments()

  const navigate = useNavigate()

  const totalRecipients = campaigns.reduce((sum, c) => sum + c.recipients, 0)

  const [fixCampaigns, setFixCampaigns] = useState<BulkSendDocument[]>([])
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all',
  })

  useEffect(() => {
    let filteredCampaigns = campaigns

    if (filters.status !== 'all') {
      filteredCampaigns = filteredCampaigns.filter(
        c => c.status === filters.status
      )
    }

    if (filters.type !== 'all') {
      filteredCampaigns = filteredCampaigns.filter(
        c => c.document?.type === filters.type
      )
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredCampaigns = filteredCampaigns.filter(
        c =>
          c.title.toLowerCase().includes(searchLower) ||
          c.document?.type.toLowerCase().includes(searchLower) ||
          c.user.fullName.toLowerCase().includes(searchLower)
      )
    }

    setFixCampaigns(filteredCampaigns)
  }, [campaigns, filters])

  return (
    <ContentLayout
      leftHeader={
        <div>
          <h1 className="text-xl font-bold">
            {t('component:menubar.bulkSendDocuments')}
          </h1>
        </div>
      }
      rightHeader={
        <div className="flex gap-2 mt-2">
          <Button
            iconBefore={<IoMdAdd />}
            onClick={() => navigate('/bulk-send-documents/select')}
          >
            {t('templateManagement:buttons.select')}
          </Button>
        </div>
      }
    >
      <div className="p-6 space-y-6 w-full">
        <div className="flex items-center gap-4 w-full">
          <div className="bg-white rounded-xl border border-background-layer-3 p-4 flex items-center gap-4 w-full justify-between">
            <div>
              <div className="text-gray-500 text-sm">Total Campaigns</div>
              <div className="text-xl font-semibold">{campaigns.length}</div>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiMail className="text-primary-subtle text-xl" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-background-layer-3 p-4 flex items-center gap-4 w-full justify-between">
            <div>
              <div className="text-gray-500 text-sm">Total Recipients</div>
              <div className="text-xl font-semibold">{totalRecipients}</div>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <LuUsers className="text-green-500 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-background-layer-3 p-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                className="w-full pl-10 pr-4 py-2 border rounded-md"
                placeholder="Search campaigns, document types, or senders..."
                prefixIcon={<FaSearch className="w-[15px] mb-[2px]" />}
                onChange={e =>
                  setFilters(prev => ({ ...prev, search: e.target.value }))
                }
              />
            </div>
            <Select
              onValueChange={value =>
                setFilters(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-24 sm:w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.values(BulkSendDocumentStatus).map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={value =>
                setFilters(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger className="w-24 sm:w-32">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.values(DocumentTemplateType).map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-background-layer-3 p-4">
          <div className="space-y-4">
            {fixCampaigns.length === 0 && (
              <div className="text-center text-gray-500 py-10">
                <FaEnvelope className="mx-auto text-3xl mb-3" />
                <p className="font-medium">
                  No campaigns found matching the filters
                </p>
              </div>
            )}
            {fixCampaigns.map((c, i) => (
              <div
                key={i}
                className="border p-4 rounded-md border-background-layer-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-blue-500 text-xl" />
                  <div>
                    <div className="font-medium text-sm">{c.title}</div>
                    <div className="text-gray-500 text-xs flex gap-4">
                      <div className="flex items-center gap-1">
                        <GrDocumentText />
                        <span className="capitalize">{c.document?.type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MdDateRange />
                        <span>{dayjs(c.createdAt).format('YYYY/MM/DD')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiUser />
                        <span>{c.user?.fullName}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">
                    {c.recipients} Recipients
                  </span>
                  <span
                    className={[
                      'text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 capitalize',
                      getDocumentColorByStatus(c.status),
                    ].join(' ')}
                  >
                    {c.status}
                  </span>

                  <RecipientsList campaign={c} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ContentLayout>
  )
}

export default BulkSendDocuments
