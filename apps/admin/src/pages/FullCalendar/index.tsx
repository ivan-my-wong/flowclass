import { useEffect, useState } from 'react'
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import { DragAndDropProvider } from '@/components/ui/FullCalendar/CalendarDnDContext'
import { CalendarGrid } from '@/components/ui/FullCalendar/CalendarGrid'
import { CalendarHeader } from '@/components/ui/FullCalendar/CalendarHeader'
import { CalendarProvider } from '@/components/ui/FullCalendar/CalendarProvider'
import { CalendarSidebarProvider } from '@/components/ui/FullCalendar/CalendarSidebarContext'
import { EventProvider } from '@/components/ui/FullCalendar/EventProvider'
import { CalendarEvent } from '@/types/fullCalendar.type'

import { CalendarSidebar } from './components/CalendarSidebar'
import { CreateClassModal } from './components/CreateClassFromCalendarModal'

const CalendarPage = () => {
  const [params] = useSearchParams()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    start: string
    end: string
  } | null>(null)

  const { pathname } = useLocation()
  const navigate = useNavigate()

  const handleEventClick = (event: CalendarEvent) => {
    if (!event.blockTime) {
      params.set('back', pathname)
      navigate(`/full-calendar/lesson/${event.id}?${params.toString()}`)
    }
  }

  const handleTimeSlotSelect = (start: Date, end: Date) => {
    setSelectedTimeSlot({
      start: start.toISOString(),
      end: end.toISOString(),
    })
    // setIsCreateModalOpen(true)
  }

  useEffect(() => {
    // Hide main scrollbar
    const mainElement = document.querySelector('main')
    if (mainElement) {
      mainElement.style.overflow = 'hidden'
    }
    return () => {
      if (mainElement) {
        mainElement.style.overflow = 'auto'
      }
    }
  }, [])

  return (
    <CalendarProvider enableDragAndDrop={false}>
      <EventProvider onEventClick={handleEventClick}>
        <DragAndDropProvider>
          <CalendarSidebarProvider>
            <div className="flex md:h-[93vh] bg-background">
              <CalendarSidebar className="border-r h-dvh md:h-[93vh] overflow-y-auto" />
              <div className="flex flex-1 flex-col">
                <CalendarHeader className="border-b" />
                <CalendarGrid
                  className="flex-1 overflow-auto"
                  onTimeSlotSelect={handleTimeSlotSelect}
                />
              </div>
            </div>
          </CalendarSidebarProvider>
          <Outlet />
          <CreateClassModal
            open={isCreateModalOpen}
            onOpenChange={setIsCreateModalOpen}
            selectedTimeSlot={selectedTimeSlot || undefined}
          />
        </DragAndDropProvider>
      </EventProvider>
    </CalendarProvider>
  )
}

export default CalendarPage
