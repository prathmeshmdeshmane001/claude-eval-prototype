import React, { createContext, useContext, useState } from 'react'
import type { CalibrationProfile } from '../lib/calibrationProfile'
import { loadProfile, saveProfile } from '../lib/userProfile'

interface UserProfileContextValue {
  profile: CalibrationProfile | null
  updateProfile: (p: CalibrationProfile) => void
  isEditing: boolean
  openEditor: () => void
  closeEditor: () => void
}

const UserProfileContext = createContext<UserProfileContextValue | null>(null)

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile,   setProfile]   = useState<CalibrationProfile | null>(() => loadProfile())
  const [isEditing, setIsEditing] = useState(false)

  const updateProfile = (p: CalibrationProfile) => {
    saveProfile(p)
    setProfile(p)
    setIsEditing(false)
  }

  return (
    <UserProfileContext.Provider value={{
      profile,
      updateProfile,
      isEditing,
      openEditor:  () => setIsEditing(true),
      closeEditor: () => setIsEditing(false),
    }}>
      {children}
    </UserProfileContext.Provider>
  )
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext)
  if (!ctx) throw new Error('useUserProfile must be used within UserProfileProvider')
  return ctx
}
