'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';

import {
  useMutation,
  useQuery,
} from 'convex/react';
import {
  Loader2,
  Save,
} from 'lucide-react';

import { useAdminClaims } from '@/components/admin-layout-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/convex/_generated/api';
import { useToast } from '@/hooks/use-toast';

export const dynamic = 'force-dynamic';

interface StoreSetting {
  _id: string;
  key: string;
  value: string | number | boolean;
  description?: string;
  category: string;
  isPublic: boolean;
  updatedAt: number;
}

export default function StoreSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string | number | boolean>>({});
  const [initialSettings, setInitialSettings] = useState<Record<string, string | number | boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Generate unique IDs for form elements
  const storeNameId = useId();
  const storeTaglineId = useId();
  const storeDescriptionId = useId();
  const openingTimeId = useId();
  const closingTimeId = useId();
  const isOpenId = useId();
  const phoneId = useId();
  const emailId = useId();
  const addressId = useId();
  const facebookId = useId();
  const instagramId = useId();
  const twitterId = useId();
  const whatsappId = useId();
  const showPopularMealsId = useId();
  const showTestimonialsId = useId();
  const enableOnlineOrderingId = useId();
  const enableReservationsId = useId();
  const primaryColorId = useId();
  const secondaryColorId = useId();
  const darkModeId = useId();
  const currencyId = useId();
  const timezoneId = useId();

  const { toast } = useToast();
  const claims = useAdminClaims();

  const storeSettings = useQuery(api.queries.getStoreSettings, {
    claims: claims ? {
      sub: claims.sub || '',
      email: claims.email || undefined,
      name: claims.name || undefined,
      roles: claims.roles || [],
      picture: claims.picture || undefined,
    } : {
      sub: '',
      email: undefined,
      name: undefined,
      roles: [],
      picture: undefined,
    }
  });
  const updateStoreSetting = useMutation(api.mutations.updateStoreSetting);

  // Initialize settings when data loads
  useEffect(() => {
    if (storeSettings) {
      const settingsMap: Record<string, string | number | boolean> = {};
      storeSettings.forEach((setting: StoreSetting) => {
        settingsMap[setting.key] = setting.value;
      });
      setSettings(settingsMap);
      setInitialSettings(settingsMap);
      setHasChanges(false);
    }
  }, [storeSettings]);

  const resolveCategory = useCallback((key: string) => {
    if (['phone', 'email', 'address'].includes(key)) return 'contact';
    if (['facebook', 'instagram', 'twitter', 'whatsapp'].includes(key)) return 'social';
    if (['showPopularMeals', 'showTestimonials', 'enableOnlineOrdering', 'enableReservations'].includes(key)) return 'content';
    if (['primaryColor', 'secondaryColor', 'darkMode'].includes(key)) return 'appearance';
    return 'general';
  }, []);

  const handleSettingChange = (key: string, value: string | number | boolean) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      const hasDiff = initialSettings[key] !== value;
      const otherDiff = Object.entries(next).some(([settingKey, settingValue]) => {
        if (settingKey === key) {
          return initialSettings[settingKey] !== value;
        }
        return initialSettings[settingKey] !== settingValue;
      });
      setHasChanges(hasDiff || otherDiff);
      return next;
    });
  };

  const handleSaveSettings = async () => {
    if (!claims) {
      toast({
        title: "Error",
        description: "Authentication required",
        variant: "destructive",
      });
      return;
    }

    const changedEntries = Object.entries(settings).filter(([key, value]) => initialSettings[key] !== value);

    if (changedEntries.length === 0) {
      toast({
        title: 'No changes detected',
        description: 'Update a setting before saving.',
      });
      return;
    }

    setIsSaving(true);

    try {
      // Save all changed settings with categories
      const promises = changedEntries.map(([key, value]) => updateStoreSetting({
        key,
        value,
        category: resolveCategory(key),
        claims: {
          sub: claims.sub || '',
          email: claims.email || undefined,
          name: claims.name || undefined,
          roles: claims.roles || [],
          picture: claims.picture || undefined,
        },
      }));

      await Promise.all(promises);

      const updatedSettings = {
        ...initialSettings,
        ...Object.fromEntries(changedEntries),
      };
      setInitialSettings(updatedSettings);
      setSettings(updatedSettings);

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
      setHasChanges(false);
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    setSettings(initialSettings);
    setHasChanges(false);
  };

  const getSettingValue = (key: string, defaultValue: string | number | boolean = '') => {
    const value = settings[key];
    return value !== undefined ? value : defaultValue;
  };

  const getStringValue = (key: string, defaultValue: string = '') => {
    const value = getSettingValue(key, defaultValue);
    return typeof value === 'string' ? value : String(value);
  };

  const getBooleanValue = (key: string, defaultValue: boolean = false) => {
    const value = getSettingValue(key, defaultValue);
    return typeof value === 'boolean' ? value : Boolean(value);
  };

  const tabs = useMemo(() => ([
    { value: 'general', label: 'General' },
    { value: 'contact', label: 'Contact' },
    { value: 'social', label: 'Social' },
    { value: 'content', label: 'Content' },
    { value: 'appearance', label: 'Appearance' },
  ]), []);

  if (!storeSettings) {
    return (
      <section className="space-y-6">
        <header className="space-y-1">
          <h1 className="font-display font-semibold text-3xl tracking-tight">Store settings</h1>
          <p className="text-muted-foreground">Loading your preferences…</p>
        </header>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <header className="flex lg:flex-row flex-col lg:justify-between lg:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-display font-semibold text-3xl tracking-tight">Store settings</h1>
          <p className="text-muted-foreground">Configure business information, contact details, and storefront presentation.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetSettings}
            disabled={!hasChanges || isSaving}
            className="gap-2"
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={handleSaveSettings}
            disabled={!hasChanges || isSaving}
            className="gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save changes
            {hasChanges && !isSaving ? (
              <Badge variant="secondary" className="ml-1">Unsaved</Badge>
            ) : null}
          </Button>
        </div>
      </header>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex gap-2 bg-muted/40 p-1 border border-border/60 rounded-2xl overflow-x-auto">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-1 data-[state=active]:bg-background data-[state=active]:shadow px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general" className="space-y-6 focus-visible:outline-none">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>General information</CardTitle>
              <CardDescription>
                Basic details customers see across your storefront
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="gap-4 grid md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={storeNameId}>Store name</Label>
                  <Input
                    id={storeNameId}
                    value={getStringValue('storeName', '')}
                    onChange={(e) => handleSettingChange('storeName', e.target.value)}
                    placeholder="FastBite Restaurant"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={storeTaglineId}>Tagline</Label>
                  <Input
                    id={storeTaglineId}
                    value={getStringValue('storeTagline', '')}
                    onChange={(e) => handleSettingChange('storeTagline', e.target.value)}
                    placeholder="Delicious food, fast delivery"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={storeDescriptionId}>Description</Label>
                <Textarea
                  id={storeDescriptionId}
                  value={getStringValue('storeDescription', '')}
                  onChange={(e) => handleSettingChange('storeDescription', e.target.value)}
                  placeholder="Tell customers about your restaurant..."
                  rows={3}
                />
                <p className="text-muted-foreground text-xs">Display this copy on your storefront hero, metadata, and marketing blocks.</p>
              </div>
              <div className="gap-4 grid md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={currencyId}>Currency</Label>
                  <Select
                    value={getStringValue('currency', 'ZAR')}
                    onValueChange={(value) => handleSettingChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ZAR">ZAR (R)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={timezoneId}>Timezone</Label>
                  <Select
                    value={getStringValue('timezone', 'Africa/Johannesburg')}
                    onValueChange={(value) => handleSettingChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Johannesburg">South Africa (UTC+2)</SelectItem>
                      <SelectItem value="Africa/Lagos">West Africa (UTC+1)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Business hours</CardTitle>
              <CardDescription>
                Communicate when customers can place orders or contact you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="gap-4 grid md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={openingTimeId}>Opening time</Label>
                  <Input
                    id={openingTimeId}
                    type="time"
                    value={getStringValue('openingTime', '08:00')}
                    onChange={(e) => handleSettingChange('openingTime', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={closingTimeId}>Closing time</Label>
                  <Input
                    id={closingTimeId}
                    type="time"
                    value={getStringValue('closingTime', '22:00')}
                    onChange={(e) => handleSettingChange('closingTime', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Switch
                  id={isOpenId}
                  checked={getBooleanValue('isOpen', true)}
                  onCheckedChange={(checked) => handleSettingChange('isOpen', checked)}
                />
                <Label htmlFor={isOpenId} className="text-sm">
                  Restaurant is currently open
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6 focus-visible:outline-none">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Contact information</CardTitle>
              <CardDescription>
                How customers and couriers can reach you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="gap-4 grid md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={phoneId}>Phone number</Label>
                  <Input
                    id={phoneId}
                    value={getStringValue('phone', '')}
                    onChange={(e) => handleSettingChange('phone', e.target.value)}
                    placeholder="+27 xx xxx xxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={emailId}>Email address</Label>
                  <Input
                    id={emailId}
                    type="email"
                    value={getStringValue('email', '')}
                    onChange={(e) => handleSettingChange('email', e.target.value)}
                    placeholder="contact@fastbite.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={addressId}>Address</Label>
                <Textarea
                  id={addressId}
                  value={getStringValue('address', '')}
                  onChange={(e) => handleSettingChange('address', e.target.value)}
                  placeholder="Full restaurant address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6 focus-visible:outline-none">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Social media links</CardTitle>
              <CardDescription>
                Keep customers engaged across your channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="gap-4 grid md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={facebookId}>Facebook</Label>
                  <Input
                    id={facebookId}
                    value={getStringValue('facebook', '')}
                    onChange={(e) => handleSettingChange('facebook', e.target.value)}
                    placeholder="https://facebook.com/fastbite"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={instagramId}>Instagram</Label>
                  <Input
                    id={instagramId}
                    value={getStringValue('instagram', '')}
                    onChange={(e) => handleSettingChange('instagram', e.target.value)}
                    placeholder="https://instagram.com/fastbite"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={twitterId}>Twitter</Label>
                  <Input
                    id={twitterId}
                    value={getStringValue('twitter', '')}
                    onChange={(e) => handleSettingChange('twitter', e.target.value)}
                    placeholder="https://x.com/fastbite"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={whatsappId}>WhatsApp</Label>
                  <Input
                    id={whatsappId}
                    value={getStringValue('whatsapp', '')}
                    onChange={(e) => handleSettingChange('whatsapp', e.target.value)}
                    placeholder="+27 xx xxx xxxx"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6 focus-visible:outline-none">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Content settings</CardTitle>
              <CardDescription>
                Toggle promotional blocks and conversion features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Switch
                  id={showPopularMealsId}
                  checked={getBooleanValue('showPopularMeals', true)}
                  onCheckedChange={(checked) => handleSettingChange('showPopularMeals', checked)}
                />
                <Label htmlFor={showPopularMealsId} className="text-sm">Show popular meals section</Label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Switch
                  id={showTestimonialsId}
                  checked={getBooleanValue('showTestimonials', true)}
                  onCheckedChange={(checked) => handleSettingChange('showTestimonials', checked)}
                />
                <Label htmlFor={showTestimonialsId} className="text-sm">Show customer testimonials</Label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Switch
                  id={enableOnlineOrderingId}
                  checked={getBooleanValue('enableOnlineOrdering', true)}
                  onCheckedChange={(checked) => handleSettingChange('enableOnlineOrdering', checked)}
                />
                <Label htmlFor={enableOnlineOrderingId} className="text-sm">Enable online ordering</Label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Switch
                  id={enableReservationsId}
                  checked={getBooleanValue('enableReservations', false)}
                  onCheckedChange={(checked) => handleSettingChange('enableReservations', checked)}
                />
                <Label htmlFor={enableReservationsId} className="text-sm">Enable table reservations</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6 focus-visible:outline-none">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Appearance settings</CardTitle>
              <CardDescription>
                Control brand colours and interface defaults
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="gap-4 grid md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={primaryColorId}>Primary colour</Label>
                  <Input
                    id={primaryColorId}
                    type="color"
                    value={getStringValue('primaryColor', '#F97316')}
                    onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={secondaryColorId}>Secondary colour</Label>
                  <Input
                    id={secondaryColorId}
                    type="color"
                    value={getStringValue('secondaryColor', '#111827')}
                    onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Switch
                  id={darkModeId}
                  checked={getBooleanValue('darkMode', false)}
                  onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                />
                <Label htmlFor={darkModeId} className="text-sm">Enable dark mode by default</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}