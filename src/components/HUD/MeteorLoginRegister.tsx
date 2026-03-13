import GradientBorder from '@client/components/GradientBorder';
import Button from '@client/components/shared/Button';
import Error from '@client/components/shared/Error';
import { AuthAPIStore } from '@client/contexts/AuthContext';
import { HUDStore } from "@client/contexts/HUDContext";
import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { MeteorManagerStore } from '../MeteorMining/MeteorManager';
import { IoCloseSharp } from 'react-icons/io5'
import { genericStore } from '@client/contexts/GlobalStateContext';
import { PlayerConfigStore } from '../Character';

enum Mode {
  INITIAL,
  LOGIN,
  REGISTER
}

const MeteorLoginRegister: React.FC = () => {
  const [mode, setMode] = useState<Mode>(Mode.INITIAL);
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [otp, setOTP] = useState<string>('');
  const [isOTPSent, setIsOTPSent] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [otpUuid, setOTPUuid] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const {
    loginWithMobileSendOTP,
    loginWithMobileVerifyOTP,
    sendSignupOTP,
    signup,
  } = AuthAPIStore(
    useShallow((state) => ({
      loginWithMobileSendOTP: state.loginWithMobileSendOTP,
      loginWithMobileVerifyOTP: state.loginWithMobileVerifyOTP,
      sendSignupOTP: state.sendSignupOTP,
      signup: state.signup,
    }))
  )

  const validateMobileNumber = (number: string) => {
    return /^[0-9]{10}$/.test(number);
  };

  const validateName = (name: string) => {
    return /^[A-Za-z\s]+$/.test(name);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePincode = (pincode: string) => {
    return /^[0-9]{6}$/.test(pincode);
  };

  const isRegistrationValid = () => {
    return (
      validateName(name) &&
      validateMobileNumber(mobileNumber) &&
      validateEmail(email) &&
      validatePincode(pincode)
    );
  };

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
    setMobileNumber(value)
    if (isOTPSent) {
      setIsOTPSent(false)
      setOTP('')
    }
  }

  const handleSendOTP = async () => {
    if (mode === Mode.LOGIN && !loginWithMobileSendOTP) return
    if (mode === Mode.REGISTER && !sendSignupOTP) return

    setIsLoading(true)
    let isSuccessful = false
    let data: any

    try {
      if (mode === Mode.LOGIN) {
        const result = await loginWithMobileSendOTP?.(mobileNumber)
        if (Array.isArray(result) && result.length === 2) {
          [isSuccessful, data] = result
        }
      } else {
        const result = await sendSignupOTP?.(mobileNumber, email)
        if (Array.isArray(result) && result.length === 2) {
          [isSuccessful, data] = result
        }
      }
    } catch (error) {
      console.error('Error sending OTP:', error)
      setErrorMessage('Failed to send OTP. Please try again.')
      setIsLoading(false)
      return
    }

    setIsLoading(false)

    if (!isSuccessful || !data) {
      setErrorMessage(data?.message || 'Something went wrong')
      setIsOTPSent(false)
    } else {
      setOTPUuid(data.otp_uuid)
      setErrorMessage('')
      setIsOTPSent(true)
    }
  }

  const handleLogin = async () => {
    if (!loginWithMobileVerifyOTP) return
    setIsLoading(true)
    const [isSuccessful, data] = await loginWithMobileVerifyOTP(mobileNumber, otp, otpUuid)

    if (isSuccessful) {
      // const res = await fetchAvatar(mobileNumber)
      // const user = res.data
      // if (user) {
      //   if (user.rpmId && setAvatarData && setRPMUserId) {
      //     if (user.avatarUrl) {
      //       setAvatarData({ avatarPath: user.avatarUrl })
      //       localStorage.setItem('avatarPath', user.avatarUrl)
      //     }
      //     setRPMUserId(user.rpmId)
      //     localStorage.setItem('rpmUserId', user.rpmId)
      //   }
      // }
      handleLoginSuccess()
    }

    setIsLoading(false)

    if (!isSuccessful) {
      setErrorMessage(data.message || 'Something went wrong')
      setOTP('')
    } else {
      setErrorMessage('')
    }
  }

  const handleRegister = async () => {
    if (!signup) return
    setIsLoading(true)
    const [isSuccessful, data] = await signup({
      name,
      mobile: mobileNumber,
      email,
      pincode,
      otp,
      otp_uuid: otpUuid,
    })
    setIsLoading(false)

    if (isSuccessful) {
      setRegistrationSuccess(true)
      // Clear all form fields
      setOTP('')
      setErrorMessage('')
    } else {
      setErrorMessage(data.message || 'Something went wrong')
      setOTP('')
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
    setName(value);
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(value);
  };

  const handleClose = () => {
    HUDStore.getState().setShowMeteorLoginRegister(false)
    if(genericStore.getState().isTutorialEnabled){
      PlayerConfigStore.getState().isPlayerParalysedRef.current = true
    }
  }

  const handleLoginSuccess = () => {
    AuthAPIStore.setState({ isLoggedIn: true });
    startProgressBar();
  }


  const startProgressBar = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      if (progress >= 100) {
        clearInterval(interval);
        closeAndStartMining();
      }
    }, 40); // 40ms * 50 steps = 2000ms (2 seconds)
  }

  const closeAndStartMining = () => {
    HUDStore.getState().setShowMeteorLoginRegister(false);
    if(genericStore.getState().isTutorialEnabled){
      PlayerConfigStore.getState().isPlayerParalysedRef.current = true
    }
    const currentMeteorIndex = MeteorManagerStore.getState().currentlyInteractingWithMeteorIndex;
    if (currentMeteorIndex !== null) {
      MeteorManagerStore.getState().startMining(currentMeteorIndex);
    }
  }

  return (
    <>
      {(
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-md rounded-xl bg-[#17082FB2] p-8 backdrop-blur-md">
            {/* Add close button */}
            <button
              className="absolute right-4 top-4 text-white hover:text-[#C599FF]"
              onClick={handleClose}
            >
              <IoCloseSharp size={24} />
            </button>

            {/* Rest of your existing modal content */}
            {!registrationSuccess ? (
              <>
                {mode === Mode.INITIAL && (
                  <>
                    <h1 className="text-2xl text-center text-white mb-4">
                      Join the Meteor Gem Rush!
                    </h1>
                    <p className="text-sm text-center text-white mb-6">
                      Ready for a cosmic treasure hunt? Login or register to participate in the Meteor Gem Rush game!
                    </p>
                    <div className="flex flex-col space-y-3">
                      <GradientBorder className="-skew-x-[10deg] rounded-md">
                        <Button
                          classNames="w-full !skew-x-0 !border-none text-white"
                          onClick={() => setMode(Mode.LOGIN)}
                        >
                          Login
                        </Button>
                      </GradientBorder>
                      <GradientBorder className="-skew-x-[10deg] rounded-md">
                        <Button
                          classNames="w-full !skew-x-0 !border-none text-white"
                          onClick={() => setMode(Mode.REGISTER)}
                        >
                          Register
                        </Button>
                      </GradientBorder>
                    </div>
                  </>
                )}

                {mode === Mode.LOGIN && (
                  <>
                    <h1 className="text-2xl text-center text-white mb-4">
                      Login to Your Senco Account
                    </h1>
                    <div className="flex flex-col space-y-3">
                      <div className="flex flex-col gap-1">
                        <label htmlFor="mobileNumber" className="text-white text-sm">
                          Mobile Number
                        </label>
                        <input
                          id="mobileNumber"
                          type="tel"
                          className="w-full rounded-md border border-[#C599FFCF] bg-[#17082F80] px-3 py-2 text-[#C599FF] text-sm"
                          value={mobileNumber}
                          onChange={handleMobileNumberChange}
                          placeholder="Enter 10-digit mobile number"
                          maxLength={10}
                        />
                      </div>
                      {isOTPSent && (
                        <div className="flex flex-col gap-1">
                          <label htmlFor="otp" className="text-white text-sm">
                            OTP
                          </label>
                          <input
                            id="otp"
                            type="text"
                            className="w-full rounded-md border border-[#C599FFCF] bg-[#17082F80] px-3 py-2 text-[#C599FF] text-sm"
                            value={otp}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              setOTP(value);
                            }}
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                          />
                        </div>
                      )}
                      <GradientBorder className={`-skew-x-[10deg] rounded-md ${!validateMobileNumber(mobileNumber) || (isOTPSent && otp.length !== 6) ? 'opacity-50' : ''}`}>
                        <Button
                          classNames={`w-full !skew-x-0 !border-none text-white ${!validateMobileNumber(mobileNumber) || (isOTPSent && otp.length !== 6) ? 'cursor-not-allowed' : ''}`}
                          disabled={!validateMobileNumber(mobileNumber) || (isOTPSent && otp.length !== 6)}
                          onClick={isOTPSent ? handleLogin : handleSendOTP}
                          isLoading={isLoading}
                        >
                          {isOTPSent ? 'Login' : 'Send OTP'}
                        </Button>
                      </GradientBorder>
                    </div>
                    <p className="text-center text-white text-sm mt-3">
                      No account?{' '}
                      <a
                        href="#"
                        onClick={() => setMode(Mode.REGISTER)}
                        className="text-[#C599FF] underline"
                      >
                        Register here
                      </a>
                    </p>
                  </>
                )}

                {mode === Mode.REGISTER && (
                  <>
                    <h1 className="text-2xl text-center text-white mb-4">
                      Register for a Senco Account
                    </h1>
                    <div className="flex flex-col space-y-3">
                      <div className="flex flex-col gap-1">
                        <label htmlFor="name" className="text-white text-sm">
                          Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          className="w-full rounded-md border border-[#C599FFCF] bg-[#17082F80] px-3 py-2 text-[#C599FF] text-sm"
                          value={name}
                          onChange={handleNameChange}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label htmlFor="mobileNumber" className="text-white text-sm">
                          Mobile Number
                        </label>
                        <input
                          id="mobileNumber"
                          type="tel"
                          className="w-full rounded-md border border-[#C599FFCF] bg-[#17082F80] px-3 py-2 text-[#C599FF] text-sm"
                          value={mobileNumber}
                          onChange={handleMobileNumberChange}
                          placeholder="Enter 10-digit mobile number"
                          maxLength={10}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label htmlFor="email" className="text-white text-sm">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          className="w-full rounded-md border border-[#C599FFCF] bg-[#17082F80] px-3 py-2 text-[#C599FF] text-sm"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label htmlFor="pincode" className="text-white text-sm">
                          Pincode
                        </label>
                        <input
                          id="pincode"
                          type="text"
                          className="w-full rounded-md border border-[#C599FFCF] bg-[#17082F80] px-3 py-2 text-[#C599FF] text-sm"
                          value={pincode}
                          onChange={handlePincodeChange}
                          placeholder="Enter 6-digit pincode"
                          maxLength={6}
                        />
                      </div>
                      {isOTPSent && (
                        <div className="flex flex-col gap-1">
                          <label htmlFor="otp" className="text-white text-sm">
                            OTP
                          </label>
                          <input
                            id="otp"
                            type="text"
                            className="w-full rounded-md border border-[#C599FFCF] bg-[#17082F80] px-3 py-2 text-[#C599FF] text-sm"
                            value={otp}
                            onChange={(e) => setOTP(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                          />
                        </div>
                      )}
                      <GradientBorder className={`-skew-x-[10deg] rounded-md ${!isRegistrationValid() || (isOTPSent && otp.length !== 6) ? 'opacity-50' : ''}`}>
                        <Button
                          classNames={`w-full !skew-x-0 !border-none text-white ${!isRegistrationValid() || (isOTPSent && otp.length !== 6) ? 'cursor-not-allowed' : ''}`}
                          disabled={!isRegistrationValid() || (isOTPSent && otp.length !== 6)}
                          onClick={isOTPSent ? handleRegister : handleSendOTP}
                          isLoading={isLoading}
                        >
                          {isOTPSent ? 'Register' : 'Send OTP'}
                        </Button>
                      </GradientBorder>
                    </div>
                    <p className="text-center text-white text-sm mt-3">
                      Already have an account?{' '}
                      <a
                        href="#"
                        onClick={() => setMode(Mode.LOGIN)}
                        className="text-[#C599FF] underline"
                      >
                        Login here
                      </a>
                    </p>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center space-y-6">
                <h1 className="text-2xl text-center text-white">
                  Congratulations, you are successfully registered!
                </h1>
                <p className="text-sm text-center text-white">
                  Please click the button below to login with your new account
                </p>
                <GradientBorder className="-skew-x-[10deg] rounded-md">
                  <Button
                    classNames="w-full !skew-x-0 !border-none text-white"
                    onClick={() => {
                      setRegistrationSuccess(false)
                      setMode(Mode.LOGIN)
                      // Reset all form fields
                      setMobileNumber('')
                      setOTP('')
                      setName('')
                      setEmail('')
                      setPincode('')
                      setIsOTPSent(false)
                      setErrorMessage('')
                    }}
                  >
                    Login Now
                  </Button>
                </GradientBorder>
              </div>
            )}

            {errorMessage && (
              <div className="flex justify-center mt-3">
                <Error text={errorMessage} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MeteorLoginRegister;
