import { useEffect, useState } from 'react'

import { t } from 'i18next'
import { MdEmail, MdPhone } from 'react-icons/md'

import Heading from '@/components/Texts/Heading'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog'
import ShadowBox from '@/components/ui/ShadowBox'
import Text from '@/components/ui/Text'
import useSchoolData from '@/hooks/useSchoolData'
import { StudentPrimaryIdentifier } from '@/types/school'

const SetPrimaryIdentifier = () => {
  const { currentSchool, useUpdateSchool } = useSchoolData()
  const updateSchool = useUpdateSchool(currentSchool?.id || 0)

  // Local state for instant UI feedback
  const [selectedIdentifier, setSelectedIdentifier] = useState(
    currentSchool?.studentPrimaryIdentifier || StudentPrimaryIdentifier.PHONE
  )

  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    setSelectedIdentifier(
      currentSchool?.studentPrimaryIdentifier || StudentPrimaryIdentifier.PHONE
    )
  }, [currentSchool?.studentPrimaryIdentifier])

  const handleConfirm = () => {
    updateSchool.mutate({
      studentPrimaryIdentifier: selectedIdentifier,
    })
    setShowConfirm(false)
  }

  return (
    <>
      <ShadowBox className="box-responsive-full gap-4 items-start md:items-center border rounded-lg p-4">
        <div className="box-col-full gap-2 items-start">
          <Heading>{t('setting:studentPortal.primaryIdentifier')}</Heading>
          <p className="text-sm">
            {t('setting:studentPortal.choosePrimaryIdentifier')}
          </p>
        </div>

        <div className="flex gap-4 justify-start">
          <Button
            variant={
              selectedIdentifier === StudentPrimaryIdentifier.EMAIL
                ? 'default'
                : 'outline'
            }
            onClick={() => {
              if (selectedIdentifier !== StudentPrimaryIdentifier.EMAIL) {
                setSelectedIdentifier(StudentPrimaryIdentifier.EMAIL)
                setShowConfirm(true)
              }
            }}
          >
            <MdEmail size={24} />
            {t('setting:studentPortal.identifierEmail')}
          </Button>
          <Button
            variant={
              selectedIdentifier === StudentPrimaryIdentifier.PHONE
                ? 'default'
                : 'outline'
            }
            onClick={() => {
              if (selectedIdentifier !== StudentPrimaryIdentifier.PHONE) {
                setSelectedIdentifier(StudentPrimaryIdentifier.PHONE)
                setShowConfirm(true)
              }
            }}
          >
            <MdPhone size={24} />
            {t('setting:studentPortal.identifierPhone')}
          </Button>
        </div>
      </ShadowBox>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="p-8">
          <DialogTitle>
            {t('setting:studentPortal.confirmChangeTitle')}
          </DialogTitle>
          <Text>{t('setting:studentPortal.description')}</Text>
          <Text>{t('setting:studentPortal.note')}</Text>
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirm(false)
                setSelectedIdentifier(
                  currentSchool?.studentPrimaryIdentifier ||
                    StudentPrimaryIdentifier.PHONE
                )
              }}
            >
              {t('common:action.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleConfirm}>
              {t('common:action.confirm', 'Confirm')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SetPrimaryIdentifier
