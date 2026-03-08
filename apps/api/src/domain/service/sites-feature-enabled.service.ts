import { Injectable } from '@nestjs/common'

import { SiteFeatureEnabledDto } from '@/application/admin/sites-feature-enabled/dto/sites-feature-enabled.dto'
import {
  SitesFeatureEnabled,
  SitesFeatureEnabledRepository,
} from '@/models/sites-feature-enabled.entity'
import { BaseService } from '@/modules/base/base.service'

@Injectable()
export class SitesFeatureEnabledService extends BaseService<SitesFeatureEnabled> {
  constructor(private readonly sitesFeatureEnabledRepository: SitesFeatureEnabledRepository) {
    super(sitesFeatureEnabledRepository)
  }

  getAll() {
    return this.sitesFeatureEnabledRepository.findAll()
  }
  /**
   * Create or update a feature configuration using replacement semantics:
   * the provided siteIds fully replace any existing ones for the feature.
   * Input siteIds are de-duplicated before persistence.
   */
  async createOrUpdate(body: SiteFeatureEnabledDto): Promise<SitesFeatureEnabled> {
    const { siteIds, feature } = body
    const normalizedSiteIds = Array.from(new Set(siteIds))
    const findByFeature = await this.findOneBy({
      feature,
    })
    if (findByFeature) {
      await this.sitesFeatureEnabledRepository.update(findByFeature.id, {
        siteIds: normalizedSiteIds,
      })
      return this.findOneBy({
        feature,
      })
    }
    return this.sitesFeatureEnabledRepository.save(
      this.sitesFeatureEnabledRepository.create({
        feature,
        siteIds: normalizedSiteIds,
      })
    )
  }
}
