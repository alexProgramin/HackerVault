
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';

export function PasswordGenerator() {
  const [length, setLength] = useState(20);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const { toast } = useToast();
  const { t } = useTranslation();

  const generatePassword = () => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const digits = '23456789';
    const symbols = '!@#$%^&*()-_=+[]{};:,.?/';
    
    let charPool = '';
    if (includeUppercase) charPool += upper;
    if (includeLowercase) charPool += lower;
    if (includeNumbers) charPool += digits;
    if (includeSymbols) charPool += symbols;

    if (charPool === '') {
        toast({
            title: t('error_title'),
            description: t('error_no_character_set'),
            variant: 'destructive',
          });
      return;
    }
    
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charPool.length);
      password += charPool[randomIndex];
    }
    setGeneratedPassword(password);
  };
  
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
    <div className="space-y-6">
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="length" className="text-sm">{t('password_length_label')}</Label>
          <span className="font-bold text-primary text-sm">{length}</span>
        </div>
        <Slider
          id="length"
          min={8}
          max={64}
          step={1}
          value={[length]}
          onValueChange={(value) => setLength(value[0])}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch id="uppercase" checked={includeUppercase} onCheckedChange={setIncludeUppercase} />
          <Label htmlFor="uppercase" className="text-sm">{t('uppercase_label')}</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="lowercase" checked={includeLowercase} onCheckedChange={setIncludeLowercase} />
          <Label htmlFor="lowercase" className="text-sm">{t('lowercase_label')}</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="numbers" checked={includeNumbers} onCheckedChange={setIncludeNumbers} />
          <Label htmlFor="numbers" className="text-sm">{t('numbers_label')}</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="symbols" checked={includeSymbols} onCheckedChange={setIncludeSymbols} />
          <Label htmlFor="symbols" className="text-sm">{t('symbols_label')}</Label>
        </div>
      </div>
      
      <Button onClick={generatePassword} className="w-full h-11" variant="outline">
        <RefreshCw className="mr-2 h-4 w-4" />
        {t('generate_password_button')}
      </Button>
    </div>
  );
}
