import { Appointment, AppointmentForm } from '../types/appointment'

import apiClient from './index'

export const getCurrentAppointment = async (
  appointmentId: number
): Promise<Appointment> => {
  const res = await apiClient.get({
    url: '/admin/appointment/detail',
    needAuth: true,
    params: {
      appointmentId,
    },
  })

  return res.data.data
}

export const createAppointment = async (
  appointmentData: Partial<Appointment>
): Promise<Appointment> => {
  const res = await apiClient.post({
    url: '/admin/appointment/create-with-course',
    needAuth: true,
    data: { ...appointmentData },
  })

  return res.data.data
}

export const updateAppointment = async (
  appointmentId: number,
  appointmentData: Partial<Appointment>
): Promise<Appointment> => {
  const res = await apiClient.post({
    url: '/admin/appointment/update',
    needAuth: true,
    data: { ...appointmentData },
    params: {
      appointmentId,
    },
  })

  return res.data.data
}

export const getCurrentAppointmentByClass = async (
  classId: number
): Promise<AppointmentForm> => {
  const res = await apiClient.get({
    url: '/admin/appointment/detail-by-class',
    needAuth: true,
    params: {
      classId,
    },
  })

  return res.data.data
}

export const createAppointmentByClass = async (
  appointmentData: Partial<AppointmentForm>
): Promise<AppointmentForm> => {
  const res = await apiClient.post({
    url: '/admin/appointment/create-with-class',
    needAuth: true,
    data: { ...appointmentData },
  })

  return res.data.data
}
