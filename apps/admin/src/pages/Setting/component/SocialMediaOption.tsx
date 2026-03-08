import React, { SetStateAction, useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { MdCheck, MdEdit } from 'react-icons/md'
import { RxCross2 } from 'react-icons/rx'
import { SocialIcon } from 'react-social-icons'
import { toast } from 'sonner'

import Box from '@/components/Containers/Box'
import SvgIcon from '@/components/Images/SvgIcon'
import { TextInput } from '@/components/Inputs/TextInput'
import { SimpleSelectorItemProps } from '@/components/Selector/Select'
import SocialMediaSelector from '@/components/Selector/SocialMediaSelector'
import Text from '@/components/Texts/Text'
import { SocialMedia } from '@/constants/socialMedia'
import { SocialMediaSetting } from '@/types/settingSocialMedia'

type SocialMediaOptionProps = {
  socialMediaSetting: SocialMediaSetting
  setSocialMediaSettingList: (val: SetStateAction<SocialMediaSetting[]>) => void
  socialMediaSettingList: SocialMediaSetting[]
  currentIndex: number
}

const SocialMediaOption = ({
  socialMediaSetting,
  socialMediaSettingList,
  setSocialMediaSettingList,
  currentIndex,
}: SocialMediaOptionProps): JSX.Element => {
  const { t } = useTranslation()
  const [editMode, setEditMode] = useState<boolean>(false)
  const socialMediaOptions: SimpleSelectorItemProps[] = Object.entries(
    SocialMedia
  ).map(([key, value]) => ({
    value,
    label: key,
  }))

  const [selectedOption, setSelectedOption] = useState<SimpleSelectorItemProps>(
    socialMediaOptions.find(item => item.value === socialMediaSetting.name) ??
      socialMediaOptions[0]
  )

  const [newLink, setNewLink] = useState<string>(socialMediaSetting.link)

  useEffect(() => {
    if (socialMediaSetting.link === '') setEditMode(true)
  }, [socialMediaSetting.id])

  const updateData = (value: string) => {
    const newData = socialMediaSettingList.map((item: SocialMediaSetting) => {
      if (item.id === socialMediaSetting.id) {
        return {
          ...item,
          name: selectedOption.value as string,
          link: value,
        }
      }
      return item
    })
    setSocialMediaSettingList(newData)
  }

  return (
    <Box
      data-testid="social-media-card"
      direction="row"
      align="center"
      justify="space-between"
      padding="medium"
      css={{
        backgroundColor: '$backgroundLayer2',
        borderRadius: '$1',
      }}
      key={socialMediaSetting.id}
    >
      <Box justify="space-between" responsive>
        <Box css={{ width: '100%' }} justify="space-between" responsive>
          <Box justify="flex-start">
            {editMode ? (
              <SocialMediaSelector
                options={socialMediaOptions}
                selectOption={selectedOption}
                onChange={(value: any) => {
                  setSelectedOption(value as SimpleSelectorItemProps)
                }}
              />
            ) : (
              <>
                <SvgIcon>
                  <SocialIcon
                    network={socialMediaSetting.name}
                    style={{ width: '20px', height: '20px' }}
                  />
                </SvgIcon>
                <Text bold>
                  {Object.keys(SocialMedia).find(
                    key =>
                      (SocialMedia[
                        key as keyof typeof SocialMedia
                      ] as string) === socialMediaSetting.name
                  )}
                </Text>
              </>
            )}
          </Box>

          {editMode ? (
            <>
              <TextInput
                dataTestId="input-link-social-media"
                id={socialMediaSetting?.id?.toString()}
                name="input"
                value={newLink}
                onChange={e => {
                  setNewLink(e.target.value)
                  updateData(e.target.value)
                }}
                css={{ width: '100%' }}
              />
            </>
          ) : (
            <Box
              justify="flex-start"
              css={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 'calc(100%-2rem)',
              }}
            >
              <a href={socialMediaSetting.link}>{socialMediaSetting.link}</a>
            </Box>
          )}
        </Box>

        <Box
          direction="row"
          justify="flex-end"
          css={{ width: 'fit-content', gap: '$3', '@md': { marginTop: '$2' } }}
        >
          <SvgIcon
            dataTestId={editMode ? 'check-icon' : 'edit-icon'}
            css={{
              cursor: 'pointer',
            }}
            onClick={() => {
              if (editMode) {
                if (!newLink) {
                  return toast.error(t('setting:socialMedia.linkIsRequired'))
                }
              }

              setEditMode(!editMode)
              return editMode
            }}
          >
            {editMode ? <MdCheck /> : <MdEdit />}
          </SvgIcon>
          <SvgIcon
            dataTestId="delete-icon"
            css={{ cursor: 'pointer' }}
            onClick={() => {
              const newSocialMediaSetting = socialMediaSettingList.filter(
                (_: any, index: number) => index !== currentIndex
              )
              setSocialMediaSettingList(newSocialMediaSetting)
            }}
          >
            <span className="text-warn">
              <RxCross2 color="currentColor" />
            </span>
          </SvgIcon>
        </Box>
      </Box>
    </Box>
  )
}

export default SocialMediaOption
