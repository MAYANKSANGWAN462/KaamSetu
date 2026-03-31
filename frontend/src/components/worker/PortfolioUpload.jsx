// Purpose: Handles portfolio image upload with drag-and-drop, previews, and remove functionality.
import { useState, useRef, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const PortfolioUpload = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const inputRef = useRef(null)

  const uploadFiles = async (files) => {
    setUploading(true)
    const newImages = []

    for (const file of files) {
      const id = `${file.name}-${Date.now()}`
      setUploadProgress(prev => ({ ...prev, [id]: 0 }))

      const formData = new FormData()
      formData.append('image', file)

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/upload`,
          formData,
          {
            onUploadProgress: (e) => {
              const pct = Math.round((e.loaded * 100) / e.total)
              setUploadProgress(prev => ({ ...prev, [id]: pct }))
            },
          }
        )
        newImages.push(response.data.url)
        toast.success(`${file.name} uploaded`)
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      } finally {
        setUploadProgress(prev => {
          const next = { ...prev }
          delete next[id]
          return next
        })
      }
    }

    setImages(prev => {
      const updated = [...prev, ...newImages]
      onUpload(updated)
      return updated
    })
    setUploading(false)
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length) uploadFiles(files)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length) uploadFiles(files)
  }, [])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false)
  }

  const removeImage = (idx) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== idx)
      onUpload(updated)
      return updated
    })
  }

  const activeUploads = Object.keys(uploadProgress).length

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        animate={{
          borderColor: isDragging ? 'rgb(251,191,36)' : 'rgb(209,213,219)',
          backgroundColor: isDragging ? 'rgba(251,191,36,0.04)' : 'transparent',
          scale: isDragging ? 1.01 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors duration-200 cursor-pointer
          dark:border-white/20 dark:hover:border-amber-500/50 hover:border-amber-400
          group"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="portfolio-upload"
        />

        <AnimatePresence mode="wait">
          {isDragging ? (
            <motion.div
              key="dragging"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-amber-600 dark:text-amber-400 font-semibold text-sm">Drop images here!</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center group-hover:bg-amber-50 dark:group-hover:bg-amber-500/10 transition-colors duration-200">
                {uploading ? (
                  <svg className="animate-spin w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-amber-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200">
                  {uploading
                    ? `Uploading ${activeUploads} image${activeUploads > 1 ? 's' : ''}…`
                    : 'Click to upload or drag & drop'
                  }
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  PNG, JPG, WEBP up to 10MB each
                </p>
              </div>

              {!uploading && (
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white
                    bg-gradient-to-r from-amber-500 to-orange-500
                    shadow-md shadow-amber-500/20 hover:shadow-amber-500/35
                    transition-shadow duration-200 pointer-events-none"
                >
                  Browse Files
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Image Grid */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3"
          >
            {images.map((img, idx) => (
              <motion.div
                key={img}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ delay: idx * 0.05 }}
                className="relative group rounded-xl overflow-hidden aspect-square"
              >
                <img
                  src={img}
                  alt={`Portfolio ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={(e) => { e.stopPropagation(); removeImage(idx) }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200
                      w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                {/* Index badge */}
                <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-white">
                  {idx + 1}
                </div>
              </motion.div>
            ))}

            {/* Add more tile */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-white/15
                hover:border-amber-400 dark:hover:border-amber-500/50
                flex flex-col items-center justify-center gap-1
                text-gray-400 hover:text-amber-500
                transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[10px] font-semibold">Add more</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Count info */}
      {images.length > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          {images.length} image{images.length > 1 ? 's' : ''} uploaded · Hover to remove
        </p>
      )}
    </div>
  )
}

export default PortfolioUpload