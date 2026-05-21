import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mail, AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import axiosInstance from '@/lib/axiosInstance'
import { toast } from 'sonner'

export default function CheckYourEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isResending, setIsResending] = useState(false)
  const [resendError, setResendError] = useState(null)

  // Lấy email từ state được pass khi navigate
  const email = location.state?.email || sessionStorage.getItem('pendingVerificationEmail') || ''
  const emailError = location.state?.emailError || ''

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-3">⚠️ Không tìm thấy email</h1>
            <p className="text-slate-600 mb-6">Vui lòng kiểm tra lại quy trình đăng ký.</p>
            <Button 
              onClick={() => navigate('/register')}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              Quay lại đăng ký
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleResendEmail = async () => {
    setIsResending(true)
    setResendError(null)
    try {
      const res = await axiosInstance.post('/auth/resend-verification-email', { email })
      toast.success('Email xác thực đã được gửi lại!')
      setResendError(null)
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Không thể gửi lại email. Vui lòng thử lại sau.'
      setResendError(errMsg)
      toast.error(errMsg)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Illustration */}
          <div className="flex justify-center mb-8">
            <div className="relative w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-12 h-12 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-2xl font-bold text-slate-800 mb-3">
            📬 Kiểm tra email của bạn!
          </h1>
          <p className="text-slate-600 mb-2">
            Chúng tôi đã gửi mã xác thực tới:
          </p>
          <p className="text-lg font-semibold text-primary mb-6 break-all">
            {email}
          </p>

          {emailError && (
            <div className="mb-6 p-4 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-100 text-sm">
              {emailError}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-slate-700 font-semibold mb-2">📋 Hướng dẫn:</p>
            <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
              <li>Mở email từ TicketRush</li>
              <li>Nhấp vào link "Xác thực email"</li>
              <li>Bạn sẽ được chuyển hướng tới trang đăng nhập</li>
              <li>✨ Hoàn tất! Đăng nhập để tiếp tục</li>
            </ol>
            <p className="text-xs text-slate-500 mt-3 italic">
              💡 Link sẽ hết hạn sau <strong>24 giờ</strong>
            </p>
          </div>

          {/* Error Message */}
          {resendError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{resendError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              {isResending ? (
                <>
                  <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Gửi lại mã xác thực
                </>
              )}
            </Button>
            <Button 
              onClick={() => navigate('/login')}
              variant="outline"
              className="w-full"
            >
              Đã có mã xác thực? Đi tới đăng nhập
            </Button>
            <Button 
              onClick={() => navigate('/register')}
              variant="ghost"
              className="w-full"
            >
              Quay lại đăng ký
            </Button>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-slate-200 space-y-2">
            <p className="text-sm text-slate-600">
              <span className="font-semibold">Không nhận được email?</span>
            </p>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• Kiểm tra thư mục Spam/Junk</li>
              <li>• Chờ vài phút rồi tải lại email</li>
              <li>• Thử gửi lại mã ở trên</li>
            </ul>
            <p className="text-xs text-slate-500 pt-2">
              Vẫn có vấn đề? <a href="/support" className="text-primary hover:underline font-medium">Liên hệ hỗ trợ</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
