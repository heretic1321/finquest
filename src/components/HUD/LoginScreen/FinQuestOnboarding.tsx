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
      <h2 className='mb-6 text-center text-2xl font-semibold'>
        Tell us about yourself
      </h2>

      <div className='flex flex-col gap-4'>
        {/* Name */}
        <div className='flex flex-col gap-1.5'>
          <label className='text-sm text-slate-300'>Your Name</label>
          <input
            className='rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/30'
            type='text'
            placeholder='What should we call you?'
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
          />
        </div>

        {/* Age */}
        <div className='flex flex-col gap-1.5'>
          <label className='text-sm text-slate-300'>Your Age</label>
          <input
            className='rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/30'
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
          <label className='text-sm text-slate-300'>Mobile Number</label>
          <input
            className='rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/30'
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
          <label className='text-sm text-slate-300'>Gender</label>
          <div className='flex gap-3'>
            <button
              className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                gender === 'male'
                  ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
              }`}
              onClick={() => {
                setGender('male')
                setAvatarPath(MALE_AVATAR)
              }}
            >
              Male
            </button>
            <button
              className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                gender === 'female'
                  ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
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
          <label className='text-sm text-slate-300'>Choose your avatar</label>
          <div className='grid grid-cols-2 gap-3'>
            <button
              type='button'
              onClick={() => {
                setGender('male')
                setAvatarPath(MALE_AVATAR)
              }}
              className={`rounded-lg border p-2 transition ${
                avatarPath === MALE_AVATAR
                  ? 'border-emerald-400 bg-emerald-400/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <img
                src={MALE_AVATAR}
                alt='Male Avatar'
                className='mx-auto h-24 w-full rounded-md object-cover object-top'
              />
              <p className='mt-2 text-center text-xs text-slate-300'>Male Avatar</p>
            </button>

            <button
              type='button'
              onClick={() => {
                setGender('female')
                setAvatarPath(FEMALE_AVATAR)
              }}
              className={`rounded-lg border p-2 transition ${
                avatarPath === FEMALE_AVATAR
                  ? 'border-emerald-400 bg-emerald-400/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <img
                src={FEMALE_AVATAR}
                alt='Female Avatar'
                className='mx-auto h-24 w-full rounded-md object-cover object-top'
              />
              <p className='mt-2 text-center text-xs text-slate-300'>Female Avatar</p>
            </button>
          </div>
        </div>

        {/* Student or Working */}
        <div className='flex flex-col gap-1.5'>
          <label className='text-sm text-slate-300'>I am a...</label>
          <div className='flex gap-3'>
            <button
              className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                userType === 'student'
                  ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
              }`}
              onClick={() => setUserType('student')}
            >
              Student
            </button>
            <button
              className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                userType === 'working'
                  ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
              }`}
              onClick={() => setUserType('working')}
            >
              Working Professional
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          className={`mt-4 w-full rounded-lg py-3.5 text-base font-semibold transition ${
            isValid
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400'
              : 'cursor-not-allowed bg-white/10 text-slate-500'
          }`}
          disabled={!isValid}
          onClick={handleSubmit}
        >
          Start My Journey
        </button>

        {/* Dev skip */}
        <button
          className='mt-2 w-full rounded-lg border border-white/5 py-2.5 text-sm text-slate-500 transition hover:border-white/10 hover:text-slate-300'
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
          className='mt-1 w-full rounded-lg border border-indigo-400/30 bg-indigo-500/10 py-2.5 text-sm font-medium text-indigo-200 transition hover:bg-indigo-500/20'
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
