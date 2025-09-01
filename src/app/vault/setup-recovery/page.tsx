
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const questions = [
    "recovery_q_pet",
    "recovery_q_childhood_friend",
    "recovery_q_mother_maiden_name",
    "recovery_q_first_car",
    "recovery_q_secret_dream",
];

export default function SetupRecoveryPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { setupRecovery, vault } = useVault();
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);

    const findQuestionKey = (questionText: string) => {
        if (!questionText) return "";
        return questions.find(key => t(key as any) === questionText) || "";
    };

    const [q1Key, setQ1Key] = useState("");
    const [a1, setA1] = useState("");
    const [q2Key, setQ2Key] = useState("");
    const [a2, setA2] = useState("");
    const [q3Key, setQ3Key] = useState("");
    const [a3, setA3] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Initialize state that depends on vault only on the client
        if (vault.securityQuestions.length > 0) {
            setQ1Key(findQuestionKey(vault.securityQuestions[0]?.question || ""));
            setQ2Key(findQuestionKey(vault.securityQuestions[1]?.question || ""));
            setQ3Key(findQuestionKey(vault.securityQuestions[2]?.question || ""));
        }
    }, [vault.securityQuestions, t]);


    const handleSetup = async () => {
        const questionsToSave = [
            { question: t(q1Key as any), answer: a1 },
            { question: t(q2Key as any), answer: a2 },
            { question: t(q3Key as any), answer: a3 },
        ];
        
        const questionKeys = [q1Key, q2Key, q3Key];

        if (questionKeys.some(k => !k) || questionsToSave.some(q => !q.answer)) {
            toast({
                title: t('error_title'),
                description: t('setup_recovery_error_all_fields'),
                variant: 'destructive',
            });
            return;
        }

        if (new Set(questionKeys).size !== questionKeys.length) {
            toast({
                title: t('error_title'),
                description: t('setup_recovery_error_unique_questions'),
                variant: 'destructive',
            });
            return;
        }
        
        setIsLoading(true);
        await setupRecovery(questionsToSave);
        setIsLoading(false);

        toast({
            title: t('setup_recovery_success_title'),
            description: t('setup_recovery_success_description'),
        });
        router.push('/vault');
    };
    
    if (!isClient) {
        return null; // or a loading skeleton
    }

    const isUpdate = vault.securityQuestions.length > 0;
    
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
            <Card className="w-full max-w-lg bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary">{t('setup_recovery_title')}</CardTitle>
                    <CardDescription>{t(isUpdate ? 'setup_recovery_description_update' : 'setup_recovery_description_initial')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>{t('security_question_1')}</Label>
                        <Select onValueChange={setQ1Key} value={q1Key} disabled={isLoading}>
                             <SelectTrigger>
                                <SelectValue placeholder={t('select_question_placeholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                {questions.map(q => <SelectItem key={q} value={q}>{t(q as any)}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Input 
                            type="text"
                            value={a1}
                            onChange={(e) => setA1(e.target.value)}
                            placeholder={t('answer_placeholder')}
                            disabled={isLoading}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label>{t('security_question_2')}</Label>
                        <Select onValueChange={setQ2Key} value={q2Key} disabled={isLoading}>
                             <SelectTrigger>
                                <SelectValue placeholder={t('select_question_placeholder')} />
                            </SelectTrigger>
                             <SelectContent>
                                {questions.map(q => <SelectItem key={q} value={q}>{t(q as any)}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Input 
                            type="text"
                            value={a2}
                            onChange={(e) => setA2(e.target.value)}
                            placeholder={t('answer_placeholder')}
                            disabled={isLoading}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label>{t('security_question_3')}</Label>
                        <Select onValueChange={setQ3Key} value={q3Key} disabled={isLoading}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('select_question_placeholder')} />
                            </SelectTrigger>
                             <SelectContent>
                                {questions.map(q => <SelectItem key={q} value={q}>{t(q as any)}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Input 
                            type="text"
                            value={a3}
                            onChange={(e) => setA3(e.target.value)}
                            placeholder={t('answer_placeholder')}
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSetup} className="w-full" disabled={isLoading}>
                        {isLoading 
                            ? t('loading_saving') 
                            : t(isUpdate ? 'update_recovery_button' : 'save_recovery_button')
                        }
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
}
