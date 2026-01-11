import { UploadForm } from '@/components/proofs/upload-form'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'

export default async function ProofsPage() {
    const supabase = await createClient()
    const { data: receipts } = await supabase
        .from('receipts')
        .select('*')
        .order('date', { ascending: false })

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manual Proofs</h1>
                    <p className="text-muted-foreground">Manage your screenshots and PDF receipts.</p>
                </div>
                <UploadForm />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {receipts?.map((receipt) => (
                    <Card key={receipt.id} className="overflow-hidden">
                        <div className="relative aspect-video bg-muted">
                            {receipt.type === 'image' ? (
                                <Image
                                    src={receipt.url}
                                    alt={receipt.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <iframe
                                    src={`${receipt.url}#toolbar=0&navpanes=0&scrollbar=0`}
                                    className="w-full h-full border-none"
                                    title={receipt.title}
                                    loading="lazy"
                                />
                            )}
                        </div>
                        <CardHeader>
                            <CardTitle className="text-lg">{receipt.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(receipt.date), { addSuffix: true })}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm">{receipt.description}</p>
                            <Button asChild variant="outline" size="sm" className="w-full gap-2">
                                <a href={receipt.url} target="_blank" rel="noopener noreferrer">
                                    View Proof Document
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                ))}

                {!receipts?.length && (
                    <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
                        No manual proofs added yet.
                    </div>
                )}
            </div>
        </div>
    )
}
