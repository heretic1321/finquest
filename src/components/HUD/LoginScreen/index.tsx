import { AuthAPIStore } from '@client/contexts/AuthContext'
import LoginLayout from '@client/Layouts/LoginLayout'
import FinQuestOnboarding from './FinQuestOnboarding'
import { useShallow } from 'zustand/react/shallow'

const Login = () => {
  const { isLoggedIn, isGuest } = AuthAPIStore(
    useShallow((state) => ({
      isLoggedIn: state.isLoggedIn,
      isGuest: state.isGuest,
    }))
  )

  return (
    <>
      {!isLoggedIn && !isGuest && (
        <LoginLayout>
          <FinQuestOnboarding />
        </LoginLayout>
      )}
    </>
  )
}

export default Login
