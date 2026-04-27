'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Command } from 'lucide-react';

// ─── Keyboard Shortcuts Dialog ─────────────────────────────
export function KeyboardShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const shortcuts = [
    { keys: ['Ctrl', 'Enter'], desc: 'Generate content' },
    { keys: ['Ctrl', 'E'], desc: 'Toggle export menu' },
    { keys: ['Esc'], desc: 'Go back / Close' },
    { keys: ['Ctrl', 'K'], desc: 'Open shortcuts' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="w-5 h-5 text-orange-500" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>Quick actions to speed up your workflow</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 pt-2">
          {shortcuts.map((s) => (
            <div key={s.desc} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
              <span className="text-sm text-muted-foreground">{s.desc}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, i) => (
                  <React.Fragment key={i}>
                    <span className="kbd-key">{k}</span>
                    {i < s.keys.length - 1 && <span className="text-[10px] text-muted-foreground mx-0.5">+</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
