'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isSent: boolean;
  isRead: boolean;
}

export function MessageBubble({ content, timestamp, isSent, isRead }: MessageBubbleProps) {
  const [showTime, setShowTime] = useState(false);
  const formattedTime = format(new Date(timestamp), 'HH:mm');
  const formattedDate = format(new Date(timestamp), 'MMM d, yyyy HH:mm');

  return (
    <div
      className={cn(
        'flex',
        isSent ? 'justify-end' : 'justify-start'
      )}
    >
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'max-w-[75%] sm:max-w-[65%] group relative',
                isSent ? 'items-end' : 'items-start'
              )}
              onMouseEnter={() => setShowTime(true)}
              onMouseLeave={() => setShowTime(false)}
            >
              <div
                className={cn(
                  'px-3.5 py-2 text-sm leading-relaxed break-words',
                  isSent
                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm'
                    : 'bg-muted text-foreground rounded-2xl rounded-bl-sm'
                )}
              >
                {content}
              </div>

              {/* Timestamp + Read receipt */}
              <div
                className={cn(
                  'flex items-center gap-1 mt-0.5 px-1',
                  isSent ? 'justify-end' : 'justify-start',
                  showTime ? 'opacity-100' : 'opacity-0',
                  'transition-opacity duration-200'
                )}
              >
                <span className="text-[10px] text-muted-foreground">{formattedTime}</span>
                {isSent && (
                  isRead ? (
                    <CheckCheck className="h-3 w-3 text-primary" />
                  ) : (
                    <Check className="h-3 w-3 text-muted-foreground" />
                  )
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side={isSent ? 'left' : 'right'} className="text-xs">
            {formattedDate}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
