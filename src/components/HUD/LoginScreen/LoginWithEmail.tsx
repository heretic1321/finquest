import { useEffect, useState } from 'react'

import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'

import GradientBorder from '@client/components/GradientBorder'
import Button from '@client/components/shared/Button'
import Error from '@client/components/shared/Error'
import { AuthAPIStore } from '@client/contexts/AuthContext'

interface LoginWithEmailProps {
  setCurrentTab: (tab: string) => void
}

const LoginWithEmail: React.FC<LoginWithEmailProps> = ({ setCurrentTab }) => {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const loginWithEmail = AuthAPIStore((state) => state.loginWithEmail)
  const [isSignInButtonDisabled, setIsSignInButtonDisabled] =
    useState<boolean>(true)
  useEffect(() => {
    if (username !== '' && password !== '') {
      setIsSignInButtonDisabled(false)
    } else {
      setIsSignInButtonDisabled(true)
    }
  }, [username, password])

  const handleKeyDownForSignIn = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSignInButtonDisabled) {
      signInWithEmailButtonClicked()
    }
  }

  const signInWithEmailButtonClicked = async () => {
    setIsLoading(true)
    if (loginWithEmail === null) {
      setIsLoading(false)
      return
    }
    const [isSuccessful, data] = await loginWithEmail(username, password)
    setIsLoading(false)

    if (!isSuccessful) {
      if (data['error'] === 'invalid_credentials') {
        setErrorMessage('Invalid credentials')
      } else setErrorMessage('Something went wrong')
      return
    } else {
      setErrorMessage('')
    }
  }
  return (
    <>
      <h1 className='py-4 text-center text-[32px] md:text-left md:text-[56px]'>
        Login to Explore
      </h1>
      {errorMessage.length > 0 && <Error text={errorMessage} />}

      <div className='flex flex-col gap-2 py-2'>
        <label htmlFor='' className='py-1'>
          Email Id
        </label>
        <input
          className='w-full rounded-md border border-[#C599FFCF] bg-[#17082F80] px-5 py-3 text-[#C599FF]'
          type='text'
          placeholder='john.doe@gmail.com'
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => handleKeyDownForSignIn(e)}
        />
      </div>
      <div className='flex flex-col gap-2 py-2'>
        <label htmlFor='' className='py-1'>
          Password
        </label>
        <div className='relative'>
          <input
            type={showPassword ? 'text' : 'password'}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => handleKeyDownForSignIn(e)}
            placeholder='Please enter your Password'
            className='w-full rounded-md border border-[#C599FFCF] bg-[#17082F80] px-5 py-3 text-[#C599FF]'
          />
          {showPassword ? (
            <AiFillEyeInvisible
              onClick={() => setShowPassword(false)}
              className='absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer'
              color='grey'
            />
          ) : (
            <AiFillEye
              onClick={() => setShowPassword(true)}
              className='absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer'
              color='grey'
            />
          )}
        </div>
      </div>

      <div className='my-6'>
        <GradientBorder className='w-full -skew-x-[10deg] rounded-md'>
          <Button
            classNames='w-full !border-none !skew-x-0'
            isLoading={isLoading}
            disabled={username === '' || password === ''}
            onClick={async () => await signInWithEmailButtonClicked()}
            onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) =>
              handleKeyDownForSignIn(e)
            }
          >
            Login
          </Button>
        </GradientBorder>
      </div>

      <div className='w-full py-2'>
        <p className='mx-auto w-full text-center'>OR</p>
      </div>
      <div className='flex items-center justify-center gap-3 py-4'>
        <GradientBorder className='w-1/2 -skew-x-[10deg] rounded-md'>
          <Button
            classNames='primary w-[1/2] !skew-x-0 !bg-[#251243] !border-none'
            onClick={() => setCurrentTab('mobile')}
          >
            Login via mobile
          </Button>
        </GradientBorder>
        <GradientBorder className='w-1/2 -skew-x-[10deg] rounded-md'>
          <Button
            classNames='primary w-[1/2] !skew-x-0 !bg-[#251243] !border-none'
            onClick={() => setCurrentTab('guest')}
          >
            Login as a Guest
          </Button>
        </GradientBorder>
      </div>
      <p className='pt-4 text-center'>
        Don't have an Account?{' '}
        <a href='https://sencogoldanddiamonds.com/' target='_blank'>
          Create one!
        </a>
      </p>
    </>
  )
}

export default LoginWithEmail
