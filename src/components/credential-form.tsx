
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVault, Credential } from "@/contexts/vault-context";
import { useToast } from "@/hooks/use-toast";
import { PasswordGenerator } from "./password-generator";
import { useTranslation } from "@/hooks/use-translation";
import { ScrollArea } from "./ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { KeyRound } from "lucide-react";


interface CredentialFormProps {
    isOpen: boolean;
    onClose: () => void;
    credential: Credential | null;
}

export function CredentialForm({ isOpen, onClose, credential }: CredentialFormProps) {
    const { addCredential, updateCredential } = useVault();
    const { toast } = useToast();
    const { t } = useTranslation();
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (credential) {
            setName(credential.name);
            setUsername(credential.username);
            setPassword(credential.password);
        } else {
            setName("");
            setUsername("");
            setPassword("");
        }
    }, [credential, isOpen]);

    const handleSubmit = async () => {
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
            if (credential) {
                await updateCredential({ id: credential.id, name, username, password });
                toast({ title: t('credential_updated_title') });
            } else {
                await addCredential({ name, username, password });
                toast({ title: t('credential_added_title') });
            }
            onClose();
        } catch(e) {
            console.error(e);
            toast({ title: t('error_title'), description: t('generic_error'), variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md w-full max-h-[90vh] flex flex-col">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle>{credential ? t('edit_credential_title') : t('add_credential_title')}</DialogTitle>
                    <DialogDescription>
                        {t('credential_form_description')}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-grow px-6">
                    <div className="space-y-4 py-4">
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
                    </div>
                     <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>
                            <div className="flex items-center text-sm">
                                <KeyRound className="w-4 h-4 mr-2" />
                                {t('password_generator_title')}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <PasswordGenerator />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                </ScrollArea>
                <DialogFooter className="px-6 pb-6 pt-4 border-t border-border">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>{t('cancel_button')}</Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? t('loading_saving') : t('save_button')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
