import { Loader2 } from 'lucide-react'

export default function Loader() {
  return (
    <div className='flex items-center justify-center h-screen fixed inset-0 bg-white/50 z-50'>
      <Loader2 className='animate-spin' size={40} />
    </div>
  )
}
