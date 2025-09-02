
"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVault, Credential } from "@/contexts/vault-context";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { KeyRound, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";

export function CredentialForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { vault, addCredential, updateCredential } = useVault();
    const { toast } = useToast();
    const { t } = useTranslation();

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [credentialId, setCredentialId] = useState<string | null>(null);

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            const existingCredential = vault.credentials.find(c => c.id === id);
            if (existingCredential) {
                setCredentialId(id);
                setIsEditing(true);
                setName(existingCredential.name);
                setUsername(existingCredential.username);
                setPassword(existingCredential.password);
            } else {
                toast({ title: t('error_title'), description: 'Credential not found.', variant: 'destructive'});
                router.replace('/vault');
            }
        }
    }, [searchParams, vault.credentials, router, t, toast]);


    const handleGeneratePassword = useCallback(() => {
        const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        const lower = 'abcdefghijkmnopqrstuvwxyz';
        const digits = '23456789';
        const symbols = '!@#$%^&*()-_=+[]{};:,.?/';
        const charPool = upper + lower + digits + symbols;
        const length = 20;
        
        let newPassword = '';
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * charPool.length);
          newPassword += charPool[randomIndex];
        }
        setPassword(newPassword);
        toast({
            title: t('copied_title'),
            description: t('credential_form_new_password_generated'),
          });
      }, [toast, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !password) {
            toast({
                title: t('error_title'),
                description: t('form_error_fill_all_fields'),
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            if (isEditing && credentialId) {
                await updateCredential({ id: credentialId, name, username, password });
                toast({ title: t('credential_updated_title') });
            } else {
                await addCredential({ name, username, password });
                toast({ title: t('credential_added_title') });
            }
            router.push('/vault');
        } catch(e) {
            console.error(e);
            toast({ title: t('error_title'), description: t('generic_error'), variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCancel = () => {
        router.push('/vault');
    }

    return (
        <main className="min-h-screen bg-background flex justify-center items-start p-4 overflow-y-auto">
            <div className="w-full max-w-md">
                 <Card className="w-full bg-card/80 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                             <Button variant="ghost" size="icon" onClick={handleCancel} className="shrink-0">
                                <ArrowLeft />
                             </Button>
                             <div className="flex-grow">
                                <CardTitle>{isEditing ? t('edit_credential_title') : t('add_credential_title')}</CardTitle>
                                <CardDescription>
                                    {t('credential_form_description')}
                                </CardDescription>
                             </div>
                        </div>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t('reference_label')}</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Google Account" disabled={isLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username">{t('username_label')} ({t('optional_label')})</Label>
                                    <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. user@example.com" disabled={isLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">{t('password_label')}</Label>
                                    <Input id="password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('password_placeholder')} disabled={isLoading} />
                                </div>
                                <Button variant="link" onClick={handleGeneratePassword} className="p-0 h-auto text-sm text-secondary">
                                   <KeyRound className="w-4 h-4 mr-2" />
                                   {t('generate_password_button')}
                                </Button>
                        </CardContent>
                        <CardFooter className="flex-col-reverse gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading} className="w-full">
                                {t('cancel_button')}
                            </Button>
                            <Button type="submit" disabled={isLoading} className="w-full" variant="secondary">
                                {isLoading ? t('loading_saving') : t('save_button')}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </main>
    );
}

    