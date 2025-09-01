
"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/use-translation";
import { useVault } from "@/contexts/vault-context";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function RecoverPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { vault, verifyRecoveryAnswers, resetPassword } = useVault();
    const { toast } = useToast();

    const [answers, setAnswers] = useState<string[]>(["", "", ""]);
    const [isVerified, setIsVerified] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);


    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handleVerifyAnswers = async () => {
        if (answers.some(a => a.trim() === '')) {
            toast({ title: t('error_title'), description: t('setup_recovery_error_all_fields'), variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        const success = await verifyRecoveryAnswers(answers);
        setIsLoading(false);

        if (success) {
            toast({ title: t('recover_answers_verified_title'), description: t('recover_answers_verified_description') });
            setIsVerified(true);
        } else {
            toast({ title: t('error_title'), description: t('recover_error_incorrect_answers'), variant: 'destructive' });
        }
    };
    
    const handleResetPassword = async () => {
        if (newPassword.length < 8) {
            toast({ title: t('error_title'), description: t('setup_error_password_short'), variant: 'destructive' });
            return;
        }
        if (newPassword !== confirmNewPassword) {
            toast({ title: t('error_title'), description: t('setup_error_password_mismatch'), variant: 'destructive' });
            return;
        }
        
        setIsLoading(true);
        await resetPassword(newPassword);
        setIsLoading(false);

        toast({ title: t('recover_password_reset_success_title'), description: t('recover_password_reset_success_description')});
        router.push('/vault');
    };

    if (!isClient) {
        return null; // Or a loading spinner
    }

    if (vault.securityQuestions.length === 0) {
        return (
             <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
                <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-primary">{t('no_recovery_setup_title')}</CardTitle>
                        <CardDescription>{t('no_recovery_setup_description')}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                         <Link href="/vault/login" className="w-full">
                            <Button className="w-full">{t('back_to_home_button')}</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </main>
        )
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
            <Card className="w-full max-w-lg bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary">{t('recover_account_title')}</CardTitle>
                    <CardDescription>{t('recover_account_description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!isVerified ? (
                        <>
                            {vault.securityQuestions.map((sq, index) => (
                                <div key={index} className="space-y-2">
                                    <Label>{sq.question}</Label>
                                    <Input
                                        type="text"
                                        value={answers[index]}
                                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                                        placeholder={t('answer_placeholder')}
                                        disabled={isLoading}
                                    />
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-master-password">{t('new_master_password_label')}</Label>
                                <Input 
                                    id="new-master-password" 
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-new-master-password">{t('confirm_new_master_password_label')}</Label>
                                <Input 
                                    id="confirm-new-master-password" 
                                    type="password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    {!isVerified ? (
                        <Button onClick={handleVerifyAnswers} className="w-full" disabled={isLoading}>
                            {isLoading ? t('loading_verifying') : t('verify_answers_button')}
                        </Button>
                    ) : (
                        <Button onClick={handleResetPassword} className="w-full" disabled={isLoading}>
                            {isLoading ? t('loading_resetting') : t('reset_password_button')}
                        </Button>
                    )}
                     <Link href="/vault/login" className="text-sm text-muted-foreground hover:text-primary">
                        {t('cancel_button')}
                    </Link>
                </CardFooter>
            </Card>
        </main>
    );
}
