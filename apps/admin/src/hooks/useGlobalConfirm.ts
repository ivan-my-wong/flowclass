import { useCallback, useContext, useEffect } from 'react'

import ConfirmContext from '@/contexts/ConfirmContext'
import {
  ConfirmOptionsType,
  HIDE_CONFIRM,
  SET_CONFIRM_CONTENT,
  SET_LOADING_CONFIRM,
  SHOW_CONFIRM,
} from '@/reducers/confirm.reducers'

const useConfirm = (isLoading: boolean) => {
  const [confirmState, dispatch] = useContext(ConfirmContext)

  const setConfirm = (content: ConfirmOptionsType) => {
    dispatch({
      type: SET_CONFIRM_CONTENT,
      payload: content,
    })
    return {
      open: openConfirm,
    }
  }

  const setLoading = useCallback(
    (isLoading: boolean) => {
      dispatch({
        type: SET_LOADING_CONFIRM,
        payload: isLoading,
      })
    },
    [dispatch]
  )
  useEffect(() => {
    setLoading(isLoading)
  }, [isLoading, setLoading])

  const closeConfirm = () => {
    dispatch({
      type: HIDE_CONFIRM,
    })
  }
  const openConfirm = () => {
    dispatch({
      type: SHOW_CONFIRM,
    })
  }

  return {
    setConfirm,
    openConfirm,
    closeConfirm,
    setLoading,
    confirmState,
  }
}

export default useConfirm
