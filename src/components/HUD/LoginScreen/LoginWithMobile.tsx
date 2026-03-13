import {
  createRef,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState
} from 'react'

import GradientBorder from '@client/components/GradientBorder'
import Button from '@client/components/shared/Button'
import Error from '@client/components/shared/Error'
import { AuthAPIStore } from '@client/contexts/AuthContext'

import { useShallow } from 'zustand/react/shallow'
import { AvatarStore } from '@client/contexts/AvatarAppearanceContext'

interface LoginWithMobileProps {
  setCurrentTab: (tab: string) => void
}

const LoginWithMobile: React.FC<LoginWithMobileProps> = ({ setCurrentTab }) => {
  const [mobileNumber, setMobileNumber] = useState<string>('')
  const [otp, setOTP] = useState<string>('')
  const [otpUuid, setOTPUuid] = useState<string>('')
  const [isOTPSent, setIsOTPSent] = useState<boolean>(false)
  const otpInputRefs = Array.from({ length: 6 }).map(() =>
    createRef<HTMLInputElement>(),
  )
  const otpNumbers = Array.from({ length: 6 }).map(() => useState<string>(''))
  const mobileNumberInputRef = useRef<HTMLInputElement | null>(null)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const {
    loginWithMobileSendOTP,
    loginWithMobileVerifyOTP,
    fetchAvatar,
    setRPMUserId,
  } = AuthAPIStore(
    useShallow((state) => ({
      loginWithMobileSendOTP: state.loginWithMobileSendOTP,
      loginWithMobileVerifyOTP: state.loginWithMobileVerifyOTP,
      fetchAvatar: state.fetchAvatar,
      setRPMUserId: state.setRPMUserId,
    })),
  )
  const setAvatarData = AvatarStore((state) => state.setAvatarData)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const [isSendOrVerifyOTPButtonDisabled, setIsSendOrVerifyOTPButtonDisabled] =
    useState<boolean>(true)
  useEffect(() => {
    if (
      (!isOTPSent && mobileNumber.length < 10) ||
      (isOTPSent && otp.length < 6)
    )
      setIsSendOrVerifyOTPButtonDisabled(true)
    else setIsSendOrVerifyOTPButtonDisabled(false)
  }, [isOTPSent, mobileNumber, otp])

  useEffect(() => {
    if (otpNumbers.every((otpNumber) => otpNumber[0] !== '')) {
      setOTP(otpNumbers.map((otpNumber) => otpNumber[0]).join(''))
    } else {
      setOTP('')
    }
  }, [otpNumbers])

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (!e.clipboardData) return
    const paste = e.clipboardData.getData('text')
    const pasteArray = Array.from(paste)
    if (
      pasteArray.length === 6 &&
      pasteArray.every((char) => /\d/.test(char))
    ) {
      pasteArray.forEach((char, index) => {
        if (otpInputRefs[index]?.current) {
          const currentInput = otpInputRefs[index].current
          if (currentInput) {
            currentInput.value = char
            otpNumbers[index][1](char)
          }
        }
      })
      setOTP(paste)
    }
  }

  const changeDetectedInMobileNumberInput = (
    e: FormEvent<HTMLInputElement>,
  ) => {
    // extracting and keeping only 10 digits from the input
    e.currentTarget.value = Math.max(0, parseInt(e.currentTarget.value))
      .toString()
      .slice(0, 10)

    // if the input is 10 digits long, then set the mobile number state variable
    // else set the mobile number to empty string
    if (e.currentTarget.value.length === 10) {
      setMobileNumber(e.currentTarget.value)
    } else {
      setMobileNumber('')
    }
  }

  const moveFocusToNextOTPInputBox = (index: number) => {
    if (index < 5 && otpInputRefs[index + 1].current) {
      otpInputRefs[index + 1].current?.focus()
    }
  }

  const moveFocusToPreviousOTPInputBox = (index: number) => {
    if (index > 0 && otpInputRefs[index - 1].current) {
      otpInputRefs[index - 1].current?.focus()
    }
  }

  const changeDetectedInOTPInput = (
    e: FormEvent<HTMLInputElement>,
    index: number,
  ) => {
    // Detect and distribute OTP if it is pasted
    const value = e.currentTarget.value
    if (value.length > 1) {
      const values = Array.from(value).slice(0, 6 - index)
      for (let i = 0; i < values.length; i++) {
        const curIndex = index + i
        const currentInput = otpInputRefs[curIndex].current
        if (currentInput) {
          currentInput.value = values[i]
          otpNumbers[curIndex][1](values[i])
        }
      }
    } else {
      e.currentTarget.value = Math.max(0, parseInt(e.currentTarget.value))
        .toString()
        .slice(0, 1)
      if (e.currentTarget.value.length === 1) {
        otpNumbers[index][1](e.currentTarget.value)
        moveFocusToNextOTPInputBox(index)
      } else otpNumbers[index][1]('')
    }
  }

  const handleKeyDownOnOTPInputElements = (
    e: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === 'Backspace' && otpNumbers[index][0] === '') {
      moveFocusToPreviousOTPInputBox(index)
    } else if (e.key === 'Enter' && !isSendOrVerifyOTPButtonDisabled) {
      sendOrVerifyOTPButtonClicked()
    } else if (e.key === 'ArrowLeft') {
      moveFocusToPreviousOTPInputBox(index)
    } else if (e.key === 'ArrowRight') {
      moveFocusToNextOTPInputBox(index)
    }
  }

  const handleKeyDownOnSendOrVerifyOTPButton = (
    e: KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (e.key === 'Enter') {
      sendOrVerifyOTPButtonClicked()
    }
  }

  const handleKeyDownOnMobileNumberInput = (
    e: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Enter' && !isSendOrVerifyOTPButtonDisabled) {
      sendOrVerifyOTPButtonClicked()
    }
  }

  const sendOrVerifyOTPButtonClicked = async () => {
    if (
      loginWithMobileSendOTP === null ||
      loginWithMobileVerifyOTP === null ||
      fetchAvatar === null
    )
      return
    if (!isOTPSent) {
      setIsLoading(true)
      const [isSuccessful, data] = await loginWithMobileSendOTP(mobileNumber)
      setOTPUuid(data.otp_uuid)
      setIsLoading(false)

      if (!isSuccessful) {
        if (
          'errors' in data &&
          'mobile' in data['errors'] &&
          data['errors']['mobile'].length > 0
        ) {
          setErrorMessage(data['errors']['mobile'][0])
        } else {
          setErrorMessage('Something went wrong')
        }
        setIsOTPSent(false)
      } else {
        setErrorMessage('')
        setIsOTPSent(true)
      }
    } else {
      setIsLoading(true)
      const [isSuccessful, data] = await loginWithMobileVerifyOTP(
        mobileNumber,
        otp,
        otpUuid,
      )

      if (isSuccessful) {
        const res = await fetchAvatar(mobileNumber)
        const user = res.data
        if (user) {
          if (user.rpmId && setAvatarData && setRPMUserId) {
            // if user has generated an avatar before then populate the avatarPath and we can skip avatar creation
            if (user.avatarUrl) {
              setAvatarData({
                avatarPath: user.avatarUrl,
              })
              localStorage.setItem('avatarPath', user.avatarUrl)
            } else {
              localStorage.removeItem('avatarPath')
              setAvatarData({
                avatarPath: '',
              })
            }
            setRPMUserId(user.rpmId)
            localStorage.setItem('rpmUserId', user.rpmId)
          }
        }
      }

      setIsLoading(false)

      if (!isSuccessful) {
        if (
          'errors' in data &&
          'otp' in data['errors'] &&
          data['errors']['otp'].length > 0
        ) {
          setErrorMessage(data['errors']['otp'][0])
        } else {
          setErrorMessage('Something went wrong')
        }
        setOTP('')
      } else {
        setErrorMessage('')
      }
    }
  }

  // No resend Functionality in UI
  // const resendOTPButtonClicked = () => {
  //   setOTP('')
  //   otpInputRefs.forEach((otpInputRef) => {
  //     if (otpInputRef.current) otpInputRef.current.value = ''
  //   })
  //   setErrorMessage('')
  // }

  //No Change Number functionality in UI
  // const changeMobileNumberButtonClicked = () => {
  //   setOTP('')
  //   otpInputRefs.forEach((otpInputRef) => {
  //     if (otpInputRef.current) otpInputRef.current.value = ''
  //   })
  //   setIsOTPSent(false)
  //   setMobileNumber('')
  //   setErrorMessage('')
  //   if (mobileNumberInputRef.current) mobileNumberInputRef.current.value = ''
  // }

  return !isOTPSent ? (
    <>
      <h1 className='py-4 text-center text-3xl md:text-left md:text-4xl '>
        Enter your Phone No.
      </h1>
      {errorMessage.length > 0 && <Error text={errorMessage} />}
      <>
        <div className='flex flex-col gap-2 py-2'>
          <label htmlFor='' className='py-1'>
            Phone No.
          </label>
          <input
            className='w-full rounded-md border border-[#C599FFCF] bg-[#17082F80] px-5 py-3 text-[#C599FF]'
            type='number'
            ref={mobileNumberInputRef}
            pattern='[0-9]*'
            maxLength={10}
            onInput={(e) => changeDetectedInMobileNumberInput(e)}
            disabled={isOTPSent}
            placeholder='Enter 10 Digit Mobile Number'
            onKeyDown={(e) => handleKeyDownOnMobileNumberInput(e)}
          />
        </div>

        <div className='my-6'>
          <GradientBorder className='-skew-x-[10deg] rounded-md'>
            <Button
              classNames='!skew-x-0 !border-none'
              disabled={mobileNumber.length !== 10}
              isLoading={isLoading}
              onClick={async () => await sendOrVerifyOTPButtonClicked()}
              onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) =>
                handleKeyDownOnSendOrVerifyOTPButton(e)
              }
            >
              Next
            </Button>
          </GradientBorder>
        </div>
      </>

      <div className='w-full py-2'>
        <p className='mx-auto w-full text-center'>OR</p>
      </div>
      <div className='flex items-center justify-center gap-3 py-4'>
        <GradientBorder className='-skew-x-[10deg] rounded-md'>
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
  ) : (
    <>
      <h1 className='py-4 text-center text-3xl md:text-left md:text-4xl'>
        Verify Your Account
      </h1>

      <div className='flex flex-col gap-2 py-2'>
        <label htmlFor='' className='py-1'>
          Enter the OTP you received
        </label>
        <div className='flex items-center gap-3 py-2 md:justify-between md:py-4'>
          {Array.from({ length: 6 }).map((_, index) => {
            return (
              <input
                className='aspect-square w-8 rounded-md border border-[#C599FFCF] bg-[#17082F80] p-1 text-center text-[#C599FF] md:w-16 md:p-3'
                key={index}
                ref={otpInputRefs[index]}
                type='number'
                pattern='[0-9]*'
                disabled={!isOTPSent}
                placeholder='*'
                maxLength={1}
                onInput={(e) => changeDetectedInOTPInput(e, index)}
                onPaste={(e) => handlePaste(e)}
                onKeyDown={(e) => handleKeyDownOnOTPInputElements(e, index)}
              />
            )
          })}
        </div>
      </div>

      <div className='my-6'>
        <GradientBorder className='-skew-x-[10deg] rounded-md'>
          <Button
            isLoading={isLoading}
            classNames={
              otp.length === 6
                ? 'gradient'
                : 'primary' + ' !skew-x-0 !border-none'
            }
            onClick={async () => await sendOrVerifyOTPButtonClicked()}
            onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) =>
              handleKeyDownOnSendOrVerifyOTPButton(e)
            }
            disabled={otp.length !== 6}
          >
            Next
          </Button>
        </GradientBorder>
      </div>

      <div className='py-4 text-center'>
        <a
          onClick={() => {
            setIsOTPSent(false)
            setMobileNumber('')
            if (mobileNumberInputRef.current) {
              mobileNumberInputRef.current.value = ''
            }
          }}
        >
          Back to Login Selection
        </a>
      </div>
    </>
  )
}

export default LoginWithMobile
