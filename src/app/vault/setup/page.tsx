
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

export default function VaultSetup() {
    const { t } = useTranslation();
    const router = useRouter();
    const { setupVault } = useVault();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleSetup = async () => {
        if (password.length < 8) {
             toast({
                title: t('error_title'),
                description: t('setup_error_password_short'),
                variant: 'destructive',
            });
            return;
        }
        if (password !== confirmPassword) {
            toast({
                title: t('error_title'),
                description: t('setup_error_password_mismatch'),
                variant: 'destructive',
            });
            return;
        }
        setIsLoading(true);
        await setupVault(password);
        setIsLoading(false);
        toast({
            title: t('setup_success_title'),
            description: t('setup_success_description'),
        });
        router.push('/vault');
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
            <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary">{t('setup_vault_title')}</CardTitle>
                    <CardDescription>{t('setup_vault_create_master_password')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="master-password">{t('master_password_label')}</Label>
                        <Input 
                            id="master-password" 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('master_password_placeholder')}
                            disabled={isLoading}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirm-master-password">{t('confirm_master_password_label')}</Label>
                        <Input 
                            id="confirm-master-password" 
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={t('confirm_master_password_placeholder')}
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSetup} className="w-full" disabled={isLoading}>
                        {isLoading ? t('loading_creating_vault') : t('create_vault_button')}
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
}
