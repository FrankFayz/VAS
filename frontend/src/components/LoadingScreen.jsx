import VasCameraIcon from './VasCameraIcon'

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <span className="mx-auto inline-flex h-20 w-20">
          <VasCameraIcon className="h-full w-full" />
        </span>
        <p className="mt-4 font-block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Loading VAS...
        </p>
      </div>
    </div>
  )
}
