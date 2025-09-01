
"use client";

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';

interface SimplePasswordGeneratorProps {
    onPasswordGenerated: (password: string) => void;
}

export function SimplePasswordGenerator({ onPasswordGenerated }: SimplePasswordGeneratorProps) {
  const [generatedPassword, setGeneratedPassword] = useState('');
  const { toast } = useToast();
  const { t } = useTranslation();

  const generatePassword = useCallback(() => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const digits = '23456789';
    const symbols = '!@#$%^&*()-_=+[]{};:,.?/';
    const charPool = upper + lower + digits + symbols;
    const length = 20;
    
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charPool.length);
      password += charPool[randomIndex];
    }
    setGeneratedPassword(password);
    onPasswordGenerated(password);
  }, [onPasswordGenerated]);

  // Generate a password on initial component mount
  useEffect(() => {
    generatePassword();
  }, [generatePassword]);
  
  const copyToClipboard = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      toast({
        title: t('copied_title'),
        description: t('copied_description'),
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative flex items-center">
        <Input 
          readOnly 
          value={generatedPassword} 
          placeholder={t('generate_placeholder')}
          className="pr-20 h-11 text-base text-foreground placeholder:text-muted-foreground"
          aria-label={t('generated_password_label')}
        />
        <div className="absolute right-1.5 flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={generatePassword} aria-label={t('generate_new_password_label')}>
                <RefreshCw className="h-4 w-4 text-secondary" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard} aria-label={t('copy_password_label')}>
                <Copy className="h-4 w-4 text-secondary" />
            </Button>
        </div>
      </div>
    </div>
  );
}
