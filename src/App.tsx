import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserProfileProvider, useUserProfile } from './context/UserProfileContext'
import { EvaluationProvider } from './context/EvaluationContext'
import ConversationView from './routes/ConversationView'
import ManagerView from './routes/ManagerView'
import OnboardingModal from './components/OnboardingModal'
import { CHECKLIST_ITEMS, ITEM_3_SEED_NOTE } from './data/checklist'
import { RESEARCH_CHECKLIST_ITEMS, RESEARCH_ITEM_3_SEED_NOTE } from './data/researchChecklist'
import { ORG_CHECKLIST_ITEMS } from './data/orgChecks'

function AppRoutes() {
  const { profile, updateProfile, isEditing, closeEditor } = useUserProfile()

  const isManagerView = typeof window !== 'undefined' &&
    window.location.pathname.includes('manager')

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* ── Investment analysis scenario ─────────────────────────── */}
          <Route
            path="/"
            element={
              <EvaluationProvider
                key={profile?.lastUpdated ?? 'default'}
                orgChecklistData={ORG_CHECKLIST_ITEMS}
                checklistData={CHECKLIST_ITEMS}
                calibrationLabel={profile?.label ?? 'Business Analyst — Investment Research'}
                managerPath="/manager-view"
                seedNotes={{ '3': ITEM_3_SEED_NOTE }}
              >
                <ConversationView scenario="investment" />
              </EvaluationProvider>
            }
          />
          <Route path="/manager-view" element={<ManagerView scenario="investment" />} />

          {/* ── Research scenario ───────────────────────────────────────── */}
          <Route
            path="/research"
            element={
              <EvaluationProvider
                key={`research-${profile?.lastUpdated ?? 'default'}`}
                orgChecklistData={ORG_CHECKLIST_ITEMS}
                checklistData={RESEARCH_CHECKLIST_ITEMS}
                calibrationLabel={profile?.label ?? 'Researcher / Analyst'}
                managerPath="/research-manager"
                seedNotes={{ '3': RESEARCH_ITEM_3_SEED_NOTE }}
              >
                <ConversationView scenario="research" />
              </EvaluationProvider>
            }
          />
          <Route path="/research-manager" element={<ManagerView scenario="research" />} />
        </Routes>
      </BrowserRouter>

      {/* Onboarding — initial setup or editing */}
      {(!profile || isEditing) && !isManagerView && (
        <OnboardingModal
          initialProfile={profile ?? undefined}
          onComplete={updateProfile}
          onCancel={profile ? closeEditor : undefined}
        />
      )}
    </>
  )
}

export default function App() {
  return (
    <UserProfileProvider>
      <AppRoutes />
    </UserProfileProvider>
  )
}
