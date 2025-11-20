// src/components/profiles/profile-completeness-check.tsx
"use client"

import { ProfileWithAdmin, ProfileCompleteness } from "@/types/profile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface ProfileCompletenessCheckProps {
  profile: ProfileWithAdmin
}

export function ProfileCompletenessCheck({ profile }: ProfileCompletenessCheckProps) {
  const checkCompleteness = (): ProfileCompleteness => {
    const requiredFields = [
      { key: 'nombre', label: 'Nombre del perfil', value: profile.nombre },
      { key: 'logo_url', label: 'Logo del perfil', value: profile.logo_url },
      { key: 'correo', label: 'Correo electrónico', value: profile.correo },
      { key: 'descripcion', label: 'Descripción', value: profile.descripcion },
      { key: 'diseno', label: 'Diseño personalizado', value: profile.diseno }
    ]

    const completedFields = requiredFields
      .filter(field => {
        if (!field.value) return false
        if (typeof field.value === 'string' && field.value.trim() === '') return false
        if (typeof field.value === 'object' && Object.keys(field.value).length === 0) return false
        return true
      })
      .map(f => f.label)

    const missingFields = requiredFields
      .filter(field => {
        if (!field.value) return true
        if (typeof field.value === 'string' && field.value.trim() === '') return true
        if (typeof field.value === 'object' && Object.keys(field.value).length === 0) return true
        return false
      })
      .map(f => f.label)

    const progress = Math.round((completedFields.length / requiredFields.length) * 100)
    const isComplete = missingFields.length === 0

    return {
      isComplete,
      missingFields,
      completedFields,
      progress
    }
  }

  const completeness = checkCompleteness()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {completeness.isComplete ? (
            <>
              <CheckCircle2 className="size-5 text-success" />
              Perfil completo
            </>
          ) : (
            <>
              <AlertCircle className="size-5 text-warning" />
              Completitud del perfil
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-medium">{completeness.progress}%</span>
          </div>
          <Progress value={completeness.progress} />
        </div>

        {/* Campos completados */}
        {completeness.completedFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Campos completados
            </p>
            <div className="space-y-1">
              {completeness.completedFields.map((field) => (
                <div
                  key={field}
                  className="flex items-center gap-2 text-sm"
                >
                  <CheckCircle2 className="size-4 text-success" />
                  <span>{field}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campos faltantes */}
        {completeness.missingFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-destructive">
              Campos requeridos pendientes
            </p>
            <div className="space-y-1">
              {completeness.missingFields.map((field) => (
                <div
                  key={field}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <XCircle className="size-4 text-destructive" />
                  <span>{field}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {completeness.isComplete && (
          <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
            <p className="text-sm text-success">
              ✓ Tu perfil está completo y listo para publicar
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}