import { useMemo, useState } from 'react'

import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  FiExternalLink as ExternalLink,
  FiPhone as Phone,
  FiSend as Send,
  FiSettings as Settings,
} from 'react-icons/fi'
import {
  IoCheckmarkCircle as CheckCircle2,
  IoLogoWhatsapp as MessageCircle,
  IoSparkles as Sparkles,
} from 'react-icons/io5'
import { LuRefreshCw as RefreshCw } from 'react-icons/lu'
import { useMutation, useQuery } from 'react-query'
import { toast } from 'sonner'

import { sendWtsTestMessage } from '@/api/admin'
import { ApiError, handleApiError } from '@/api/errors/apiError'
import { getListWhatsappTemplates } from '@/api/whatsappTemplate'
import AlertBox from '@/components/Boxes/AlertBox'
import MetaEmbeddedSignupModal from '@/components/Modals/MetaEmbeddedSignupModal'
import PhoneNumberInput from '@/components/PhoneNumberInput/PhoneNumberInput'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import Form, {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { TextArea } from '@/components/ui/TextArea'
import { STALE_TIME } from '@/constants/common'
import { QUERY_KEY } from '@/constants/queryKey'
import useMetaEmbeddedSignup from '@/hooks/useMetaEmbeddedSignup'
import useSchoolData from '@/hooks/useSchoolData'
import ContentLayout from '@/layouts/ContentLayout'
import { WhatsappMessageType } from '@/types/whatsappMessage'
import { WhatsappTemplateStatus } from '@/types/whatsappTemplate'

const getCheckpointBadgeVariant = (
  status: string
): 'success' | 'warning' | 'destructive' => {
  if (status === 'completed') return 'success'
  if (status === 'in_progress') return 'warning'
  return 'destructive'
}

export const WhatsappSetting = (): JSX.Element => {
  const { t } = useTranslation()
  const { schoolData } = useSchoolData()
  const currentInstitutionId = schoolData.currentSchool?.id || 0

  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'settings' | 'test' | 'profile'>(
    'settings'
  )

  const {
    useGetEmbeddedSignup,
    useGetCoexistenceSyncStatus,
    useTriggerCoexistenceSync,
    useGetWhatsAppProfile,
    useUpdateWhatsAppProfile,
  } = useMetaEmbeddedSignup()

  const signupQuery = useGetEmbeddedSignup()
  const syncStatusQuery = useGetCoexistenceSyncStatus()
  const triggerSyncMutation = useTriggerCoexistenceSync()
  const profileQuery = useGetWhatsAppProfile()
  const updateProfileMutation = useUpdateWhatsAppProfile()

  const signup = signupQuery.data
  const isConnected =
    signup?.status?.toLowerCase() === 'connected' ||
    signup?.status?.toLowerCase() === 'completed'

  const { data: whatsappTemplates } = useQuery({
    queryKey: [
      QUERY_KEY.whatsappTemplate.whatsappTemplatesKey,
      currentInstitutionId,
    ],
    queryFn: () => getListWhatsappTemplates(currentInstitutionId),
    staleTime: STALE_TIME,
    enabled: !!currentInstitutionId,
  })

  const testForm = useForm<WhatsappMessageType>({
    defaultValues: {
      siteId: 0,
      institutionId: currentInstitutionId,
      studentPhone: '',
      templateId: '',
      variables: {},
    },
  })

  const profileForm = useForm({
    defaultValues: {
      about: profileQuery.data?.about || '',
      address: profileQuery.data?.address || '',
      description: profileQuery.data?.description || '',
      email: profileQuery.data?.email || '',
      websites: (profileQuery.data?.websites || []).join(', '),
      vertical: profileQuery.data?.vertical || '',
    },
  })

  const {
    mutateAsync: mutateSendTestMessage,
    isLoading: isLoadingSendTestMessage,
  } = useMutation({
    mutationFn: (data: WhatsappMessageType) => sendWtsTestMessage(data),
    onSuccess: () => {
      toast.success(
        t(
          'setting:whatsappSetting.sendTestMsgSuccess',
          'Test message sent successfully!'
        )
      )
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  const sendTestMessage: SubmitHandler<WhatsappMessageType> = async data => {
    await mutateSendTestMessage({
      ...data,
      institutionId: currentInstitutionId,
    })
  }

  const handleUpdateProfile = async (values: any) => {
    const websites = values.websites
      ? values.websites
          .split(',')
          .map((w: string) => w.trim())
          .filter(Boolean)
      : []
    await updateProfileMutation.mutateAsync({
      about: values.about,
      address: values.address,
      description: values.description,
      email: values.email,
      websites,
      vertical: values.vertical,
    })
  }

  const selectedTemplateId = testForm.watch('templateId')
  const selectedTemplate = useMemo(() => {
    return whatsappTemplates?.content?.find(t => t.id === +selectedTemplateId)
  }, [selectedTemplateId, whatsappTemplates?.content])

  return (
    <ContentLayout
      headerBackButton={{
        title: t('integration:title', 'Integrations'),
        mode: 'add',
      }}
    >
      <div className="w-full max-w-5xl mx-auto p-4 space-y-6">
        <AlertBox
          content="Official WhatsApp Business Cloud API provides direct Meta-verified messaging for transactional notifications, attendance alerts, and payment reminders."
          actionText="Manage WhatsApp Templates"
          actionLink="/custom-messages?tab=whatsapp-templates"
        />

        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Connection
            </TabsTrigger>
            <TabsTrigger value="test">
              <Send className="w-4 h-4 mr-2" />
              Send Test Message
            </TabsTrigger>
            <TabsTrigger value="profile">
              <MessageCircle className="w-4 h-4 mr-2" />
              Business Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <MessageCircle className="h-6 w-6 text-emerald-600" />
                      Meta WhatsApp Business Cloud API
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Official Meta integration with embedded onboarding and
                      phone coexistence support.
                    </CardDescription>
                  </div>
                  <Badge
                    variant={isConnected ? 'success' : 'warning'}
                    className="text-xs px-2.5 py-1"
                  >
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {isConnected ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        WhatsApp Business Account Active
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
                        <div className="p-3 bg-white rounded-lg border">
                          <span className="text-gray-500 block mb-1">
                            Display Phone Number
                          </span>
                          <span className="font-semibold text-sm text-gray-900">
                            {signup?.displayPhoneNumber ||
                              schoolData.currentSchool?.phone ||
                              '-'}
                          </span>
                        </div>
                        <div className="p-3 bg-white rounded-lg border">
                          <span className="text-gray-500 block mb-1">
                            WhatsApp Business Account (WABA) ID
                          </span>
                          <span className="font-mono text-sm text-gray-900">
                            {signup?.wabaId || '-'}
                          </span>
                        </div>
                        <div className="p-3 bg-white rounded-lg border">
                          <span className="text-gray-500 block mb-1">
                            Phone Number ID
                          </span>
                          <span className="font-mono text-sm text-gray-900">
                            {signup?.phoneNumberId || '-'}
                          </span>
                        </div>
                        <div className="p-3 bg-white rounded-lg border">
                          <span className="text-gray-500 block mb-1">
                            Coexistence Mode
                          </span>
                          <span className="text-sm font-medium">
                            {signup?.isCoexistence ? (
                              <Badge variant="secondary">
                                Active (Business App Coexistence)
                              </Badge>
                            ) : (
                              'Standard Cloud API'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {signup?.isCoexistence && (
                      <div className="rounded-xl border p-4 bg-gray-50/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-sm text-gray-900">
                              Coexistence Sync Checkpoints
                            </h4>
                            <p className="text-xs text-gray-500">
                              Synchronize contact and message history between
                              your phone and Cloud API.
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            loading={triggerSyncMutation.isLoading}
                            onClick={() => triggerSyncMutation.mutate()}
                          >
                            <RefreshCw className="mr-2 h-3.5 w-3.5" />
                            Trigger Sync
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                          {syncStatusQuery.data?.checkpoints?.map(
                            checkpoint => (
                              <div
                                key={checkpoint.id}
                                className="p-2.5 bg-white rounded-lg border space-y-1"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium capitalize">
                                    {checkpoint.syncType.replace(/_/g, ' ')}
                                  </span>
                                  <Badge
                                    variant={getCheckpointBadgeVariant(
                                      checkpoint.status
                                    )}
                                    className="text-[10px]"
                                  >
                                    {checkpoint.status}
                                  </Badge>
                                </div>
                                <span className="text-gray-500 block">
                                  Items: {checkpoint.processedItems}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        Connect your WhatsApp Business Account
                      </h3>
                      <p className="text-sm text-gray-500 max-w-md mx-auto">
                        Automate WhatsApp notifications for attendance,
                        invoices, and enrollments using Meta Cloud API.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsSignupModalOpen(true)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {isConnected
                    ? 'Reconnect / Manage Meta Account'
                    : 'Connect WhatsApp Business'}
                </Button>
                <a
                  href="https://business.facebook.com/wa/manage/home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  Meta WhatsApp Manager <ExternalLink className="h-3 w-3" />
                </a>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="test">
            <Card>
              <CardHeader>
                <CardTitle>Send WhatsApp Test Message</CardTitle>
                <CardDescription>
                  Verify your Meta WhatsApp Cloud API credentials by sending a
                  test message.
                </CardDescription>
              </CardHeader>
              <Form {...testForm}>
                <form onSubmit={testForm.handleSubmit(sendTestMessage)}>
                  <CardContent className="space-y-4">
                    <FormField
                      name="studentPhone"
                      control={testForm.control}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel className="font-semibold">
                            Recipient Phone Number
                          </FormLabel>
                          <FormControl>
                            <PhoneNumberInput
                              country="hk"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="templateId"
                      control={testForm.control}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel className="font-semibold">
                            Select WhatsApp Template
                          </FormLabel>
                          <FormControl>
                            <Select {...field} onValueChange={field.onChange}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose an approved template" />
                              </SelectTrigger>
                              <SelectContent>
                                {whatsappTemplates?.content?.map(item => (
                                  <SelectItem
                                    key={item.id}
                                    value={item.id?.toString() || ''}
                                  >
                                    <Badge
                                      variant={
                                        item.status ===
                                        WhatsappTemplateStatus.APPROVED
                                          ? 'success'
                                          : 'warning'
                                      }
                                      className="mr-2"
                                    >
                                      {item.status}
                                    </Badge>
                                    {t(item.name)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {selectedTemplate &&
                      selectedTemplate.variables &&
                      Object.keys(selectedTemplate.variables).length > 0 && (
                        <div className="space-y-2 pt-2 border-t">
                          <h4 className="font-semibold text-sm">
                            Template Variables
                          </h4>
                          {Object.keys(selectedTemplate.variables).map(key => (
                            <FormField
                              key={key}
                              name={`variables.${key}`}
                              control={testForm.control}
                              render={({ field }) => (
                                <FormItem className="flex items-center gap-4">
                                  <FormLabel className="w-48 font-medium text-xs">
                                    {`{{${key}}}`}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder={`Value for ${key}`}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      )}
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button
                      type="submit"
                      loading={isLoadingSendTestMessage}
                      disabled={!selectedTemplate || isLoadingSendTestMessage}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Send Test Message
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Business Profile</CardTitle>
                <CardDescription>
                  Configure your public profile shown to WhatsApp users.
                </CardDescription>
              </CardHeader>
              <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <FormLabel className="text-sm font-semibold">
                      About / Tagline
                    </FormLabel>
                    <Input
                      {...profileForm.register('about')}
                      placeholder="e.g. Empowering students with quality education"
                    />
                  </div>
                  <div className="space-y-2">
                    <FormLabel className="text-sm font-semibold">
                      Address
                    </FormLabel>
                    <Input
                      {...profileForm.register('address')}
                      placeholder="e.g. 123 Education Way, Hong Kong"
                    />
                  </div>
                  <div className="space-y-2">
                    <FormLabel className="text-sm font-semibold">
                      Description
                    </FormLabel>
                    <TextArea
                      {...profileForm.register('description')}
                      rows={4}
                      placeholder="Detailed business description..."
                    />
                  </div>
                  <div className="space-y-2">
                    <FormLabel className="text-sm font-semibold">
                      Email
                    </FormLabel>
                    <Input
                      {...profileForm.register('email')}
                      type="email"
                      placeholder="contact@school.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <FormLabel className="text-sm font-semibold">
                      Websites (comma separated)
                    </FormLabel>
                    <Input
                      {...profileForm.register('websites')}
                      placeholder="https://example.com, https://portal.example.com"
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button
                    type="submit"
                    loading={updateProfileMutation.isLoading}
                    disabled={updateProfileMutation.isLoading}
                  >
                    Save Profile
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <MetaEmbeddedSignupModal
          open={isSignupModalOpen}
          onOpenChange={setIsSignupModalOpen}
        />
      </div>
    </ContentLayout>
  )
}

export default WhatsappSetting
