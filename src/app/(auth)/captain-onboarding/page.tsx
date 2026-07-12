import { Suspense } from 'react'
import CaptainOnboardingView from '@/features/auth/views/CaptainOnboardingView'

export const metadata = {
  title: 'Captain Activation | Tayar',
  description: 'Verify your account and set up your captain profile.',
}

export default function Page() {
  return (
    <Suspense>
      <CaptainOnboardingView />
    </Suspense>
  )
}
