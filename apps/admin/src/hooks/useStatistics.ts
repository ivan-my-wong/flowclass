import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import {
  isValidStatFilter,
  isValidStatType,
  StatFilter,
  StatFilterParams,
  StatType,
} from '@/types/statistics'
import { formatDateRelativeToToday } from '@/utils/timeString'

export const useStatistics = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialType = useMemo(() => {
    const typeFromUrl = searchParams.get('type')
    return isValidStatType(typeFromUrl) ? (typeFromUrl as StatType) : 'revenue'
  }, [searchParams])

  const initialFilter = useMemo(() => {
    const filterFromUrl = searchParams.get('filter')
    return isValidStatFilter(filterFromUrl)
      ? (filterFromUrl as StatFilter)
      : 'overview'
  }, [searchParams])

  const initialStartDate = useMemo(() => {
    return searchParams.get('startDate') ?? formatDateRelativeToToday(30)
  }, [searchParams])

  const initialEndDate = useMemo(() => {
    return searchParams.get('endDate') ?? formatDateRelativeToToday(0)
  }, [searchParams])

  const initialFilters = useMemo(() => {
    const studentName = searchParams.get('studentName') || undefined
    const classId = searchParams.get('classId') || undefined
    const teacherId = searchParams.get('teacherId') || undefined
    const lessonId = searchParams.get('lessonId') || undefined
    const status = searchParams.get('status') || undefined

    return {
      studentName,
      classId,
      teacherId,
      lessonId,
      status,
    }
  }, [searchParams])

  const [type, setType] = useState<StatType>(initialType)
  const [filter, setFilter] = useState<StatFilter>(initialFilter)
  const [chartDate, setChartDate] = useState({
    startDate: initialStartDate,
    endDate: initialEndDate,
  })
  const [additionalFilters, setAdditionalFilters] =
    useState<StatFilterParams>(initialFilters)

  // --- Refs for latest values ---
  const typeRef = useRef(type)
  const filterRef = useRef(filter)
  const chartDateRef = useRef(chartDate)
  const additionalFiltersRef = useRef(additionalFilters)

  useEffect(() => {
    typeRef.current = type
  }, [type])
  useEffect(() => {
    filterRef.current = filter
  }, [filter])
  useEffect(() => {
    chartDateRef.current = chartDate
  }, [chartDate])
  useEffect(() => {
    additionalFiltersRef.current = additionalFilters
  }, [additionalFilters])

  useEffect(() => {
    const params: Record<string, string> = {
      type,
      filter,
      startDate: chartDate.startDate,
      endDate: chartDate.endDate,
      ...Object.fromEntries(
        Object.entries(additionalFilters).filter(
          ([, value]) => value !== undefined && value !== null && value !== ''
        )
      ),
    }

    const sortedKeys = Object.keys(params).sort()
    const sp = new URLSearchParams()
    sortedKeys.forEach(key => sp.set(key, params[key]))

    const currentQuery = location.search.slice(1)
    const newQuery = sp.toString()

    if (currentQuery !== newQuery) {
      navigate(`?${newQuery}`, { replace: true })
    }
  }, [chartDate, additionalFilters, navigate, location.search])

  const handleChartDateChange = useCallback(
    (date: { startDate: string; endDate: string }) => {
      setChartDate(date)
    },
    []
  )

  const setAdditionalFilter = useCallback(
    (key: keyof StatFilterParams, value: any) => {
      setAdditionalFilters(prev => ({
        ...prev,
        [key]: value === '' ? undefined : String(value),
      }))
    },
    []
  )

  return {
    type,
    setType,
    filter,
    setFilter,
    chartDate,
    handleChartDateChange,
    additionalFilters,
    setAdditionalFilter,
  }
}
