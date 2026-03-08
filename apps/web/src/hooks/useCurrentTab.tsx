import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const useCurrentTab = (tabs: string[]) => {
  const router = useRouter()
  const [finalTab, setFinalTab] = useState(0)

  useEffect(() => {
    if (router.query && router.query.tab) {
      const tabNumber = parseInt(router.query.tab as string, 10)
      if (!isNaN(tabNumber) && tabNumber < tabs.length && tabNumber >= 0) {
        setFinalTab(tabNumber)
      }
    }
  }, [router.query, tabs])

  return finalTab
}

const useCurrentStep = (steps: any[]) => {
  const router = useRouter()
  const [finalStep, setFinalStep] = useState(0)

  useEffect(() => {
    if (router.query && router.query.step) {
      const stepNumber = parseInt(router.query.step as string, 10)
      if (!isNaN(stepNumber) && stepNumber < steps.length && stepNumber >= 0) {
        setFinalStep(stepNumber)
      }
    }
  }, [router.query, steps])

  return finalStep
}

export { useCurrentStep, useCurrentTab }
