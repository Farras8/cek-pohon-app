import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ResultModalProps {
    open: boolean;
    onClose: () => void;
    type: 'success' | 'error';
    title: string;
    message: string;
}

export default function ResultModal({ open, onClose, type, title, message }: ResultModalProps) {
    const isSuccess = type === 'success';

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="items-center text-center">
                    <div className={`mb-2 inline-flex rounded-full p-3 ${isSuccess ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                        {isSuccess ? (
                            <CheckCircle2 className="size-8 text-primary" />
                        ) : (
                            <XCircle className="size-8 text-destructive" />
                        )}
                    </div>
                    <DialogTitle className="text-xl">{title}</DialogTitle>
                    <DialogDescription className="text-sm whitespace-pre-line">
                        {message}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                    <Button onClick={onClose} variant={isSuccess ? 'default' : 'destructive'}>
                        OK
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
