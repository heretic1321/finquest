import React, { useState } from 'react'
import { AuthAPIStore } from '@client/contexts/AuthContext'
import { UIFlowStore } from '@client/ui_flows'

type UserType = 'student' | 'working' | null
type GenderType = 'male' | 'female' | null

const MALE_AVATAR = '/assets/ui/avatars/player_avatar_male.png'
const FEMALE_AVATAR = '/assets/ui/avatars/player_avatar_female.png'

const FinQuestOnboarding: React.FC = () => {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [userType, setUserType] = useState<UserType>(null)
  const [gender, setGender] = useState<GenderType>(null)
  const [avatarPath, setAvatarPath] = useState<string>(MALE_AVATAR)
  const continueAsGuest = AuthAPIStore((state) => state.continueAsGuest)
  const openUIFlow = UIFlowStore((state) => state.openUIFlow)

  const isValid =
    name.trim().length >= 2 &&
    age.trim() !== '' &&
    mobileNumber.trim().length >= 10 &&
    userType !== null &&
    gender !== null

  const handleSubmit = () => {
    if (!isValid) return
    // Store user profile in localStorage for game use
    localStorage.setItem('finquest_player', JSON.stringify({
      name: name.trim(),
      age: parseInt(age),
      mobileNumber: mobileNumber.trim(),
      gender,
      avatarPath,
      type: userType,
    }))
    continueAsGuest(name.trim())
    window.setTimeout(() => {
      openUIFlow('laxmi-intro', { source: 'login' })
    }, 80)
  }

  return (
    <>
      <h2 className='mb-6 text-center text-xl font-black uppercase tracking-tight text-white'>
        Enter Your Details
      </h2>

      <div className='flex flex-col gap-4'>
        {/* Name */}
        <div className='flex flex-col gap-1.5'>
          <label className='font-mono text-xs uppercase tracking-wider text-neutral-500'>Your Name</label>
          <input
            className='rounded-none border-2 border-neutral-700 bg-black px-4 py-3 font-mono text-white placeholder:text-neutral-600 outline-none focus:border-[#00ff88]'
            type='text'
            placeholder='What should we call you?'
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
          />
        </div>

        {/* Age */}
        <div className='flex flex-col gap-1.5'>
          <label className='font-mono text-xs uppercase tracking-wider text-neutral-500'>Your Age</label>
          <input
            className='rounded-none border-2 border-neutral-700 bg-black px-4 py-3 font-mono text-white placeholder:text-neutral-600 outline-none focus:border-[#00ff88]'
            type='number'
            placeholder='e.g. 21'
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min={14}
            max={60}
          />
        </div>

        {/* Mobile Number */}
        <div className='flex flex-col gap-1.5'>
          <label className='font-mono text-xs uppercase tracking-wider text-neutral-500'>Mobile Number</label>
          <input
            className='rounded-none border-2 border-neutral-700 bg-black px-4 py-3 font-mono text-white placeholder:text-neutral-600 outline-none focus:border-[#00ff88]'
            type='tel'
            placeholder='e.g. 9876543210'
            value={mobileNumber}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10)
              setMobileNumber(digitsOnly)
            }}
            inputMode='numeric'
            maxLength={10}
          />
        </div>

        {/* Gender */}
        <div className='flex flex-col gap-1.5'>
          <label className='font-mono text-xs uppercase tracking-wider text-neutral-500'>Gender</label>
          <div className='flex gap-3'>
            <button
              className={`flex-1 rounded-none border-2 px-4 py-3 text-sm font-bold uppercase tracking-wider transition ${
                gender === 'male'
                  ? 'border-[#00ff88] bg-[#00ff88] text-black shadow-[3px_3px_0_white]'
                  : 'border-neutral-700 bg-black text-neutral-400 hover:border-neutral-500'
              }`}
              onClick={() => {
                setGender('male')
                setAvatarPath(MALE_AVATAR)
              }}
            >
              Male
            </button>
            <button
              className={`flex-1 rounded-none border-2 px-4 py-3 text-sm font-bold uppercase tracking-wider transition ${
                gender === 'female'
                  ? 'border-[#00ff88] bg-[#00ff88] text-black shadow-[3px_3px_0_white]'
                  : 'border-neutral-700 bg-black text-neutral-400 hover:border-neutral-500'
              }`}
              onClick={() => {
                setGender('female')
                setAvatarPath(FEMALE_AVATAR)
              }}
            >
              Female
            </button>
          </div>
        </div>

        {/* Avatar selector */}
        <div className='flex flex-col gap-1.5'>
          <label className='font-mono text-xs uppercase tracking-wider text-neutral-500'>Choose your avatar</label>
          <div className='grid grid-cols-2 gap-3'>
            <button
              type='button'
              onClick={() => {
                setGender('male')
                setAvatarPath(MALE_AVATAR)
              }}
              className={`rounded-none border-2 bg-black p-2 transition ${
                avatarPath === MALE_AVATAR
                  ? 'border-[#00ff88] shadow-[4px_4px_0_#00ff88]'
                  : 'border-neutral-700 hover:border-neutral-500'
              }`}
            >
              <img
                src={MALE_AVATAR}
                alt='Male Avatar'
                className='mx-auto h-24 w-full rounded-none object-cover object-top'
              />
              <p className='mt-2 text-center font-mono text-xs uppercase tracking-wider text-neutral-500'>Male Avatar</p>
            </button>

            <button
              type='button'
              onClick={() => {
                setGender('female')
                setAvatarPath(FEMALE_AVATAR)
              }}
              className={`rounded-none border-2 bg-black p-2 transition ${
                avatarPath === FEMALE_AVATAR
                  ? 'border-[#00ff88] shadow-[4px_4px_0_#00ff88]'
                  : 'border-neutral-700 hover:border-neutral-500'
              }`}
            >
              <img
                src={FEMALE_AVATAR}
                alt='Female Avatar'
                className='mx-auto h-24 w-full rounded-none object-cover object-top'
              />
              <p className='mt-2 text-center font-mono text-xs uppercase tracking-wider text-neutral-500'>Female Avatar</p>
            </button>
          </div>
        </div>

        {/* Student or Working */}
        <div className='flex flex-col gap-1.5'>
          <label className='font-mono text-xs uppercase tracking-wider text-neutral-500'>I am a...</label>
          <div className='flex gap-3'>
            <button
              className={`flex-1 rounded-none border-2 px-4 py-3 text-sm font-bold uppercase tracking-wider transition ${
                userType === 'student'
                  ? 'border-[#00ff88] bg-[#00ff88] text-black shadow-[3px_3px_0_white]'
                  : 'border-neutral-700 bg-black text-neutral-400 hover:border-neutral-500'
              }`}
              onClick={() => setUserType('student')}
            >
              Student
            </button>
            <button
              className={`flex-1 rounded-none border-2 px-4 py-3 text-sm font-bold uppercase tracking-wider transition ${
                userType === 'working'
                  ? 'border-[#00ff88] bg-[#00ff88] text-black shadow-[3px_3px_0_white]'
                  : 'border-neutral-700 bg-black text-neutral-400 hover:border-neutral-500'
              }`}
              onClick={() => setUserType('working')}
            >
              Working Professional
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          className={`mt-4 w-full rounded-none py-4 text-base font-bold uppercase tracking-wider transition-all ${
            isValid
              ? 'border-2 border-[#00ff88] bg-[#00ff88] text-black shadow-[4px_4px_0_white] hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
              : 'cursor-not-allowed border-2 border-neutral-800 bg-neutral-900 text-neutral-700 shadow-none'
          }`}
          disabled={!isValid}
          onClick={handleSubmit}
        >
          Start My Journey
        </button>

        {/* Dev skip */}
        <button
          className='mt-2 w-full rounded-none border-2 border-neutral-800 py-2.5 text-xs uppercase tracking-wider text-neutral-600 transition hover:border-neutral-600 hover:text-neutral-400'
          onClick={() => {
            localStorage.setItem('finquest_player', JSON.stringify({
              name: 'Dev',
              age: 21,
              mobileNumber: '9999999999',
              gender: 'male',
              avatarPath: MALE_AVATAR,
              type: 'student',
            }))
            continueAsGuest('Dev')
            window.setTimeout(() => {
              openUIFlow('laxmi-intro', { source: 'login' })
            }, 80)
          }}
        >
          Skip (Dev Mode)
        </button>

        <button
          className='mt-1 w-full rounded-none border-2 border-[#ffcc00] py-2.5 text-xs font-medium uppercase tracking-wider text-[#ffcc00] transition hover:bg-[#ffcc00] hover:text-black'
          onClick={() =>
            openUIFlow('login-flow-gallery', { source: 'login' })
          }
        >
          UI Flows (Test)
        </button>
      </div>
    </>
  )
}

export default FinQuestOnboarding
