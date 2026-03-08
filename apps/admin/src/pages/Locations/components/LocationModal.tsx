import { Marker } from '@vis.gl/react-google-maps'

import ModalDialog from '@/components/ui/ModalDialog'

import LocationMap from './LocationMap'

type LocationModalProps = {
  isOpen: boolean
  onClose: () => void
  position?: {
    lat: number
    lng: number
  } | null
  address?: string | null
}

const LocationModal = ({
  isOpen,
  onClose,
  position,
  address,
}: LocationModalProps): JSX.Element => {
  return (
    <ModalDialog
      title="Location"
      open={isOpen}
      onOpenChange={onClose}
      className="max-w-[800px]"
    >
      <div className="w-full h-[400px]">
        <LocationMap position={position} address={address} searchable={false}>
          <Marker position={position} />
        </LocationMap>
      </div>
    </ModalDialog>
  )
}

export default LocationModal
