
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/use-translation";
import { useVault } from "@/contexts/vault-context";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eraser } from "lucide-react";


export default function VaultLogin() {
    const { t } = useTranslation();
    const router = useRouter();
    const { vault, login } = useVault();
    const [password, setPassword] = useState("");
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);


    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient && vault.isSetup === false) {
            router.replace('/vault/setup');
        }
    }, [isClient, vault.isSetup, router]);

    const handleLogin = async () => {
        setIsLoading(true);
        const success = await login(password);
        setIsLoading(false);
        if (success) {
            router.push('/vault');
        } else {
            toast({
                title: t('error_title'),
                description: t('login_error_description'),
                variant: 'destructive',
            });
        }
    };
    
    const handleResetVault = () => {
        localStorage.removeItem('hacker-vault-state');
        window.location.href = '/vault/setup';
    };

    if (!isClient || vault.isSetup === false) {
        return null; // or a loading spinner
    }
    
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
            <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl font-bold text-primary">{t('unlock_vault_title')}</CardTitle>
                            <CardDescription>{t('unlock_vault_description')}</CardDescription>
                        </div>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" title={t('reset_vault_button')}>
                                    <Eraser className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('alert_reset_title')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('alert_reset_description')}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('cancel_button')}</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleResetVault} className="bg-destructive hover:bg-destructive/90">{t('confirm_reset_button')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="master-password">{t('master_password_label')}</Label>
                        <Input 
                            id="master-password" 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                            disabled={isLoading}
                        />
                    </div>
                     <div className="text-center">
                        <Link href="/vault/recover" className="text-sm text-muted-foreground hover:text-primary">
                            {t('forgot_password_button')}
                        </Link>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
                        {isLoading ? t('loading_unlocking') : t('unlock_button')}
                    </Button>
                    <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                        {t('back_to_home_button')}
                    </Link>
                </CardFooter>
            </Card>
        </main>
    )
}
