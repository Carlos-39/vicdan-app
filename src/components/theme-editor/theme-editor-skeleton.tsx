import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Palette } from "lucide-react"

export function ThemeEditorSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-8 sm:h-9 md:h-10 w-64" />
            <Skeleton className="h-4 sm:h-5 w-80" />
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="h-9 w-full sm:w-40" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Editor Panel */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                <Skeleton className="h-10 w-24" />
              </CardTitle>
            </CardHeader>

            <CardContent className="p-3 sm:p-4 md:p-6">
              {/* Tabs */}
              <div className="space-y-4">
                <div className="flex gap-2 border-b pb-2 justify-between">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>

                {/* Tab Content */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links Section */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="p-4 sm:p-6">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {/* Avatar */}
                <Skeleton className="size-20 rounded-full mx-auto" />
                
                {/* Name and Email */}
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32 mx-auto" />
                  <Skeleton className="h-4 w-40 mx-auto" />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                {/* Links */}
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
