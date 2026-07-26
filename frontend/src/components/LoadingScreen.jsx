import VasCameraIcon from './VasCameraIcon'

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080c14]">
      <div className="text-center">
        <VasCameraIcon className="mx-auto h-16 w-24" />
        <p className="mt-4 font-block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Loading VAS...
        </p>
      </div>
    </div>
  )
}
