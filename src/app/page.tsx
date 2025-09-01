
"use client";

import { PasswordStrengthAnalyzer } from "@/components/password-strength-analyzer";
import { PasswordGenerator } from "@/components/password-generator";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Vault, Info, Shield, KeyRound } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/10">
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" title={t('app_info_tooltip')}>
                        <Info className="h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>HackerVault v1.0.0</DialogTitle>
                         <DialogDescription>
                            {t('app_info_developed_by', { company: 'corpthia' })}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            <LanguageSwitcher />
          </div>
          <div className="flex flex-col items-center text-center pt-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mb-2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <CardTitle className="text-3xl font-bold text-primary font-headline">
              HackerVault
            </CardTitle>
            <p className="text-muted-foreground mt-2 px-4">
              {t('app_subtitle')}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="analyzer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="analyzer"><Shield className="mr-2" /> {t('password_analyzer_title')}</TabsTrigger>
              <TabsTrigger value="generator"><KeyRound className="mr-2" /> {t('password_generator_title')}</TabsTrigger>
            </TabsList>
            <TabsContent value="analyzer" className="mt-6">
              <PasswordStrengthAnalyzer />
            </TabsContent>
            <TabsContent value="generator" className="mt-6">
              <PasswordGenerator />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex-col gap-4 pt-6">
            <Link href="/vault/login" className="w-full">
                <Button className="w-full h-12 text-lg" variant="secondary">
                    <Vault className="mr-2 h-5 w-5" />
                    {t('go_to_vault_button')}
                </Button>
            </Link>
        </CardFooter>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground px-4">
        <p>{t('footer_offline')}</p>
        <p>{t('footer_tech')}</p>
      </footer>
    </main>
  );
}
