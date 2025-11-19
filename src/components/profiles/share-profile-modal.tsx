// src/components/profiles/share-profile-modal.tsx
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Download, Share2, Check, Facebook, Twitter, Linkedin, Mail } from "lucide-react"
import Image from "next/image"

interface ShareProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profileData: {
    slug: string
    publicUrl: string
    qrUrl: string
    nombre: string
  }
}

export function ShareProfileModal({ open, onOpenChange, profileData }: ShareProfileModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileData.publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copiando enlace:', error)
    }
  }

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(profileData.qrUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `qr-${profileData.slug}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error descargando QR:', error)
    }
  }

  const shareOnSocial = (platform: 'facebook' | 'twitter' | 'linkedin' | 'email') => {
    const text = `Mira mi perfil: ${profileData.nombre}`
    const url = profileData.publicUrl

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`
    }

    if (platform === 'email') {
      window.location.href = urls[platform]
    } else {
      window.open(urls[platform], '_blank', 'width=600,height=400')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="size-5" />
            Compartir perfil
          </DialogTitle>
          <DialogDescription>
            Tu perfil ha sido publicado. Comparte el enlace o código QR.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enlace público */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Enlace público</label>
            <div className="flex gap-2">
              <Input
                value={profileData.publicUrl}
                readOnly
                className="flex-1 text-sm"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="size-4 text-success" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-sm text-success">¡Enlace copiado!</p>
            )}
          </div>

          {/* Código QR */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Código QR</label>
            <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-muted/50">
              <div className="relative w-48 h-48 bg-white p-2 rounded-lg">
                <Image
                  src={profileData.qrUrl}
                  alt="QR Code"
                  fill
                  className="object-contain"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadQR}
                className="gap-2"
              >
                <Download className="size-4" />
                Descargar QR
              </Button>
            </div>
          </div>

          {/* Compartir en redes sociales */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Compartir en redes</label>
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => shareOnSocial('facebook')}
                title="Compartir en Facebook"
              >
                <Facebook className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => shareOnSocial('twitter')}
                title="Compartir en Twitter"
              >
                <Twitter className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => shareOnSocial('linkedin')}
                title="Compartir en LinkedIn"
              >
                <Linkedin className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => shareOnSocial('email')}
                title="Compartir por email"
              >
                <Mail className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}