import { useState } from 'react'

import useTranslation from 'next-translate/useTranslation'

import Button from '@/components/Buttons/Button'
import Box from '@/components/Containters/Box'
import ImageAspect from '@/components/Images/ImageAspect'
import Modal from '@/components/Popups/Modal'
import TabPanel from '@/components/Tabs/TabPanel'
import TabWithListAndButton from '@/components/Tabs/TabWithListAndButton'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { useSchoolContext } from '@/stores/schoolContext'
import { ImageDetail, School } from '@/types'

const MediaTab = (): JSX.Element => {
  const { schoolContext } = useSchoolContext()
  const {
    school: { galleries },
  } = schoolContext as { school: School }

  const { t } = useTranslation()
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedGallery, setSelectedGallery] = useState<ImageDetail>()

  const categoriesSet = new Set(
    galleries?.flatMap(gallery => (gallery.tags !== 'all' ? gallery.tags : []))
  )
  const categories = ['all', ...categoriesSet]

  const tabData = categories.map(category => ({
    label: t(`school:imageTag.${category}`).replace('school:imageTag.', ''),
    value: category,
  }))

  if (galleries && galleries.length !== 0) {
    return (
      <Box direction="col">
        <Heading align="center">{t('school:heading.gallery')}</Heading>

        <Box>
          <TabWithListAndButton
            tabData={tabData}
            handleChange={(value: string) => {
              setActiveFilter(value)
            }}
          >
            {categories.map(category => {
              return (
                <TabPanel key={category} tabName={category}>
                  <Box className="flex flex-wrap" justify="start" gap="unset">
                    {galleries
                      .filter(
                        tile => activeFilter === 'all' || tile.tags === activeFilter.toString()
                      )
                      .map((tile, index) => {
                        return (
                          <Modal
                            key={index}
                            trigger={
                              <Box
                                onClick={() => {
                                  setSelectedGallery(tile)
                                }}
                                direction="col"
                                className="aspect-w-1 aspect-h-1 w-full cursor-pointer md:w-1/2 lg:w-1/3"
                              >
                                <ImageAspect
                                  s3="public"
                                  src={tile.imageUrl}
                                  alt={tile.caption}
                                  ratio={1}
                                  className="h-48 md:h-64 lg:h-80"
                                  imgClassName="object-cover"
                                />
                                {tile.caption && (
                                  <Box>
                                    <Text>{tile.caption}</Text>
                                  </Box>
                                )}
                              </Box>
                            }
                          >
                            <Box className="w-full" direction="col">
                              <Box className="w-full">
                                <ImageAspect
                                  s3="public"
                                  src={tile.imageUrl}
                                  alt={tile.caption}
                                  ratio={1}
                                />
                              </Box>
                              {selectedGallery?.caption && <Text>{selectedGallery.caption}</Text>}
                              <Modal.ButtonGroup>
                                <Modal.Close asChild>
                                  <Button variant="outlined" className="mt-2">
                                    {t('common:action.close')}
                                  </Button>
                                </Modal.Close>
                              </Modal.ButtonGroup>
                            </Box>
                          </Modal>
                        )
                      })}
                  </Box>
                </TabPanel>
              )
            })}
          </TabWithListAndButton>
        </Box>
      </Box>
    )
  } else {
    return (
      <div className="box-col min-h-[30rem]">
        <Heading align="center">{t('school:heading.gallery')}</Heading>

        <Text align="center">{t('school:noGallery')}</Text>
      </div>
    )
  }
}

export default MediaTab
