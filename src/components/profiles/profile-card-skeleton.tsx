import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProfileCardSkeleton() {
  return (
    <Card className="p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Avatar Skeleton */}
        <Skeleton className="size-16 sm:size-20 rounded-full shrink-0 mx-auto sm:mx-0" />

        {/* Content Skeleton */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-2">
              {/* Name Skeleton */}
              <Skeleton className="h-5 w-3/4 sm:w-1/2" />
              {/* Email Skeleton */}
              <Skeleton className="h-4 w-full sm:w-2/3" />
            </div>

            {/* Actions Button Skeleton */}
            <Skeleton className="size-8 rounded-md shrink-0" />
          </div>

          {/* Status and Date Skeleton */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Quick Preview Button Skeleton */}
          <div className="mt-3">
            <Skeleton className="h-7 sm:h-8 w-full rounded-md" />
          </div>
        </div>
      </div>
    </Card>
  )
}
