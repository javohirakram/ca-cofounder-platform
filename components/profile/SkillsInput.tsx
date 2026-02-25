'use client';

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const SUGGESTED_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'React', 'Next.js', 'Node.js',
  'Go', 'Rust', 'Java', 'Swift', 'Kotlin', 'Flutter', 'React Native',
  'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GCP',
  'Machine Learning', 'AI', 'Data Science', 'Blockchain', 'Web3',
  'Product Management', 'UI/UX Design', 'Figma', 'Marketing',
  'Growth Hacking', 'SEO', 'Content Marketing', 'Sales', 'Business Development',
  'Financial Modeling', 'Fundraising', 'Legal', 'HR', 'Operations',
  'Project Management', 'Agile', 'DevOps', 'CI/CD', 'Testing',
  'Mobile Development', 'iOS', 'Android', 'Backend', 'Frontend',
  'Full Stack', 'System Design', 'API Design', 'GraphQL', 'REST',
];

interface SkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  maxSkills?: number;
}

export function SkillsInput({ value, onChange, maxSkills = 15 }: SkillsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('onboarding');

  const filteredSuggestions = inputValue.trim().length > 0
    ? SUGGESTED_SKILLS.filter(
        (skill) =>
          skill.toLowerCase().includes(inputValue.toLowerCase()) &&
          !value.includes(skill)
      ).slice(0, 6)
    : [];

  const addSkill = useCallback(
    (skill: string) => {
      const trimmed = skill.trim();
      if (!trimmed) return;
      if (value.includes(trimmed)) return;
      if (value.length >= maxSkills) return;

      onChange([...value, trimmed]);
      setInputValue('');
      inputRef.current?.focus();
    },
    [value, onChange, maxSkills]
  );

  const removeSkill = useCallback(
    (skillToRemove: string) => {
      onChange(value.filter((s) => s !== skillToRemove));
    },
    [value, onChange]
  );

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(inputValue);
    }
    if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeSkill(value[value.length - 1]);
    }
  }

  return (
    <div className="space-y-2">
      {/* Tag display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="h-7 gap-1 pl-2.5 pr-1.5 text-xs font-normal"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
                aria-label={`Remove ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay blur to allow suggestion click
            setTimeout(() => setIsFocused(false), 150);
          }}
          placeholder={
            value.length >= maxSkills
              ? `${t('skills')} (max ${maxSkills})`
              : `${t('skills')}...`
          }
          disabled={value.length >= maxSkills}
          className="h-9"
        />

        {/* Suggestions dropdown */}
        {isFocused && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover p-1 shadow-md">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addSkill(suggestion)}
                className={cn(
                  'flex w-full items-center rounded-sm px-2 py-1.5 text-sm',
                  'hover:bg-accent hover:text-accent-foreground',
                  'cursor-pointer transition-colors'
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Counter */}
      <p className="text-[11px] text-muted-foreground">
        {value.length}/{maxSkills}
      </p>
    </div>
  );
}
