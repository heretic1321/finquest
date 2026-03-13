import React, { useState } from 'react'
import { AuthAPIStore } from '@client/contexts/AuthContext'

type UserType = 'student' | 'working' | null

const FinQuestOnboarding: React.FC = () => {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [userType, setUserType] = useState<UserType>(null)
  const continueAsGuest = AuthAPIStore((state) => state.continueAsGuest)

  const isValid = name.trim().length >= 2 && age.trim() !== '' && userType !== null

  const handleSubmit = () => {
    if (!isValid) return
    // Store user profile in localStorage for game use
    localStorage.setItem('finquest_player', JSON.stringify({
      name: name.trim(),
      age: parseInt(age),
      type: userType,
    }))
    continueAsGuest(name.trim())
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
      </div>
    </>
  )
}

export default FinQuestOnboarding
