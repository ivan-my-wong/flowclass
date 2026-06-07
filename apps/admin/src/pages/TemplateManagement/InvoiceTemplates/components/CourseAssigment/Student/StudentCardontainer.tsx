import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { FiUser } from 'react-icons/fi'
import { LuExternalLink } from 'react-icons/lu'
import { RiCloseLargeFill } from 'react-icons/ri'
import {
  useRecoilState,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from 'recoil'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import useStudentInvoice from '@/hooks/useStudentInvoice'
import {
  currentActiveStudentState,
  invoiceClassesState,
  invoiceSessionState,
  invoiceStudentState,
  isInvoiceExistOnCampaignSelector,
  studentListState,
} from '@/stores/studentInvoice.store'
import { InvoiceStudent } from '@/types/studentInvoice.type'
import { cn } from '@/utils/cn'
import { formatPhoneNumber } from '@/utils/misc'

const StudentCardontainer = (): JSX.Element => {
  const { t } = useTranslation(['invoiceCampaign'])
  const navigate = useNavigate()
  const { useGetAllStudents } = useStudentInvoice()
  const { data: studentList } = useGetAllStudents()
  const setStudentList = useSetRecoilState(studentListState)
  const isInvoiceExist = useRecoilValue(isInvoiceExistOnCampaignSelector)
  const [allStudents, setAllStudents] = useRecoilState(invoiceStudentState)
  const setAllClasses = useSetRecoilState(invoiceClassesState)
  const setAllSessions = useSetRecoilState(invoiceSessionState)
  const [currentActiveStudent, setCurrentActiveStudent] = useRecoilState(
    currentActiveStudentState
  )
  const resetActiveStudent = useResetRecoilState(currentActiveStudentState)

  const setActiveInvoice = (student: InvoiceStudent) => {
    setCurrentActiveStudent(student)
  }

  const removeStudentFormStore = (studentId: number) => {
    setAllStudents(prev => prev.filter(item => item.id !== studentId))
    setAllClasses(prev =>
      prev.filter(item => item.studentItem.id !== studentId)
    )
    setAllSessions(prev =>
      prev.filter(item => item.studentItem?.id !== studentId)
    )
    if (currentActiveStudent?.id === studentId) {
      resetActiveStudent()
    }
  }

  useEffect(() => {
    if (studentList) {
      setStudentList(studentList)
    }
  }, [setStudentList, studentList])

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-fit">
        <div className="p-4 border-b border-gray-200">
          <div className="text-lg font-semibold text-gray-900">
            {t('studentCard.selectStudent')}
          </div>
          {!isInvoiceExist && (
            <div className="mt-3">
              <Button
                className="w-full"
                variant="primary-outline"
                iconBefore={<LuExternalLink />}
                onClick={() => navigate('/student-record')}
              >
                {t('studentCard.goToStudentCrm') || 'Manage students in CRM'}
              </Button>
            </div>
          )}
        </div>
        <div className="p-4 space-y-3 max-h-[68vh] overflow-y-auto" role="list">
          {allStudents.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-500">
              <FiUser className="text-gray-300 mb-3" size={50} />
              <div>{t('studentCard.noStudentsSelected')}</div>
              <div className="text-sm mt-1">
                {t('studentCard.searchAndSelect')}
              </div>
            </div>
          ) : (
            <>
              {allStudents.map(studentItem => (
                <Card
                  key={studentItem.id}
                  className={cn(
                    'p-4 rounded-lg border transition-all cursor-pointer border-gray-200 shadow-none hover:border-gray-300 hover:bg-gray-50',
                    currentActiveStudent?.id === studentItem.id &&
                      'bg-blue-50 border-blue-500 hover:bg-blue-50 hover:border-blue-500'
                  )}
                  onClick={() => setActiveInvoice(studentItem)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <FiUser
                      size={40}
                      className="bg-blue-100 rounded-full text-blue-600 p-2 min-w-10"
                    />
                    <div className="w-full overflow-x-hidden">
                      <p className="font-medium text-gray-900 truncate text-ellipsis">
                        {studentItem.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate text-ellipsis">
                        {formatPhoneNumber(studentItem.phone)}
                      </p>
                    </div>
                    {!isInvoiceExist && (
                      <RiCloseLargeFill
                        className="text-gray-400 ml-auto"
                        onClick={event => {
                          event.stopPropagation()
                          removeStudentFormStore(studentItem.id)
                        }}
                      />
                    )}
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default StudentCardontainer
