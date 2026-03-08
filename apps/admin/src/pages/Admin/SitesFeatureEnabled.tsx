'use client'

import { useMemo, useState } from 'react'

import { LuPlus, LuSettings } from 'react-icons/lu'

import Skeleton from 'react-loading-skeleton'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import useSitesFeatureEnabled from '@/hooks/useSiteFeatureEnableData'
import { SiteFeature } from '@/types/site-feature'

import SiteSelectionModal from './SiteSelectionModal'

const FEATURE_LABELS = {
  [SiteFeature.BulkSendDocuments]: 'Bulk Send Documents',
  [SiteFeature.CertificateTemplates]: 'Certificate Templates',
  [SiteFeature.PaymentCampaign]: 'Invoice Campaign',
  // [SiteFeature.ReceiptTemplates]: 'Receipt Templates',
  [SiteFeature.TemplateManagement]: 'Template Management',
  [SiteFeature.LessonMatrix]: 'Attendance Sheet',
  [SiteFeature.BundleDiscounts]: 'Bundle Discounts',
  [SiteFeature.ClassMaterials]: 'Class Materials',
}

const FEATURE_DESCRIPTIONS = {
  [SiteFeature.BulkSendDocuments]:
    'Send documents to multiple recipients at once',
  [SiteFeature.CertificateTemplates]: 'Create and manage certificate templates',
  [SiteFeature.PaymentCampaign]: 'Design custom invoice campaigns',
  // [SiteFeature.ReceiptTemplates]: 'Build receipt templates for transactions',
  [SiteFeature.TemplateManagement]:
    'Manage templates for various document types',
  [SiteFeature.LessonMatrix]: 'Organize and manage attendance sheets',
  [SiteFeature.BundleDiscounts]: 'Create and manage bundle discounts',
  [SiteFeature.ClassMaterials]: 'Manage class materials',
}

const SiteFeatureManager = (): JSX.Element => {
  const [selectedFeature, setSelectedFeature] = useState<SiteFeature | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { useFetchSitesFeatureEnabled } = useSitesFeatureEnabled()
  const { data: sitesFeatureEnabled, isLoading } = useFetchSitesFeatureEnabled()
  const handleFeatureClick = (feature: SiteFeature) => {
    setSelectedFeature(feature)
    setIsModalOpen(true)
  }
  const featureToSiteIds = useMemo(
    () => new Map((sitesFeatureEnabled ?? []).map(r => [r.feature, r.siteIds])),
    [sitesFeatureEnabled]
  )
  const selectedFeatureEnabled = useMemo(() => {
    if (!selectedFeature) return null
    return {
      feature: selectedFeature,
      siteIds: featureToSiteIds.get(selectedFeature) ?? [],
    }
  }, [featureToSiteIds, selectedFeature])

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Site Feature Management</h1>
        <p className="text-muted-foreground">
          Configure which sites have access to specific features
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {isLoading &&
          Object.values(SiteFeature).map((_, index) => (
            <Skeleton key={index} height={50} className="h-4 w-24" />
          ))}
        {Object.values(SiteFeature).map(feature => {
          const assignedSites = featureToSiteIds.get(feature) ?? []
          return (
            <Card key={feature} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LuSettings
                      className="h-5 w-5 text-primary"
                      aria-hidden="true"
                    />
                    <CardTitle className="text-lg">
                      {FEATURE_LABELS[feature]}
                    </CardTitle>
                  </div>

                  <Badge variant="secondary">
                    {assignedSites.length} site
                    {assignedSites.length === 1 ? '' : 's'}
                  </Badge>
                </div>
                <CardDescription>
                  {FEATURE_DESCRIPTIONS[feature]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {assignedSites.length > 0
                      ? `Assigned to ${assignedSites.length} site${
                          assignedSites.length === 1 ? '' : 's'
                        }`
                      : 'No sites assigned'}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFeatureClick(feature)}
                    className="gap-2"
                  >
                    <LuPlus className="h-4 w-4" aria-hidden="true" />
                    Manage Sites
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedFeature && (
        <SiteSelectionModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          feature={selectedFeature}
          featureLabel={FEATURE_LABELS[selectedFeature]}
          selectedSiteIds={selectedFeatureEnabled?.siteIds ?? []}
        />
      )}
    </div>
  )
}

export default SiteFeatureManager
