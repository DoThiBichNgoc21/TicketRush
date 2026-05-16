/**
 * Tạo một đối tượng ảnh từ URL
 */
export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // Tránh lỗi CORS
    image.src = url
  })

/**
 * Xử lý cắt ảnh và trả về Blob
 */
export async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  // Thiết lập kích thước canvas dựa trên vùng cắt
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // Vẽ phần ảnh đã cắt lên canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  // Chuyển đổi canvas thành Blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/jpeg')
  })
}
