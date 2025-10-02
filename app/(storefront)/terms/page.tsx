import {
  AlertTriangle,
  ArrowLeft,
  CreditCard,
  FileText,
  Shield,
  Users,
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
  title: 'Terms of Service - FastBite',
  description: 'Read the terms and conditions for using FastBite services.',
};

export default function TermsOfServicePage() {
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
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="font-bold text-3xl">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: September 20, 2025</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 py-8 container max-w-4xl">
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>Agreement to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Welcome to FastBite! These Terms of Service (&quot;Terms&quot;) govern your use of our website,
                mobile application, and services provided by FastBite (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
              </p>
              <p>
                By accessing or using our services, you agree to be bound by these Terms. If you disagree
                with any part of these terms, then you may not access our services.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-yellow-800">Important Notice</p>
                    <p className="text-sm text-yellow-700">
                      These terms contain important legal information about your rights and obligations.
                      Please read them carefully.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Accounts and Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Creation</h3>
                <p className="text-muted-foreground">
                  To use certain features of our service, you must create an account. You agree to:
                </p>
                <ul className="mt-2 space-y-1 text-muted-foreground ml-4">
                  <li>• Provide accurate and complete information</li>
                  <li>• Maintain the security of your password</li>
                  <li>• Accept responsibility for all activities under your account</li>
                  <li>• Notify us immediately of any unauthorized use</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Account Termination</h3>
                <p className="text-muted-foreground">
                  We reserve the right to terminate or suspend your account at our discretion,
                  with or without notice, for conduct that violates these Terms.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Orders and Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Orders, Payments, and Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Order Acceptance</h3>
                <p className="text-muted-foreground">
                  All orders are subject to acceptance and availability. We reserve the right to refuse
                  or cancel any order for any reason, including but not limited to:
                </p>
                <ul className="mt-2 space-y-1 text-muted-foreground ml-4">
                  <li>• Product unavailability</li>
                  <li>• Errors in product information or pricing</li>
                  <li>• Problems with payment authorization</li>
                  <li>• Suspected fraudulent activity</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Pricing and Payment</h3>
                <p className="text-muted-foreground">
                  All prices are subject to change without notice. Payment must be received in full
                  before order processing. We accept major credit cards and other payment methods
                  as indicated on our website.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Delivery</h3>
                <p className="text-muted-foreground">
                  Delivery times are estimates only. We are not responsible for delays caused by
                  factors beyond our control. Additional delivery fees may apply.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Conduct */}
          <Card>
            <CardHeader>
              <CardTitle>Acceptable Use and Conduct</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You agree not to use our services to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Violate any applicable laws or regulations</li>
                <li>• Infringe on the rights of others</li>
                <li>• Transmit harmful or malicious code</li>
                <li>• Attempt to gain unauthorized access to our systems</li>
                <li>• Use our services for any fraudulent or illegal purpose</li>
                <li>• Interfere with or disrupt our services</li>
                <li>• Post or transmit offensive, harmful, or inappropriate content</li>
                <li>• Impersonate any person or entity</li>
              </ul>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The FastBite website and services contain material which is owned by or licensed to us.
                This material includes, but is not limited to, the design, layout, look, appearance, and
                graphics. You may not reproduce, distribute, display, or create derivative works of our
                intellectual property without our prior written consent.
              </p>
              <p>
                All trademarks, service marks, and trade names used on our website are trademarks or
                registered trademarks of FastBite or their respective owners.
              </p>
            </CardContent>
          </Card>

          {/* Privacy and Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy and Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Your privacy is important to us. Our collection and use of personal information is governed
                by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <p>
                By using our services, you consent to the collection, use, and disclosure of your information
                as described in our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimers and Limitations */}
          <Card>
            <CardHeader>
              <CardTitle>Disclaimers and Limitations of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Service Disclaimers</h3>
                <p className="text-muted-foreground">
                  Our services are provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
                  either express or implied. We do not guarantee that our services will be uninterrupted,
                  error-free, or secure.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Food Allergies and Dietary Restrictions</h3>
                <p className="text-muted-foreground">
                  You are responsible for informing us of any food allergies or dietary restrictions.
                  We cannot guarantee that our food is free from allergens or meets specific dietary requirements.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Limitation of Liability</h3>
                <p className="text-muted-foreground">
                  In no event shall FastBite be liable for any indirect, incidental, special, consequential,
                  or punitive damages arising out of or related to your use of our services.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may terminate or suspend your account and access to our services immediately,
                without prior notice or liability, for any reason, including but not limited to breach
                of these Terms.
              </p>
              <p>
                Upon termination, your right to use our services will cease immediately. All provisions
                of these Terms which by their nature should survive termination shall survive.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>Governing Law and Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction
                in which FastBite operates, without regard to its conflict of law provisions.
              </p>
              <p>
                Any disputes arising from these Terms or your use of our services shall be resolved through
                binding arbitration in accordance with the rules of the applicable arbitration association.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of any material
                changes by posting the updated Terms on our website and updating the &quot;Last updated&quot; date.
              </p>
              <p>
                Your continued use of our services after any such changes constitutes your acceptance
                of the new Terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                If you have any questions about these Terms of Service:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>legal@fastbite.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>1-800-FASTBITE</span>
              </div>
              <p className="text-sm text-muted-foreground">
                FastBite Legal Department<br />
                123 Food Street<br />
                Culinary City, FC 12345
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}