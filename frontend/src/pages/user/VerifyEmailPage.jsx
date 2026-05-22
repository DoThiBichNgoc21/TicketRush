import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import axiosInstance from '@/lib/axiosInstance'
import { toast } from 'sonner'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading | success | error | expired
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    let timer = null

    const verifyToken = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setStatus('error')
        setMessage('Token không hợp lệ. Vui lòng kiểm tra lại link xác thực.')
        return
      }

      try {
        const res = await axiosInstance.get(`/auth/verify-email?token=${token}`)
        setStatus('success')
        setMessage(res.data?.message || 'Xác thực email thành công!')
        setEmail(res.data?.email || '')

        // Tự động chuyển hướng sau 3 giây
        timer = setTimeout(() => {
          navigate('/login')
        }, 3000)
      } catch (error) {
        const errMsg = error.response?.data?.message || 'Có lỗi xảy ra'
        const isExpired = error.response?.status === 410

        setStatus(isExpired ? 'expired' : 'error')
        setMessage(errMsg)
        setEmail(error.response?.data?.email || '')
        toast.error(errMsg)
      }
    }

    verifyToken()

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [searchParams, navigate])

  const handleResendEmail = async () => {
    if (!email) return
    try {
      await axiosInstance.post('/auth/resend-verification-email', { email })
      toast.success('Email xác thực đã được gửi lại. Vui lòng kiểm tra email của bạn.')
      setStatus('loading')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi gửi lại email')
    }
  }

  const handleGoToLogin = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Loading State */}
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="animate-spin">
                  <Loader className="w-16 h-16 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-3">Đang xác thực email...</h1>
              <p className="text-slate-600">Vui lòng chờ trong giây lát</p>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-3">✅ Xác thực thành công!</h1>
              <p className="text-slate-600 mb-6">{message}</p>
              <p className="text-sm text-slate-500 mb-6">Bạn sẽ được chuyển hướng tới trang đăng nhập trong giây lát...</p>
              <Button 
                onClick={handleGoToLogin}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                Tiến hành đăng nhập ngay
              </Button>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <AlertCircle className="w-16 h-16 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-3">❌ Lỗi xác thực</h1>
              <p className="text-slate-600 mb-6">{message}</p>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/register')}
                  variant="outline"
                  className="w-full"
                >
                  Quay lại đăng ký
                </Button>
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                >
                  Đi tới đăng nhập
                </Button>
              </div>
            </>
          )}

          {/* Expired State */}
          {status === 'expired' && (
            <>
              <div className="flex justify-center mb-6">
                <AlertCircle className="w-16 h-16 text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-3">⏱️ Link đã hết hạn</h1>
              <p className="text-slate-600 mb-6">{message}</p>
              <p className="text-sm text-slate-500 mb-6">
                Link xác thực chỉ có hiệu lực trong 24 giờ. Vui lòng yêu cầu gửi lại mã.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={handleResendEmail}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                >
                  🔄 Gửi lại mã xác thực
                </Button>
                <Button 
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="w-full"
                >
                  Đi tới đăng nhập
                </Button>
              </div>
            </>
          )}

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Cần giúp đỡ? <a href="/support" className="text-primary hover:underline font-medium">Liên hệ hỗ trợ</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
