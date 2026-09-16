import { EyeOff } from 'lucide-react'

interface PrivacyBannerProps {
  juniorName?: string
}

export default function PrivacyBanner({ juniorName = 'Manya' }: PrivacyBannerProps) {
  return (
    <div className="flex items-start gap-3 bg-[#faf9f5] border border-[#c96442]/30 shadow-ring-subtle rounded-xl px-4 py-3.5">
      <EyeOff size={16} className="text-[#c96442] flex-shrink-0 mt-0.5" />
      <p className="text-sm font-serif text-[#5e5d59] leading-relaxed">
        You are viewing{' '}
        <span className="text-[#141413] font-semibold">{juniorName}'s</span> evaluation log for an
        AI-assisted code task.{' '}
        <span className="text-[#141413] font-medium">
          The original conversation with Claude is private to the user and not shared.
        </span>
      </p>
    </div>
  )
}
