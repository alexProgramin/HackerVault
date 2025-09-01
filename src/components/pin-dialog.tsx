
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/use-translation";

interface PinDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (pin: string) => void;
}

export function PinDialog({ isOpen, onClose, onConfirm }: PinDialogProps) {
    const { t } = useTranslation();
    const [pin, setPin] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirmClick = async () => {
        setIsLoading(true);
        await onConfirm(pin);
        setIsLoading(false);
        setPin("");
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setPin("");
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{t('enter_pin_title')}</DialogTitle>
                    <DialogDescription>
                        {t('enter_pin_description')}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="space-y-2">
                        <Label htmlFor="pin-input">{t('pin_label')}</Label>
                        <Input 
                            id="pin-input"
                            type="password"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="••••"
                            className="text-center text-2xl tracking-[1em]"
                            onKeyPress={(e) => e.key === 'Enter' && handleConfirmClick()}
                            disabled={isLoading}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>{t('cancel_button')}</Button>
                    <Button onClick={handleConfirmClick} disabled={isLoading}>
                        {isLoading ? t('loading_unlocking') : t('unlock_button')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
