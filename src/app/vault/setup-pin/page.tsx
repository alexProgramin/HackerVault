
"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/use-translation";
import { useVault } from "@/contexts/vault-context";
import { useToast } from "@/hooks/use-toast";

export default function SetupPinPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { setupPin } = useVault();
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleSetup = async () => {
        if (pin.length !== 4) {
             toast({
                title: t('error_title'),
                description: t('setup_pin_error_length'),
                variant: 'destructive',
            });
            return;
        }
        if (pin !== confirmPin) {
            toast({
                title: t('error_title'),
                description: t('setup_pin_error_mismatch'),
                variant: 'destructive',
            });
            return;
        }
        setIsLoading(true);
        await setupPin(pin);
        setIsLoading(false);
        toast({
            title: t('setup_pin_success_title'),
            description: t('setup_pin_success_description'),
        });
        router.push('/vault');
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
            <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary">{t('setup_pin_title')}</CardTitle>
                    <CardDescription>{t('setup_pin_description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="pin">{t('pin_label')}</Label>
                        <Input 
                            id="pin" 
                            type="password"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            placeholder={t('pin_placeholder')}
                            disabled={isLoading}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirm-pin">{t('confirm_pin_label')}</Label>
                        <Input 
                            id="confirm-pin" 
                            type="password"
                            maxLength={4}
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                            placeholder={t('confirm_pin_placeholder')}
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSetup} className="w-full" disabled={isLoading}>
                        {isLoading ? t('loading_saving_pin') : t('save_pin_button')}
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
}
