import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function EditProfileSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
      </Card>

      {/* Basic Info Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name Input */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Status Select */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Profile Logo Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>

      {/* Buttons Skeleton */}
      <div className="flex flex-col-reverse sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  )
}
