import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import AlertBox from '@/components/Boxes/AlertBox'
import { Switch } from '@/components/ui/Switch'
import useCourseData from '@/hooks/useCourseData'
import { useCourseEditSave } from '@/hooks/useCourseEditSave'

const PrivacySettings = forwardRef<any, any>((props, ref): JSX.Element => {
  const { t } = useTranslation()
  const { currentCourse } = useCourseEditSave()
  const { useUpdateCourseSettings } = useCourseData()
  const { mutateAsync, isLoading } = useUpdateCourseSettings()

  const [isPrivate, setIsPrivate] = useState(!!currentCourse?.isPrivate)
  const [isEmailVerification, setIsEmailVerification] = useState(
    !!currentCourse?.requireEmailVerification
  )
  const [blockDuplicateEmailEnrollment, setBlockDuplicateEmailEnrollment] =
    useState(!!currentCourse?.blockDuplicateEmailEnrollment)

  useEffect(() => {
    setIsPrivate(!!currentCourse?.isPrivate)
    setIsEmailVerification(!!currentCourse?.requireEmailVerification)
    setBlockDuplicateEmailEnrollment(
      !!currentCourse?.blockDuplicateEmailEnrollment
    )
  }, [
    currentCourse?.isPrivate,
    currentCourse?.requireEmailVerification,
    currentCourse?.blockDuplicateEmailEnrollment,
  ])

  const updateSetting = async <
    K extends
      | 'isPrivate'
      | 'requireEmailVerification'
      | 'blockDuplicateEmailEnrollment'
  >(
    key: K,
    value: boolean,
    revert: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!currentCourse) return
    try {
      await mutateAsync({ courseId: currentCourse.id, [key]: value })
    } catch {
      revert(prev => !prev)
      toast.error(t('teachingService:privacySettings.updateError'))
    }
  }

  useImperativeHandle(ref, () => ({
    submitForm: () => updateSetting('isPrivate', !isPrivate, setIsPrivate),
    submitFormEmailVerification: () =>
      updateSetting(
        'requireEmailVerification',
        !isEmailVerification,
        setIsEmailVerification
      ),
    submitFormBlockDuplicateEmailEnrollment: () =>
      updateSetting(
        'blockDuplicateEmailEnrollment',
        !blockDuplicateEmailEnrollment,
        setBlockDuplicateEmailEnrollment
      ),
  }))

  return (
    <div className="box-col-full gap-4">
      <AlertBox
        content={t(
          'teachingService:privacySettings.description',
          'Set this course as private. Only users with permission can view it.'
        )}
      />
      <div className="box-row-full justify-between">
        <span>
          {t('teachingService:privacySettings.privateLabel', 'Private')}
        </span>
        <Switch
          checked={isPrivate}
          onCheckedChange={() => {
            setIsPrivate(!isPrivate)
            updateSetting('isPrivate', !isPrivate, setIsPrivate)
          }}
          disabled={isLoading}
        />
      </div>
      <div className="box-row-full justify-between">
        <span>
          {t(
            'teachingService:updateEmailVerification.needEmailVerification',
            'Need email verification'
          )}
        </span>
        <Switch
          checked={isEmailVerification}
          onCheckedChange={() => {
            setIsEmailVerification(!isEmailVerification)
            updateSetting(
              'requireEmailVerification',
              !isEmailVerification,
              setIsEmailVerification
            )
          }}
          disabled={isLoading}
        />
      </div>
      <div className="box-row-full justify-between">
        <span>
          {t('teachingService:courseSettings.blockDuplicateEmailEnrollment')}
        </span>
        <Switch
          checked={blockDuplicateEmailEnrollment}
          onCheckedChange={() => {
            setBlockDuplicateEmailEnrollment(!blockDuplicateEmailEnrollment)
            updateSetting(
              'blockDuplicateEmailEnrollment',
              !blockDuplicateEmailEnrollment,
              setBlockDuplicateEmailEnrollment
            )
          }}
          disabled={isLoading}
        />
      </div>
    </div>
  )
})

export default PrivacySettings
