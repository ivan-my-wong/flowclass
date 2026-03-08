import { EnrolState, SelectedClassDataState } from '@/stores/enrol'
import { ClassType, SiteSettings } from '@/types'
import { ApplicableAdditionalFeeResponse } from '@/types/additionalFee'
import { ClassTriaLessonResponse } from '@/types/trial-lesson'
import { calculateClassPriceForAllTypes } from '@/utils/calculateCourse'
import { calculateLessonFormatAndDuration } from '@/utils/calculateTime'
import { getPriceWithCurrency } from '@/utils/string.utils'

export type AllLessonsTemplate = {
  name: string
  lessons: string[]
}

export type FirstLessonTemplate = {
  name: string
  firstLesson: string
}

class CourseDetail {
  name: string[] | string = ''
  firstLesson: FirstLessonTemplate[] = []
  allLesson: AllLessonsTemplate[] = []
  tuitionFee: string[] | string = ''
  originalAdditionalFee = 0
  totalAdditionalFee = 0
  totalTuitionFee = ''
  subTotalPayAmount = 0
  totalPayAmount = 0
  numberOfApplicant = 1
  numberNewStudent = 0
  additionalFeeLabel: string | null = null

  constructor(
    enrolForm: EnrolState,
    siteSettings: Partial<SiteSettings>,
    additionalFee?: ApplicableAdditionalFeeResponse
  ) {
    this.initClasses(enrolForm, siteSettings, additionalFee)
  }

  private initClasses(
    enrolForm: EnrolState,
    siteSettings: Partial<SiteSettings>,
    additionalFee?: ApplicableAdditionalFeeResponse
  ) {
    const { selectedClassData, numberOfApplicant = 1, classTrialLesson } = enrolForm
    this.name = this.extractNames(selectedClassData)

    this.firstLesson = this.extractFirstLessons(selectedClassData)
    this.allLesson = this.extractAllLessons(selectedClassData)

    this.tuitionFee = this.extractTuitionFees(
      selectedClassData,
      classTrialLesson,
      siteSettings.currency
    )

    this.numberOfApplicant = numberOfApplicant

    this.numberNewStudent = additionalFee?.newStudentCount || 0
    this.additionalFeeLabel = additionalFee?.label || null

    if (additionalFee && this.numberNewStudent > 0) {
      this.originalAdditionalFee = (additionalFee?.NEW_STUDENT || 0) / this.numberNewStudent
      this.totalAdditionalFee = this.originalAdditionalFee * this.numberNewStudent
    } else {
      this.originalAdditionalFee = 0
      this.totalAdditionalFee = 0
    }

    this.subTotalPayAmount = this.calculateTotalTuition(
      selectedClassData,
      numberOfApplicant,
      classTrialLesson
    )
    this.totalPayAmount = this.subTotalPayAmount + this.totalAdditionalFee

    this.totalTuitionFee = getPriceWithCurrency(siteSettings.currency, this.totalPayAmount)
  }

  private extractNames(data: SelectedClassDataState[]): string[] {
    return data.map(item => item.selectedClass?.name ?? '')
  }

  private extractFirstLessons(data: SelectedClassDataState[]): FirstLessonTemplate[] {
    return data.map(item => ({
      name: item.selectedClass?.name ?? '',
      firstLesson: calculateLessonFormatAndDuration(
        item.selectedLessons?.[0]?.startTime ?? '',
        item.selectedLessons?.[0]?.endTime ?? ''
      )[0],
    }))
  }

  private extractAllLessons(data: SelectedClassDataState[]): AllLessonsTemplate[] {
    if (!data) return []

    if (data[0].selectedClass?.type === ClassType.recurring) {
      return data.map(item => ({
        name: item.selectedClass?.name ?? '',
        lessons: item.selectedRecurLessons ?? item.selectedIndividualRecurLessons ?? [],
      }))
    }

    return data.map(item => ({
      name: item.selectedClass?.name ?? '',
      lessons: item.selectedLessons?.map(o => `${o.startTime} ${o.endTime}`) ?? [],
    }))
  }

  private extractTuitionFees(
    data: SelectedClassDataState[],
    classTrialLesson?: ClassTriaLessonResponse,
    currency?: string
  ): string[] {
    // For regular and event classes
    return data.map(item => {
      return getPriceWithCurrency(
        currency,
        calculateClassPriceForAllTypes({
          item,
          classTrialLesson,
        })
      )
    })
  }

  private calculateTotalTuition(
    data: SelectedClassDataState[],
    numberOfApplicant = 1,
    classTrialLesson?: ClassTriaLessonResponse
  ): number {
    return (
      data.reduce((acc, item) => {
        return (
          acc +
          calculateClassPriceForAllTypes({
            item,
            classTrialLesson,
          })
        )
      }, 0) * numberOfApplicant
    )
  }
}

export default CourseDetail
