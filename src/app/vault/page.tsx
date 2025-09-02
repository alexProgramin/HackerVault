
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVault } from '@/contexts/vault-context';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, KeyRound, User, MoreVertical, Edit, Trash2, Eye, EyeOff, Tag, ShieldQuestion, LogOut, Home } from 'lucide-react';
import { CredentialForm } from '@/components/credential-form';
import { Credential } from '@/contexts/vault-context';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { PinDialog } from '@/components/pin-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function VaultPage() {
    const router = useRouter();
    const { vault, logout, deleteCredential, verifyPin } = useVault();
    const { t } = useTranslation();
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
    const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
    const [credentialToView, setCredentialToView] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient) {
            if (vault.isLocked) {
                router.replace('/vault/login');
            } else if (!vault.pinHash) {
                router.replace('/vault/setup-pin');
            } else if (!vault.securityQuestions || vault.securityQuestions.length === 0) {
                router.replace('/vault/setup-recovery');
            } else {
                setIsReady(true);
            }
        }
    }, [isClient, vault.isLocked, vault.pinHash, vault.securityQuestions, router]);

    if (!isReady || !isClient) {
        return null; // Or a loading spinner
    }

    const handleAddNew = () => {
        setEditingCredential(null);
        setIsFormOpen(true);
    }

    const handleEdit = (credential: Credential) => {
        setEditingCredential(credential);
        setIsFormOpen(true);
    }
    
    const handleDelete = (id: string) => {
        deleteCredential(id);
        toast({ title: t('credential_deleted_title') });
    }

    const handlePasswordVisibilityToggle = (id: string) => {
        if (visiblePasswords[id]) {
            setVisiblePasswords(prev => ({ ...prev, [id]: false }));
        } else {
            setCredentialToView(id);
            setIsPinDialogOpen(true);
        }
    }

    const handlePinConfirm = async (pin: string) => {
        const isValid = await verifyPin(pin);
        if (isValid && credentialToView) {
            setVisiblePasswords(prev => ({ ...prev, [credentialToView]: true }));
            setIsPinDialogOpen(false);
            setCredentialToView(null);
        } else {
            toast({
                title: t('error_title'),
                description: t('pin_verify_error'),
                variant: 'destructive',
            });
        }
    }
    
    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <main className="flex h-screen flex-col items-center p-4 md:p-8 bg-background/90">
             <div className="w-full max-w-4xl flex flex-col flex-grow min-h-0">
                <header className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-4">
                    <h1 className="text-4xl text-primary font-bold text-center sm:text-left">{t('vault_title')}</h1>
                    <div className="flex items-center gap-2">
                        <Link href="/vault/setup-recovery">
                            <Button variant="outline" size="icon" title={t('setup_recovery_title')}>
                                <ShieldQuestion className="h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button variant="outline" size="icon" title={t('back_to_home_button')}>
                               <Home className="h-5 w-5" />
                            </Button>
                        </Link>
                         <Button onClick={handleLogout} size="icon" title={t('lock_vault_button')}>
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </header>

                <Card className="bg-card/80 backdrop-blur-sm border-primary/20 flex flex-col flex-grow min-h-0">
                    <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <CardTitle className="text-center sm:text-left">{t('stored_credentials_title')}</CardTitle>
                        <Button onClick={handleAddNew} className="w-full sm:w-auto">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            {t('add_new_button')}
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-hidden">
                        <ScrollArea className="h-full">
                            {isClient && vault.credentials.length === 0 ? (
                                <div className="text-center text-muted-foreground py-12 px-4">
                                    <p className="text-lg">{t('vault_empty_title')}</p>
                                    <p>{t('vault_empty_subtitle')}</p>
                                </div>
                            ) : (
                                <div className="space-y-4 pr-4">
                                    {isClient && vault.credentials.map(cred => (
                                        <div key={cred.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                                            <div className="space-y-1 overflow-hidden mr-2">
                                                <p className="font-semibold text-lg text-primary flex items-center truncate"><Tag className="w-5 h-5 mr-2 shrink-0" /> <span className="truncate">{cred.name}</span></p>
                                                {cred.username && (
                                                    <p className="text-muted-foreground flex items-center truncate"><User className="w-4 h-4 mr-2 shrink-0" /> <span className="truncate">{cred.username}</span></p>
                                                )}
                                                <div className="text-muted-foreground flex items-center">
                                                    <KeyRound className="w-4 h-4 mr-2 shrink-0" />
                                                    <span className="mr-2 truncate">{visiblePasswords[cred.id] ? cred.password : '••••••••'}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handlePasswordVisibilityToggle(cred.id)}>
                                                        {visiblePasswords[cred.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                <AlertDialog>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreVertical className="h-5 w-5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem onClick={() => handleEdit(cred)}><Edit className="mr-2 h-4 w-4" /> {t('edit_button')}</DropdownMenuItem>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> {t('delete_button')}</DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                          <AlertDialogTitle>{t('alert_delete_title')}</AlertDialogTitle>
                                                          <AlertDialogDescription>
                                                            {t('alert_delete_description_1')} <span className="font-bold">{cred.name}</span>. {t('alert_delete_description_2')}
                                                          </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                          <AlertDialogCancel>{t('cancel_button')}</AlertDialogCancel>
                                                          <AlertDialogAction onClick={() => handleDelete(cred.id)} className="bg-destructive hover:bg-destructive/90">{t('delete_button')}</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
            <CredentialForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                credential={editingCredential}
            />
            <PinDialog
                isOpen={isPinDialogOpen}
                onClose={() => setIsPinDialogOpen(false)}
                onConfirm={handlePinConfirm}
            />
        </main>
    );
}
    