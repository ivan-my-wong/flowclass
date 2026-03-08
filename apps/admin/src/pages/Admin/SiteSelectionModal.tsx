import { Dispatch, SetStateAction, useEffect, useState } from 'react'

import { LuGlobe, LuSearch } from 'react-icons/lu'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Inputs/Input'
import ModalDialog from '@/components/ui/ModalDialog'
import useSiteData from '@/hooks/useSiteData'
import useSitesFeatureEnabled from '@/hooks/useSiteFeatureEnableData'
import type { SiteFeature } from '@/types/site-feature'

interface SiteSelectionModalProps {
  isOpen: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  feature: SiteFeature
  featureLabel: string
  selectedSiteIds: number[]
}

const SiteSelectionModal = ({
  isOpen,
  onOpenChange,
  feature,
  featureLabel,
  selectedSiteIds,
}: SiteSelectionModalProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [tempSelectedIds, setTempSelectedIds] =
    useState<number[]>(selectedSiteIds)

  const { useFetchAllSiteData } = useSiteData()
  const { data: sites } = useFetchAllSiteData()
  const { useMutateSiteFeature } = useSitesFeatureEnabled()
  const { mutateAsync: saveSitesFeature, isLoading } = useMutateSiteFeature(
    () => {
      onOpenChange(false)
    }
  )
  useEffect(() => {
    setTempSelectedIds(selectedSiteIds)
  }, [selectedSiteIds])

  const filteredSites = (sites ?? []).filter(
    site =>
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.url?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSiteToggle = (siteId: number) => {
    setTempSelectedIds(prev =>
      prev.includes(siteId)
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    )
  }

  const handleSave = async () => {
    await saveSitesFeature({
      feature,
      siteIds: tempSelectedIds,
    })
  }
  useEffect(() => {
    if (!isOpen) {
      setTempSelectedIds(selectedSiteIds)
    }
  }, [isOpen, selectedSiteIds])

  const handleCancel = () => {
    setTempSelectedIds(selectedSiteIds)
    onOpenChange(false)
  }

  return (
    <ModalDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title={`Manage ${featureLabel} sites`}
      className="overflow-hidden max-w-xl"
      classBody="overflow-hidden w-full"
      footer={
        <>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={isLoading} disabled={isLoading}>
            Save Changes
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 mt-4">
        {/* Search */}
        <div className="relative">
          <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 z-10" />
          <Input
            placeholder="Search sites..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Selected count */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{tempSelectedIds.length} selected</Badge>
          {tempSelectedIds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTempSelectedIds([])}
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Sites list */}
        <div className="flex-1 overflow-y-auto border rounded-md">
          <div className="p-2 space-y-2 overflow-y-auto max-h-[60vh]">
            {filteredSites.map(site => (
              // eslint-disable-next-line jsx-a11y/no-static-element-interactions
              <div
                key={site.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer w-full"
                onClick={() => handleSiteToggle(site.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSiteToggle(site.id)
                  }
                }}
              >
                <Checkbox
                  checked={tempSelectedIds.includes(site.id)}
                  onChange={() => handleSiteToggle(site.id)}
                  onClick={e => e.stopPropagation()}
                />
                <LuGlobe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0 max-w-full">
                  <div className="font-medium text-ellipsis truncate line-clamp-2 overflow-hidden">
                    {site.name}
                  </div>
                  {site.url && (
                    <div className="text-sm text-muted-foreground truncate">
                      {site.url}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredSites.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No sites found matching &quot;{searchTerm}&quot;
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalDialog>
  )
}
export default SiteSelectionModal
