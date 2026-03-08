import { InstitutionDto } from '@/application/admin/auth/dto/response-user.dto'
import { Institution } from '@/models/institutions.entity'
import { UserAlias } from '@/models/user-aliases.entity'

export const institutionsOfUser = (institutions: Institution[]): InstitutionDto[] => {
  const data: InstitutionDto[] = []
  institutions.forEach((institution) => {
    const institutionDto: InstitutionDto = {
      institutionId: institution.id,
      email: institution.email,
      phone: institution.phone,
      siteId: institution.siteId,
      name: institution.name,
      url: institution.url,
      gallery: institution.gallery,
    }

    data.push(institutionDto)
  })

  return data
}

export const removeDuplicatesStudentInInstitution = (array: UserAlias[]) => {
  const seen = new Set()
  return array.filter((item) => {
    const { id, name, ...other } = item
    const key = JSON.stringify(other)
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}
