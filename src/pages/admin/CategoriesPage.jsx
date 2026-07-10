import { useEffect, useState } from 'react'
import { Loader2, Search, SearchX, Plus, Edit2, Trash2, Upload, X, CheckCircle2, AlertCircle, FolderOpen } from 'lucide-react'
import { PageHeader } from '@/components/custom/PageHeader'
import { LoadingSpinner } from '@/components/custom/LoadingSpinner'
import { EmptyState } from '@/components/custom/EmptyState'
import { AdminPagination } from '@/components/custom/AdminPagination'
import { useCategories } from '@/hooks/useCampaigns'

export function CategoriesPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [notification, setNotification] = useState(null)
  const { categories, isLoading } = useCategories()
  const limit = 12

  const filtered = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit))
  const paged = filtered.slice((page - 1) * limit, page * limit)

  useEffect(() => {
    setPage(1)
  }, [search])

  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleEdit = (cat) => {
    setEditingId(cat.id)
    setEditData({
      name: cat.name,
      description: cat.description || '',
    })
    setImagePreview(cat.image_url || null)
    setImageFile(null)
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('error', 'Image must be smaller than 5MB')
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
    setImagePreview(null)
    setImageFile(null)
    setIsCreating(false)
  }

  const handleSave = async () => {
    if (!editData.name.trim()) {
      showNotification('error', 'Category name is required')
      return
    }

    setIsSaving(true)
    try {
      // Step 1: Update category details (name, description)
      const updateResponse = await fetch(`/api/v1/campaigns/categories/${editingId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          name: editData.name,
          description: editData.description,
        }),
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update category details')
      }

      // Step 2: Upload image separately if provided
      if (imageFile) {
        const imageFormData = new FormData()
        imageFormData.append('image', imageFile)

        const imageResponse = await fetch(`/api/v1/campaigns/categories/${editingId}/upload-image/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: imageFormData,
        })

        if (!imageResponse.ok) {
          throw new Error('Failed to upload image')
        }
      }

      showNotification('success', 'Category updated successfully')
      handleCancel()
      // Refresh categories
      window.location.reload()
    } catch (error) {
      console.error('Error saving category:', error)
      showNotification('error', error.message || 'Failed to update category')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-1 space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg z-40 ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}

      <PageHeader
        title="Categories"
        description="Manage campaign categories and their images"
        actions={
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Category
          </button>
        }
      />

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <SearchX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No categories found"
          description={search ? 'Try a different search term' : 'Create a category to get started'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {paged.map((cat) => (
            <div key={cat.id} className="border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow">
              {/* Category Image */}
              <div className="h-32 bg-muted overflow-hidden">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Upload className="w-6 h-6" />
                  </div>
                )}
              </div>

              {/* Category Info */}
              <div className="p-3 space-y-2">
                <div>
                  <h3 className="font-semibold text-xs line-clamp-1">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{cat.slug}</p>
                </div>

                {cat.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{cat.description}</p>
                )}

                <div className="pt-2 border-t flex gap-1">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {filtered.length > 0 && (
        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} totalCount={filtered.length} limit={limit} />
      )}

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Edit Category</h2>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="p-1 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2">IMAGE</label>
                <div className="space-y-2">
                  {imagePreview && (
                    <div className="relative aspect-square bg-muted rounded-lg overflow-hidden border">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          setImagePreview(null)
                          setImageFile(null)
                        }}
                        disabled={isSaving}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-lg text-white hover:bg-black/70 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg hover:border-primary/50 cursor-pointer transition-colors disabled:opacity-50">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isSaving}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-muted-foreground">Max 5MB</p>
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">NAME *</label>
                <input
                  type="text"
                  value={editData.name || ''}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  disabled={isSaving}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background disabled:opacity-50"
                  placeholder="e.g., Medical & Health"
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">DESCRIPTION</label>
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  disabled={isSaving}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background resize-none disabled:opacity-50"
                  rows="3"
                  placeholder="Category description..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6 pt-4 border-t">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1 px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Category'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
