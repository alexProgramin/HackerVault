"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-translation";
import { ThumbsUp, Lightbulb } from "lucide-react";

type StrengthLevel = 'Weak' | 'Moderate' | 'Strong' | 'Error';
type TranslatedStrength = 'strength_weak' | 'strength_moderate' | 'strength_strong' | 'strength_error';

interface AnalysisResult {
    strength: StrengthLevel;
    suggestions: string[];
}

// Debounce function
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<F>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
};

export function PasswordStrengthAnalyzer() {
  const [password, setPassword] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const { t, language } = useTranslation();

  const analyzePasswordLocally = (pwd: string): AnalysisResult => {
      const suggestions: string[] = [];
      let score = 0;

      if (pwd.length === 0) {
        return { strength: 'Weak', suggestions: [] };
      }
      
      // Length check
      if (pwd.length < 8) {
          suggestions.push(t('suggestion_length_short'));
      } else if (pwd.length >= 12) {
          score += 2;
      } else {
          score += 1;
      }

      // Uppercase check
      if (/[A-Z]/.test(pwd)) {
          score += 1;
      } else {
          suggestions.push(t('suggestion_uppercase'));
      }

      // Lowercase check
      if (/[a-z]/.test(pwd)) {
          score += 1;
      } else {
          suggestions.push(t('suggestion_lowercase'));
      }

      // Numbers check
      if (/\d/.test(pwd)) {
          score += 1;
      } else {
          suggestions.push(t('suggestion_numbers'));
      }

      // Symbols check
      if (/[^A-Za-z0-9]/.test(pwd)) {
          score += 1;
      } else {
          suggestions.push(t('suggestion_symbols'));
      }
      
      let strength: StrengthLevel;
      if (score < 3) {
          strength = 'Weak';
      } else if (score < 5) {
          strength = 'Moderate';
      } else {
          strength = 'Strong';
      }

      if (strength !== 'Strong' && !suggestions.some(s => s === t('suggestion_length_short'))) {
        suggestions.push(t('suggestion_length_long'));
      }

      return { strength, suggestions };
  };


  const debouncedAnalyze = useCallback(
    debounce((pwd: string) => {
      if (pwd.length === 0) {
        setAnalysis(null);
        return;
      }
      const result = analyzePasswordLocally(pwd);
      setAnalysis(result);
    }, 300),
    [language] // Re-create debounced function if language changes to get new translations
  );
  
  useEffect(() => {
    // Re-analyze password when language changes
    if (password) {
      const result = analyzePasswordLocally(password);
      setAnalysis(result);
    }
  }, [language, password]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    debouncedAnalyze(newPassword);
  };
  
  const getStrengthProps = (strength: StrengthLevel | undefined) => {
    const strengthKey = strength?.toLowerCase() as Lowercase<StrengthLevel> | undefined;
    
    const strengthMap: Record<Lowercase<StrengthLevel>, {variant: 'destructive' | 'outline' | 'secondary', Icon: any, labelKey: TranslatedStrength, className: string}> = {
        'strong': { variant: 'secondary', Icon: ShieldCheck, labelKey: 'strength_strong', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
        'moderate': { variant: 'outline', Icon: ShieldAlert, labelKey: 'strength_moderate', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
        'weak': { variant: 'destructive', Icon: ShieldAlert, labelKey: 'strength_weak', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
        'error': { variant: 'destructive', Icon: ShieldAlert, labelKey: 'strength_error', className: 'bg-red-500/20 text-red-400 border-red-500/30' }
    }

    if(strengthKey && strengthMap[strengthKey]){
        const props = strengthMap[strengthKey];
        return {...props, label: t(props.labelKey) };
    }

    return { variant: 'outline', Icon: ShieldQuestion, className: '', label: strength };
  };
  
  const strengthProps = getStrengthProps(analysis?.strength);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-center font-headline">{t('password_analyzer_title')}</h2>
      <div className="relative">
        <Input
          type="text"
          value={password}
          onChange={handlePasswordChange}
          placeholder={t('analyzer_placeholder')}
          className="pr-10 text-base text-foreground placeholder:text-muted-foreground h-12"
          aria-label={t('analyzer_label')}
        />
      </div>
      
      {analysis && password.length > 0 && (
        <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
                <Badge variant={strengthProps.variant as any} className={`text-base px-4 py-2 ${strengthProps.className}`}>
                    <strengthProps.Icon className="h-5 w-5 mr-2" />
                    {strengthProps.label}
                </Badge>
            </div>
            {analysis.suggestions && analysis.suggestions.length > 0 && analysis.strength !== 'Strong' && (
                 <div className="p-4 rounded-md bg-card/50 border border-border">
                    <h3 className="flex items-center mb-2 font-semibold text-primary"><Lightbulb className="w-5 h-5 mr-2"/>{t('suggestions_title')}</h3>
                    <ul className="space-y-2 text-card-foreground">
                        {analysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                            <ThumbsUp className="h-4 w-4 mr-3 mt-1 shrink-0 text-secondary" />
                            <span>{suggestion}</span>
                        </li>
                        ))}
                    </ul>
                 </div>
            )}
        </div>
      )}
    </div>
  );
}
