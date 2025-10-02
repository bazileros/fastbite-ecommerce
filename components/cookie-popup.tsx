'use client';

import {
  Cookie,
  Settings,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useCookieConsent } from '@/lib/cookie-context';
import { useState } from 'react';

export function CookiePopup() {
  const { showPopup, acceptAll, rejectAll, setConsent } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);
  const [tempConsent, setTempConsent] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });

  const handleSaveSettings = () => {
    setConsent(tempConsent);
  };

  if (!showPopup) return null;

  return (
    <Dialog open={showPopup} onOpenChange={() => {}}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Cookie className="w-6 h-6 text-orange-500" />
            <DialogTitle className="text-xl">Cookie Preferences</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
          </DialogDescription>
        </DialogHeader>

        {!showSettings ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-muted/50 p-4 rounded-lg">
                <Cookie className="flex-shrink-0 mt-0.5 w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-display font-semibold text-sm">Essential Cookies</h4>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Required for the website to function properly. These cannot be disabled.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-muted/50 p-4 rounded-lg">
                <Settings className="flex-shrink-0 mt-0.5 w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-display font-semibold text-sm">Analytics Cookies</h4>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Help us understand how visitors interact with our website by collecting and reporting information anonymously.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-muted/50 p-4 rounded-lg">
                <Cookie className="flex-shrink-0 mt-0.5 w-5 h-5 text-purple-600" />
                <div>
                  <h4 className="font-display font-semibold text-sm">Marketing Cookies</h4>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Used to track visitors across websites to display relevant advertisements.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-row flex-col gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowSettings(true)}
                className="flex-1"
              >
                <Settings className="mr-2 w-4 h-4" />
                Customize
              </Button>
              <Button
                variant="outline"
                onClick={rejectAll}
                className="flex-1"
              >
                Reject Non-Essential
              </Button>
              <Button
                onClick={acceptAll}
                className="flex-1"
              >
                Accept All
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-display font-semibold text-sm">Essential Cookies</h4>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Required for basic website functionality
                  </p>
                </div>
                <Switch checked={tempConsent.essential} disabled />
              </div>

              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-display font-semibold text-sm">Analytics Cookies</h4>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Help us improve our website
                  </p>
                </div>
                <Switch
                  checked={tempConsent.analytics}
                  onCheckedChange={(checked) =>
                    setTempConsent(prev => ({ ...prev, analytics: checked }))
                  }
                />
              </div>

              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-display font-semibold text-sm">Marketing Cookies</h4>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Used for personalized advertising
                  </p>
                </div>
                <Switch
                  checked={tempConsent.marketing}
                  onCheckedChange={(checked) =>
                    setTempConsent(prev => ({ ...prev, marketing: checked }))
                  }
                />
              </div>
            </div>

            <div className="flex sm:flex-row flex-col gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowSettings(false)}
                className="flex-1"
              >
                <X className="mr-2 w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleSaveSettings}
                className="flex-1"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t text-muted-foreground text-xs text-center">
          By continuing to use this website, you agree to our{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
            Privacy Policy
          </a>
          ,{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
            Terms of Service
          </a>
          , and{' '}
          <a href="/accessibility" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
            Accessibility Statement
          </a>
          .
        </div>
      </DialogContent>
    </Dialog>
  );
}