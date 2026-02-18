import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';
import ResultModal from '@/components/result-modal';

interface FileUploaderProps {
    onUploadSuccess?: () => void;
    className?: string;
}

export default function FileUploader({ onUploadSuccess, className }: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [modal, setModal] = useState<{ open: boolean; type: 'success' | 'error'; title: string; message: string }>({
        open: false,
        type: 'success',
        title: '',
        message: '',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showModal = (type: 'success' | 'error', title: string, message: string) => {
        setModal({ open: true, type, title, message });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) setSelectedFile(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setSelectedFile(file);
    };

    const handleUpload = () => {
        if (!selectedFile) return;

        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', selectedFile);

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        fetch('/trees/upload', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': csrfToken || '',
            },
        })
            .then(async response => {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    if (!response.ok) {
                        if (data.errors) {
                            const messages = Object.values(data.errors).flat().join('\n');
                            throw new Error(messages);
                        }
                        throw new Error(data.message || 'Upload failed');
                    }
                    return data;
                } else {
                    throw new Error('Server returned an unexpected response. Status: ' + response.status);
                }
            })
            .then(data => {
                setSelectedFile(null);
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';

                const total = data.data?.total_missing ?? 0;
                const duplicates = data.data?.duplicate_coordinates ?? 0;
                showModal(
                    'success',
                    'File Processed Successfully',
                    `Found ${total} missing trees and ${duplicates} duplicate coordinate groups.`
                );
                onUploadSuccess?.();
            })
            .catch(error => {
                setIsUploading(false);
                showModal('error', 'Upload Failed', error.message);
            });
    };

    return (
        <div className={cn('space-y-4', className)}>
            <div
                className={cn(
                    'relative rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
                    isDragging ? 'border-primary bg-primary/5' : 'border-border',
                    'hover:border-primary/50'
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.html"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <div className="flex flex-col items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-4">
                        <Upload className="size-8 text-primary" />
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-medium">
                            {selectedFile ? selectedFile.name : 'Drop your Excel file here'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Supports .xlsx, .xls, .csv, .html
                        </p>
                    </div>
                </div>
            </div>

            {selectedFile && (
                <Button onClick={handleUpload} disabled={isUploading} className="w-full">
                    {isUploading ? 'Processing...' : 'Upload and Process'}
                </Button>
            )}

            <ResultModal
                open={modal.open}
                onClose={() => setModal(prev => ({ ...prev, open: false }))}
                type={modal.type}
                title={modal.title}
                message={modal.message}
            />
        </div>
    );
}
