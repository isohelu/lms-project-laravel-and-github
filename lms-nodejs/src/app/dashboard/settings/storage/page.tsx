'use client'

import React, { useState, useEffect } from 'react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import LoadingButton from '@/components/loading-button'
import { AlertTriangle, CheckCircle2, HardDrive } from 'lucide-react'

export default function StorageSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [storageDriver, setStorageDriver] = useState<'local' | 's3' | 'r2' | 'bunny'>('local')
  const [fields, setFields] = useState({
    storage_driver: 'local',
    aws_access_key_id: '',
    aws_secret_access_key: '',
    aws_default_region: 'us-east-1',
    aws_bucket: '',
    r2_access_key_id: '',
    r2_secret_access_key: '',
    r2_bucket: '',
    r2_endpoint: '',
    r2_public_url: '',
    r2_region: 'auto',
    bunny_library_id: '',
    bunny_api_key: '',
    bunny_token_auth_key: '',
  })

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/settings/storage')
        if (res.ok) {
          const data = await res.json()
          if (data.settings) {
            setFields(prev => ({ ...prev, ...data.settings }))
            if (data.settings.storage_driver) {
              setStorageDriver(data.settings.storage_driver)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching storage settings:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMessage(null)

    try {
      const res = await fetch('/api/admin/settings/storage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, storage_driver: storageDriver }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMessage('Storage driver settings saved successfully.')
      } else {
        alert(data.message || 'Failed to update storage settings.')
      }
    } catch {
      alert('Error updating storage configuration.')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccessMessage(null), 4000)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-4">
        <Breadcrumbs
          title="Storage Settings"
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Settings' },
            { title: 'Storage Settings' },
          ]}
          className="mb-4"
        />

        <div className="md:px-3">
          {successMessage && (
            <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <Card className="p-4 sm:p-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <Label>Storage Driver *</Label>
                <Select
                  value={storageDriver}
                  onValueChange={(val) => {
                    const driver = val as 'local' | 's3' | 'r2' | 'bunny'
                    setStorageDriver(driver)
                    setFields(prev => ({ ...prev, storage_driver: driver }))
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select storage driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="s3">AWS S3</SelectItem>
                    <SelectItem value="r2">Cloudflare R2</SelectItem>
                    <SelectItem value="bunny">Bunny Stream</SelectItem>
                  </SelectContent>
                </Select>
                {storageDriver === 'bunny' && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Bunny only hosts lesson videos — it has no file storage of its own for images, documents, or course previews, so those keep using the local disk while Bunny is selected.
                  </p>
                )}
              </div>

              {(storageDriver === 's3' || storageDriver === 'r2') && (
                <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertTitle className="text-amber-800 dark:text-amber-200">
                    CORS must be configured on your bucket
                  </AlertTitle>
                  <AlertDescription className="text-amber-700 dark:text-amber-300 text-xs">
                    <p>
                      Videos and files now upload directly from the visitor&apos;s browser to your{' '}
                      {storageDriver === 's3' ? 'S3 bucket' : 'R2 bucket'} for speed — your server is no longer in the middle. The bucket must explicitly allow this, or uploads will fail.
                    </p>
                    <p className="mt-2">
                      In {storageDriver === 's3' ? 'the S3 console (Permissions → CORS)' : 'your R2 dashboard (Settings → CORS Policy)'}, add a rule allowing your site&apos;s domain, for example:
                    </p>
                    <pre className="mt-2 overflow-x-auto rounded bg-amber-100 p-2 font-mono text-[11px] whitespace-pre dark:bg-amber-900/40">
{`[
  {
    "AllowedOrigins": ["https://your-domain.com"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]`}
                    </pre>
                    <p className="mt-2">
                      <code>ExposeHeaders: [&quot;ETag&quot;]</code> is required — without it the browser can&apos;t read the value it needs to finish the upload, and every upload will fail.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {/* S3 Form Fields */}
              {storageDriver === 's3' && (
                <div className="space-y-4">
                  <div>
                    <Label>AWS Access Key ID *</Label>
                    <Input
                      value={fields.aws_access_key_id}
                      onChange={(e) => setFields({ ...fields, aws_access_key_id: e.target.value })}
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label>AWS Secret Access Key *</Label>
                    <Input
                      type="password"
                      value={fields.aws_secret_access_key}
                      onChange={(e) => setFields({ ...fields, aws_secret_access_key: e.target.value })}
                      placeholder="Enter secret access key"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label>AWS Region *</Label>
                    <Input
                      value={fields.aws_default_region}
                      onChange={(e) => setFields({ ...fields, aws_default_region: e.target.value })}
                      placeholder="us-east-1"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label>Bucket Name *</Label>
                    <Input
                      value={fields.aws_bucket}
                      onChange={(e) => setFields({ ...fields, aws_bucket: e.target.value })}
                      placeholder="my-lms-bucket"
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
              )}

              {/* R2 Form Fields */}
              {storageDriver === 'r2' && (
                <div className="space-y-4">
                  <div>
                    <Label>Account ID or Access Key *</Label>
                    <Input
                      value={fields.r2_access_key_id}
                      onChange={(e) => setFields({ ...fields, r2_access_key_id: e.target.value })}
                      placeholder="Enter R2 Access Key ID"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label>Secret Access Key *</Label>
                    <Input
                      type="password"
                      value={fields.r2_secret_access_key}
                      onChange={(e) => setFields({ ...fields, r2_secret_access_key: e.target.value })}
                      placeholder="Enter R2 Secret Access Key"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label>Bucket Name *</Label>
                    <Input
                      value={fields.r2_bucket}
                      onChange={(e) => setFields({ ...fields, r2_bucket: e.target.value })}
                      placeholder="Enter R2 Bucket Name"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label>Endpoint *</Label>
                    <Input
                      value={fields.r2_endpoint}
                      onChange={(e) => setFields({ ...fields, r2_endpoint: e.target.value })}
                      placeholder="https://<account-id>.r2.cloudflarestorage.com"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label>Public URL (Optional)</Label>
                    <Input
                      value={fields.r2_public_url}
                      onChange={(e) => setFields({ ...fields, r2_public_url: e.target.value })}
                      placeholder="https://pub-xxxx.r2.dev"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Region</Label>
                    <Input
                      value={fields.r2_region}
                      onChange={(e) => setFields({ ...fields, r2_region: e.target.value })}
                      placeholder="auto"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Bunny Stream Fields */}
              {storageDriver === 'bunny' && (
                <div className="space-y-4">
                  <div>
                    <Label>Bunny Library ID *</Label>
                    <Input
                      value={fields.bunny_library_id}
                      onChange={(e) => setFields({ ...fields, bunny_library_id: e.target.value })}
                      placeholder="Enter your Bunny Stream Library ID"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label>Bunny Stream API Key *</Label>
                    <Input
                      type="password"
                      value={fields.bunny_api_key}
                      onChange={(e) => setFields({ ...fields, bunny_api_key: e.target.value })}
                      placeholder="Enter your Bunny Stream API key"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label>Bunny Token Authentication Key *</Label>
                    <Input
                      type="password"
                      value={fields.bunny_token_auth_key}
                      onChange={(e) => setFields({ ...fields, bunny_token_auth_key: e.target.value })}
                      placeholder="Enter your library's Token Authentication security key"
                      className="mt-1"
                      required
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Enable Token Authentication on this library in the Bunny dashboard first, then copy its security key here — this is what signs every lesson's playback URL.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <LoadingButton loading={saving} type="submit">
                  Save Changes
                </LoadingButton>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
