import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

export default function ConfirmModal({ open, onClose, onConfirm, title, message }: ConfirmModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="items-center text-center">
                    <div className="mb-2 inline-flex rounded-full bg-destructive/10 p-3">
                        <AlertTriangle className="size-8 text-destructive" />
                    </div>
                    <DialogTitle className="text-xl">{title}</DialogTitle>
                    <DialogDescription className="text-sm">
                        {message}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:justify-center">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm}>Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
