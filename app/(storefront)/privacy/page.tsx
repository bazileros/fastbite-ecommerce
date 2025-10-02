import {
  ArrowLeft,
  Cookie,
  Database,
  Eye,
  Lock,
  Mail,
  Phone,
  Shield,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Privacy Policy - FastBite',
  description: 'Learn how FastBite collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="border-b">
        <div className="mx-auto px-4 py-6 container">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="font-bold text-3xl">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: September 20, 2025</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 py-8 max-w-4xl container">
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                At FastBite, we are committed to protecting your privacy and ensuring the security of your personal information.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website
                and services.
              </p>
              <p>
                By using FastBite, you agree to the collection and use of information in accordance with this policy.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold text-lg">Personal Information</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Name and contact information (email, phone number)</li>
                  <li>• Delivery address and location data</li>
                  <li>• Payment information (processed securely by third-party providers)</li>
                  <li>• Order history and preferences</li>
                  <li>• Account credentials and profile information</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-lg">Automatically Collected Information</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• IP address and device information</li>
                  <li>• Browser type and version</li>
                  <li>• Pages visited and time spent on our site</li>
                  <li>• Referral sources</li>
                  <li>• Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We use the information we collect for the following purposes:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Process and fulfill your orders</li>
                <li>• Provide customer support and respond to inquiries</li>
                <li>• Send order confirmations and updates</li>
                <li>• Improve our services and website functionality</li>
                <li>• Personalize your experience and recommendations</li>
                <li>• Send marketing communications (with your consent)</li>
                <li>• Ensure security and prevent fraud</li>
                <li>• Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="w-5 h-5" />
                Cookies and Tracking Technologies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We use cookies and similar technologies to enhance your browsing experience, analyze site traffic,
                and personalize content. You can control cookie preferences through our cookie consent banner.
              </p>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Essential Cookies</h4>
                  <p className="text-muted-foreground text-sm">
                    Required for basic website functionality. Cannot be disabled.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Analytics Cookies</h4>
                  <p className="text-muted-foreground text-sm">
                    Help us understand how visitors interact with our website.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Marketing Cookies</h4>
                  <p className="text-muted-foreground text-sm">
                    Used to deliver personalized advertisements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We may share your information in the following circumstances:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Service Providers:</strong> With trusted third-party service providers who help us operate our business</li>
                <li>• <strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li>• <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li>• <strong>With Your Consent:</strong> When you explicitly agree to the sharing</li>
              </ul>
              <p className="text-muted-foreground text-sm">
                We do not sell your personal information to third parties for marketing purposes.
              </p>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We implement appropriate technical and organizational measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• SSL/TLS encryption for data transmission</li>
                <li>• Secure data storage with access controls</li>
                <li>• Regular security audits and updates</li>
                <li>• Employee training on data protection</li>
                <li>• Incident response procedures</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You have the following rights regarding your personal information:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Access:</strong> Request a copy of your personal information</li>
                <li>• <strong>Correction:</strong> Request correction of inaccurate information</li>
                <li>• <strong>Deletion:</strong> Request deletion of your personal information</li>
                <li>• <strong>Portability:</strong> Request transfer of your data</li>
                <li>• <strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li>• <strong>Cookie Control:</strong> Manage cookie preferences</li>
              </ul>
              <p className="text-sm">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Us
              </CardTitle>
              <CardDescription>
                If you have any questions about this Privacy Policy or our data practices:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>privacy@fastbite.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>1-800-FASTBITE</span>
              </div>
              <p className="text-muted-foreground text-sm">
                FastBite<br />
                123 Food Street<br />
                Culinary City, FC 12345
              </p>
            </CardContent>
          </Card>

          {/* Changes to Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Posting the new Privacy Policy on this page</li>
                <li>• Sending you an email notification</li>
                <li>• Displaying a prominent notice on our website</li>
              </ul>
              <p className="text-sm">
                Your continued use of our services after any changes constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}