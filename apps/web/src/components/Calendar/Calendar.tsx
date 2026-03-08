/* eslint-disable simple-import-sort/imports */
import FullCalendar from '@fullcalendar/react' // must go before plugins but eslint don't like it
import rrulePlugin from '@fullcalendar/rrule'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import momentTimezonePlugin from '@fullcalendar/moment-timezone'
import { CalendarOptions } from '@fullcalendar/core'
import interactionPlugin from '@fullcalendar/interaction' // needed for dayClick
import styled from '@emotion/styled'
import allLocales from '@fullcalendar/core/locales-all'
import useTranslation from 'next-translate/useTranslation'

export const minutesToHours = (minutes: number): string[] => {
  const hours = Math.floor(minutes / 60)
  const minutesRemainder = minutes % 60

  const hoursString = String(hours).padStart(2, '0')
  const minutesString = String(minutesRemainder).padStart(2, '0')

  return [hoursString, minutesString]
}

type CalendarProps = CalendarOptions & {
  availableViews?: Array<string>
}

const Calendar = ({ availableViews, ...props }: CalendarProps): JSX.Element => {
  const { t } = useTranslation()

  const { lang } = useTranslation()
  const processedLang = lang === 'zh-TW' ? 'zh' : lang

  const StyleWrapper = styled.div`
    width: 100%;

    .fc-header-toolbar {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 10px;
    }
    .fc .fc-toolbar.fc-header-toolbar {
      margin-bottom: 0.5em;
    }

    .fc-header-toolbar {
      .fc-toolbar-title {
        font-size: 20px;
        font-weight: bold;
        text-align: left;
        margin: auto 0;
        margin-left: 0.5rem;
      }

      .fc-button {
        background-color: transparent;
        color: black;
        border: none;
        // border: 2px solid pink;
      }

      .fc-today-button {
        color: black;
      }

      .fc-timeGridWeek-button {
        margin-left: auto;
      }
    }
    .fc-toolbar-chunk {
      display: flex;
      width: 100%;
      // justify-content: space-between;
    }

    .fc-toolbar-title {
      width: 100%;
      text-align: center;
    }

    .fc-list-table {
      .fc-list-event-graphic {
        .fc-list-event-dot {
          border-color: var(--color-primary);
        }
      }
    }
  `

  return (
    <StyleWrapper>
      <FullCalendar
        locales={allLocales}
        locale={processedLang ?? 'en'}
        height="auto"
        // timeZone={useGetCurrentSiteTimeZone()}
        plugins={[rrulePlugin, momentTimezonePlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="listWeek"
        headerToolbar={{
          start: 'title prev,next',
          center: `today${availableViews ? ' ' + [...availableViews, 'listWeek'].join(' ') : ''}`,
          end: '',
        }}
        buttonText={{
          today: t('component:calendar.today'),
          timeGridWeek: t('component:calendar.viewByWeek'),
          list: t('component:calendar.viewByList'),
        }}
        noEventsContent={<div>{t('component:calendar.noEvents')}</div>}
        // views={{
        //   listWeek: {
        //     dayMaxEvents: 2,
        //   },
        // }}
        {...props}
      />
    </StyleWrapper>
  )
}

// tried add css or create a styled component but it doesn't work
// need to add a wrapper to override the css

export default Calendar
