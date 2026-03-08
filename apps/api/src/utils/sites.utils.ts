import { SiteDto } from '@/application/admin/auth/dto/response-user.dto'
import { Institution } from '@/models/institutions.entity'
import { Site } from '@/models/site.entity'

import { institutionsOfUser } from './institutions.utils'

export const sitesOfUser = (sites: Site[], institutions: Institution[]): SiteDto[] => {
  const data: SiteDto[] = []
  sites.forEach((site) => {
    const siteDto: SiteDto = {
      siteId: site.id,
      url: site.url,
      email: site.email,
      phone: site.phone,
      banner: site.banner,
      logo: site.logo,
      institutions: [],
    }

    const institutionBySite = []
    institutions.forEach((institution) => {
      if (institution.siteId == site.id) {
        institutionBySite.push(institution)
      }
    })
    siteDto.institutions = institutionsOfUser(institutionBySite)

    data.push(siteDto)
  })

  return data
}
