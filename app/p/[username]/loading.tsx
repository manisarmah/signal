import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileLoading() {
    return (
        <div className="max-w-4xl mx-auto space-y-6 py-12 px-4">
            <div className="text-center space-y-4 relative">
                <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                <div className="space-y-2 flex flex-col items-center">
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-5 w-64" />
                </div>
                <div className="max-w-md mx-auto mt-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6 mx-auto" />
                </div>
            </div>

            <div className="space-y-4 mt-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 p-4 border rounded-lg">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
