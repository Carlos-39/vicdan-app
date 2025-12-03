import { Skeleton } from "@/components/ui/skeleton"

export function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border bg-white border-gray-200">
      {/* Avatar Skeleton */}
      <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />

      {/* Content Skeleton */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-1">
            {/* Title Skeleton */}
            <Skeleton className="h-4 w-1/3" />
            {/* Email Skeleton */}
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        {/* Timestamp Skeleton */}
        <Skeleton className="h-3 w-1/4" />
      </div>

      {/* Badge Skeleton */}
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  )
}
