import { ClassEntity } from '@/models/classes.entity'
import { Course } from '@/models/courses.entity'

export enum PrerequisiteOperator {
  AND = 'AND',
  OR = 'OR',
}
export interface IPrerequisiteCondition {
  courseId: number
  classId: number
  operator: PrerequisiteOperator
}

export interface IPrerequisiteGroup {
  groupOperator: PrerequisiteOperator
  conditions: IPrerequisiteCondition[]
}

export interface IPrerequisite {
  groups?: IPrerequisiteGroup[]
}

export type PrerequisiteGroupsResult = {
  groupOperator: PrerequisiteOperator
  result: {
    status: boolean
    operator?: PrerequisiteOperator
    course?: Course
    class?: ClassEntity
  }[]
}
