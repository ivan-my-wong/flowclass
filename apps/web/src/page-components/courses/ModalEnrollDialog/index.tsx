import router from 'next/router'
import { useEffect, useMemo, useState } from 'react'

import { useRecoilState } from 'recoil'

import useTranslation from 'next-translate/useTranslation'
import { MdLoop, MdOutlineAddCircleOutline } from 'react-icons/md'

import Button from '@/components/Buttons/Button'
import InfoDialog from '@/components/Popups/InfoDialog'
import { useCourseState } from '@/hooks/useCourse'
import { currentWebsiteTheme } from '@/stores/schoolContext'
import { enrolCourseScrollAction } from '@/utils/courseDisplay'

import DialogComplete from './DialogComplete'
import DialogEnterEmail from './DialogEnterEmail'
import DialogForm from './DialogForm'
import DialogNoComplete from './DialogNoComplete'

type IProps = {
  havePrerequisites: boolean
  requireEmailVerification: boolean
}

enum ApplicationModalPage {
  Prerequisite = 'prerequisite',
  Email = 'email',
  PreRequisiteFailed = 'prerequisiteFailed',
  Final = 'final',
}

const ModalEnrollDialog = ({
  havePrerequisites,
  requireEmailVerification,
}: IProps): React.ReactElement => {
  const { t } = useTranslation()

  const { course, school } = useCourseState()
  const [currentTheme] = useRecoilState(currentWebsiteTheme)

  const [showDialog, setShowDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [statusComplete, setStatusComplete] = useState<boolean | undefined>()
  const [page, setPage] = useState<ApplicationModalPage | null>(null)

  const handleContinue = () => {
    setShowDialog(false)
    setPage(null)
    setIsLoading(true)
    router
      .push({
        pathname: '/enrol',
        query: { school: school.url ?? '', course: course.path },
      })
      .then(() => enrolCourseScrollAction(currentTheme))
      .finally(() => setIsLoading(false))
  }

  // Determine the initial step
  const getInitialStep = () => {
    if (havePrerequisites) return ApplicationModalPage.Prerequisite
    if (requireEmailVerification) return ApplicationModalPage.Email
    return ApplicationModalPage.Final
  }

  const dialogTitle = useMemo(() => {
    if (page === ApplicationModalPage.Prerequisite) {
      return t('course:dialogEnroll.title')
    }
    if (page === ApplicationModalPage.Email) {
      return t('course:emailVerificationModal.title')
    }
    if (page === ApplicationModalPage.Final) {
      return t('course:dialogEnroll.title')
    }
    return t('course:dialogEnroll.title')
  }, [page])

  const dialogDescription = useMemo(() => {
    if (page === ApplicationModalPage.Prerequisite) {
      return t('course:dialogEnroll.description')
    }
    if (page === ApplicationModalPage.Email) {
      return null
    }
    if (page === ApplicationModalPage.Final) {
      return t('course:dialogEnroll.description')
    }
    return t('course:dialogEnroll.description')
  }, [page])

  useEffect(() => {
    if (statusComplete) {
      if (requireEmailVerification) {
        setPage(ApplicationModalPage.Email)
        setStatusComplete(undefined)
      }
      // Otherwise, go to final step
      setPage(ApplicationModalPage.Final)
      setStatusComplete(undefined)
    }
  }, [statusComplete])

  // Content for each step
  const dialogContent = useMemo(() => {
    if (page === ApplicationModalPage.Prerequisite) {
      if (statusComplete === undefined) {
        return (
          <DialogForm setShowInfoDialog={setShowDialog} setStatusComplete={setStatusComplete} />
        )
      } else if (!statusComplete) {
        return (
          <DialogNoComplete
            setShowInfoDialog={setShowDialog}
            setStatusComplete={setStatusComplete}
          />
        )
      }
    } else if (page === ApplicationModalPage.Email) {
      return (
        <DialogEnterEmail
          onClose={() => {
            setShowDialog(false)
            setPage(null)
          }}
        />
      )
    } else if (page === ApplicationModalPage.Final) {
      return (
        <DialogComplete
          setShowInfoDialog={setShowDialog}
          setStatusComplete={setStatusComplete}
          handleContinue={handleContinue}
        />
      )
    }
    return <DialogForm setShowInfoDialog={setShowDialog} setStatusComplete={setStatusComplete} />
  }, [page, statusComplete])

  const renderButton = (onClick: () => void) => {
    return (
      <Button
        className="flex h-12 w-full gap-x-2"
        id="enroll-button"
        disabled={isLoading}
        onClick={onClick}
        data-testid="enroll-btn"
      >
        {isLoading ? <MdLoop className="animate-spin" /> : <MdOutlineAddCircleOutline />}
        {t(`course:enroll`)}
      </Button>
    )
  }

  // If neither prerequisites nor email verification, go directly to enrol
  if (!havePrerequisites && !requireEmailVerification) {
    return renderButton(() => handleContinue())
  }

  // Otherwise, show dialog with step logic
  return (
    <InfoDialog
      key={'dialog-enroll-complete'}
      title={dialogTitle}
      description={dialogDescription}
      setOpen={setShowDialog}
      trigger={renderButton(() => {
        setPage(getInitialStep())
      })}
      open={showDialog}
    >
      {dialogContent}
    </InfoDialog>
  )
}

export default ModalEnrollDialog
