'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Save, Eye, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface Setting {
  id: string;
  key: string;
  value: string;
  type: string;
  category: string;
  description: string | null;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || []);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (res.ok) {
        setMessage('✅ تم حفظ الإعدادات بنجاح');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ فشل في حفظ الإعدادات');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('❌ حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev =>
      prev.map(s => (s.key === key ? { ...s, value } : s))
    );
  };

  const getSettingsByCategory = (category: string) => {
    return settings.filter(s => s.category === category);
  };

  const renderSettingInput = (setting: Setting) => {
    return (
      <div key={setting.key} className="space-y-2">
        <Label htmlFor={setting.key}>
          {setting.description || setting.key}
        </Label>
        {setting.type === 'boolean' ? (
          <select
            id={setting.key}
            value={setting.value}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="true">نعم</option>
            <option value="false">لا</option>
          </select>
        ) : (
          <Input
            id={setting.key}
            type={setting.type === 'number' ? 'number' : 'text'}
            value={setting.value}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            placeholder={setting.description || ''}
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">إعدادات الموقع</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/settings/slider">
              <Button variant="outline" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                إدارة السلايدر
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                معاينة الموقع
              </Button>
            </Link>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <Card className="p-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">إعدادات عامة</TabsTrigger>
              <TabsTrigger value="appearance">المظهر</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="social">وسائل التواصل</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">الإعدادات العامة</h2>
              {getSettingsByCategory('general').map(renderSettingInput)}
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">إعدادات المظهر</h2>
              {getSettingsByCategory('appearance').map(renderSettingInput)}
            </TabsContent>

            <TabsContent value="seo" className="space-y-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">إعدادات SEO</h2>
              {getSettingsByCategory('seo').map(renderSettingInput)}
            </TabsContent>

            <TabsContent value="social" className="space-y-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">وسائل التواصل الاجتماعي</h2>
              {getSettingsByCategory('social').map(renderSettingInput)}
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
