import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../components/header'
import { Footer } from '../../components/footer'
import { User, Mail, Phone, MapPin, Save, Camera, ShieldCheck, Calendar, X as CloseIcon, Ticket, Star } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { toast } from 'sonner'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '../../lib/imageUtils'
import { supabase } from '../../lib/supabaseClient'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ProfilePage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(null)
  const [uploading, setUploading] = useState(false)
  
  // States for Image Cropping
  const [imageSrc, setImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [showCropper, setShowCropper] = useState(false)
  
  // New states for deferred upload
  const [tempAvatarBlob, setTempAvatarBlob] = useState(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    avatar_url: '',
    gender: '',
    birth_year: '',
  })

  useEffect(() => {
    const fetchUserData = async () => {
      const userRaw = localStorage.getItem('user_info')
      if (!userRaw) {
        toast.error('Vui lòng đăng nhập để xem hồ sơ')
        navigate('/login')
        return
      }

      const storedUser = JSON.parse(userRaw)
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/usermanagement/${storedUser.id}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Không thể tải thông tin người dùng')
        }

        const data = result.data

        if (!data) {
          toast.error('Không tìm thấy thông tin người dùng trong hệ thống')
          setLoading(false)
          return
        }

        // normalizeUser ở backend trả về camelCase, map lại cho form
        const rawUser = {
          id: storedUser.id,
          username: data.username,
          email: data.email,
          first_name: data.firstName || '',
          last_name: data.lastName || '',
          phone_number: data.phoneNumber || '',
          avatar_url: data.avatar || '',
          gender: data.gender || '',
          birth_year: data.birthYear || '',
          role: data.role,
          status: data.statusRaw,
          created_at: data.createdAt,
        }

        setUser(rawUser)
        setFormData({
          username: rawUser.username || '',
          email: rawUser.email || '',
          first_name: rawUser.first_name || '',
          last_name: rawUser.last_name || '',
          phone_number: rawUser.phone_number || '',
          avatar_url: rawUser.avatar_url || '',
          gender: rawUser.gender || '',
          birth_year: rawUser.birth_year || '',
        })
      } catch (error) {
        console.error('Error in fetchUserData:', error)
        toast.error('Có lỗi xảy ra khi tải thông tin hồ sơ')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [navigate])

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh!')
      return
    }

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setImageSrc(reader.result)
      setShowCropper(true)
    })
    reader.readAsDataURL(file)
  }

  const handleCropConfirm = async () => {
    setShowCropper(false)
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      if (!croppedImageBlob) return

      // Tạo URL xem trước tạm thời
      const previewUrl = URL.createObjectURL(croppedImageBlob)
      
      // Lưu vào state tạm thời
      setTempAvatarBlob(croppedImageBlob)
      setAvatarPreviewUrl(previewUrl)
      
      toast.info('Đã tải lên ảnh đại diện. Nhấn "Lưu thay đổi" để cập nhật.')
    } catch (error) {
      console.error('Crop error:', error)
      toast.error('Lỗi khi xử lý ảnh.')
    } finally {
      setImageSrc(null)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      let currentAvatarUrl = formData.avatar_url

      // 1. Nếu có ảnh mới chờ tải lên
      if (tempAvatarBlob) {
        const fileName = `${user.id}-${Date.now()}.jpg`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, tempAvatarBlob)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)
        
        currentAvatarUrl = publicUrl
      }

      // 2. Cập nhật thông tin người dùng qua backend API
      const updateResponse = await fetch(`${API_BASE_URL}/api/usermanagement/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.first_name,
          lastName: formData.last_name,
          phoneNumber: formData.phone_number,
          avatar_url: currentAvatarUrl,
        })
      })

      const updateResult = await updateResponse.json()
      if (!updateResponse.ok) throw new Error(updateResult.message || 'Không thể cập nhật hồ sơ')

      const updated = updateResult.data

      // Map camelCase từ backend về snake_case cho state
      const updatedUser = {
        ...user,
        first_name: updated.firstName || '',
        last_name: updated.lastName || '',
        phone_number: updated.phoneNumber || '',
        avatar_url: currentAvatarUrl,
      }

      localStorage.setItem('user_info', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setFormData(prev => ({ ...prev, avatar_url: currentAvatarUrl }))
      
      // Dọn dẹp state tạm thời
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl)
      }
      setTempAvatarBlob(null)
      setAvatarPreviewUrl(null)

      toast.success('Cập nhật hồ sơ và ảnh đại diện thành công!')
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error('Có lỗi xảy ra khi cập nhật hồ sơ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )

  if (!user) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold">Không tải được thông tin người dùng</h2>
        <Button onClick={() => window.location.reload()}>Thử lại</Button>
      </div>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
            {/* Header Profile - TicketRush Branded Banner */}
            <div className="bg-gradient-to-br from-red-700 via-red-600 to-orange-500 h-48 md:h-64 relative group/banner">
              {/* Background Patterns Container (with overflow-hidden) */}
              <div className="absolute inset-0 overflow-hidden rounded-t-3xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Ticket className="w-64 h-64 rotate-12 text-white" />
                </div>
                <div className="absolute -bottom-10 -left-10 p-8 opacity-5">
                  <Star className="w-48 h-48 -rotate-12 text-white" />
                </div>
              </div>

              {/* Banner Content (Left Aligned, Pushed Up) */}
              <div className="absolute inset-0 flex flex-col justify-start pt-10 md:pt-12 px-8 md:px-12 pointer-events-none z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg">
                    <Ticket className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white font-black text-2xl md:text-3xl tracking-tighter uppercase italic">TicketRush</span>
                </div>
                <h2 className="text-white/90 text-sm md:text-base font-bold max-w-md leading-tight">
                  Hệ thống đặt vé sự kiện hàng đầu Việt Nam. <br className="hidden md:block" />
                  Nơi khơi nguồn những trải nghiệm âm nhạc và giải trí đỉnh cao.
                </h2>
              </div>

              {/* Avatar Container (Centered) */}
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto z-20">
                <div className="relative group/avatar">
                  {/* Avatar Container */}
                  <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-[6px] border-background bg-secondary shadow-2xl overflow-hidden relative">
                    {avatarPreviewUrl || formData.avatar_url ? (
                      <img 
                        src={avatarPreviewUrl || formData.avatar_url} 
                        alt="Avatar" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <User className="w-16 h-16 md:w-24 md:h-24 text-slate-300" />
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 cursor-pointer">
                      <Camera className="w-8 h-8 text-white mb-1" />
                      <span className="text-white text-[10px] font-black uppercase tracking-widest">Thay ảnh</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleAvatarSelect}
                        disabled={uploading}
                      />
                    </label>
                    
                    {/* Uploading Spinner (during handleSave) */}
                    {(uploading || saving) && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>

                  {/* Mobile Camera Badge */}
                  <label className="absolute bottom-2 right-2 p-2.5 bg-white/90 backdrop-blur-md text-red-600 rounded-full shadow-xl hover:bg-white hover:scale-110 transition-all cursor-pointer border border-white/20 md:hidden">
                    <Camera className="w-5 h-5" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleAvatarSelect}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-24 px-8 md:px-12 pb-8">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4 mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                  </h1>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    Thành viên TicketRush
                  </p>
                </div>
                <div className="text-center px-4 py-2 bg-secondary rounded-2xl">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Vai trò</p>
                  <p className="font-bold text-primary capitalize">{user.role}</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="w-full space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tên đăng nhập (Read-only) */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" /> Tên đăng nhập
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  {/* Email (Read-only) */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  {/* Họ */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                      Họ
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      placeholder="Nhập họ của bạn"
                    />
                  </div>

                  {/* Tên */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                      Tên
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      placeholder="Nhập tên của bạn"
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      placeholder="0xxx xxx xxx"
                    />
                  </div>

                  {/* Ngày gia nhập (Read-only) */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Ngày tham gia
                    </label>
                    <input
                      type="text"
                      value={new Date(user.created_at).toLocaleDateString('vi-VN')}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  {/* Giới tính (Read-only) */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                      Giới tính
                    </label>
                    <input
                      type="text"
                      value={formData.gender || 'Chưa cập nhật'}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  {/* Năm sinh (Read-only) */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                      Năm sinh
                    </label>
                    <input
                      type="text"
                      value={formData.birth_year ? `${formData.birth_year} (${new Date().getFullYear() - Number(formData.birth_year)} tuổi)` : 'Chưa cập nhật'}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-2xl font-bold shadow-lg shadow-red-600/20 flex items-center gap-2"
                  >
                    {saving ? 'Đang lưu...' : (
                      <>
                        <Save className="w-5 h-5" /> Lưu thay đổi
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Image Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
          <div className="bg-card w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-xl font-bold">Chỉnh sửa ảnh đại diện</h3>
              <button 
                onClick={() => setShowCropper(false)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="relative h-96 w-full bg-muted">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Phóng to</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCropper(false)}
                  className="rounded-xl px-6"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleCropConfirm}
                  className="bg-primary text-primary-foreground rounded-xl px-8 font-bold"
                >
                  Xác nhận & Tải lên
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage
