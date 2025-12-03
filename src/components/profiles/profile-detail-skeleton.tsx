import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProfileDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full sm:w-auto sm:ml-auto">
          <Skeleton className="h-9 w-full sm:w-28" />
          <Skeleton className="h-9 w-full sm:w-32" />
          <Skeleton className="h-9 w-full sm:w-24" />
          <Skeleton className="h-9 w-full sm:w-28" />
        </div>
      </div>

      {/* Main Profile Card */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Avatar */}
            <Skeleton className="size-16 sm:size-20 rounded-full flex-shrink-0" />
            
            {/* Name and Status */}
            <div className="flex-1 w-full text-center sm:text-left space-y-2">
              <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {/* Contact Information */}
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Skeleton className="size-5 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>

              {/* Logo */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Skeleton className="size-5 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="space-y-4">
              {/* Created By */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Skeleton className="size-5 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>

              {/* Creation Date */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Skeleton className="size-5 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>

              {/* Last Update */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Skeleton className="size-5 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Skeleton className="size-5 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
