import {
  Accessibility,
  ArrowLeft,
  CheckCircle,
  Eye,
  Keyboard,
  Monitor,
  Users,
  Volume2,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Accessibility - FastBite',
  description: 'Learn about FastBite\'s commitment to accessibility and how we ensure our services are usable by everyone.',
};

export default function AccessibilityPage() {
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
            <Accessibility className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="font-bold text-3xl">Accessibility Statement</h1>
              <p className="text-muted-foreground">Committed to inclusive digital experiences</p>
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
                <Users className="w-5 h-5" />
                Our Commitment to Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                At FastBite, we are committed to ensuring that our website and services are accessible
                to everyone, including people with disabilities. We strive to provide an inclusive
                experience that meets or exceeds the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
              </p>
              <p>
                This accessibility statement outlines our efforts to make our digital services usable
                by people with a wide range of disabilities, including visual, auditory, motor, and cognitive impairments.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="secondary">WCAG 2.1 AA Compliant</Badge>
                <Badge variant="secondary">Section 508 Compliant</Badge>
                <Badge variant="secondary">ADA Compliant</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Accessibility Features
              </CardTitle>
              <CardDescription>
                Built-in features that enhance accessibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="gap-6 grid md:grid-cols-2">
                <div className="flex items-start gap-4">
                  <Eye className="flex-shrink-0 mt-1 w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="mb-2 font-semibold">Screen Reader Support</h3>
                    <p className="text-muted-foreground text-sm">
                      Our website is fully compatible with popular screen readers including JAWS, NVDA, and VoiceOver.
                      All content is properly structured with semantic HTML and ARIA labels.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Keyboard className="flex-shrink-0 mt-1 w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="mb-2 font-semibold">Keyboard Navigation</h3>
                    <p className="text-muted-foreground text-sm">
                      Navigate through our entire website using only the keyboard. All interactive elements
                      are accessible via Tab key, and keyboard shortcuts are available for common actions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Volume2 className="flex-shrink-0 mt-1 w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="mb-2 font-semibold">Audio Descriptions</h3>
                    <p className="text-muted-foreground text-sm">
                      Audio descriptions are available for all video content. Our interface provides
                      clear audio feedback for user actions and status changes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Monitor className="flex-shrink-0 mt-1 w-6 h-6 text-orange-600" />
                  <div>
                    <h3 className="mb-2 font-semibold">High Contrast Mode</h3>
                    <p className="text-muted-foreground text-sm">
                      High contrast color schemes are available to improve readability for users
                      with visual impairments. Text size can be adjusted up to 200% without loss of functionality.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Standards Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>Standards and Guidelines</CardTitle>
              <CardDescription>
                Our commitment to accessibility standards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold">WCAG 2.1 Level AA</h3>
                  <p className="text-muted-foreground">
                    We adhere to the Web Content Accessibility Guidelines 2.1 Level AA, which ensures
                    our website is perceivable, operable, understandable, and robust for people with disabilities.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">Section 508</h3>
                  <p className="text-muted-foreground">
                    Our digital services comply with Section 508 of the Rehabilitation Act, ensuring
                    accessibility for federal employees and citizens with disabilities.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">ADA Compliance</h3>
                  <p className="text-muted-foreground">
                    We are committed to compliance with the Americans with Disabilities Act (ADA)
                    Title III requirements for places of public accommodation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Browser and Device Support */}
          <Card>
            <CardHeader>
              <CardTitle>Browser and Device Support</CardTitle>
              <CardDescription>
                Accessibility across different platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="gap-4 grid md:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-semibold">Supported Browsers</h3>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• Chrome (latest 2 versions)</li>
                    <li>• Firefox (latest 2 versions)</li>
                    <li>• Safari (latest 2 versions)</li>
                    <li>• Edge (latest 2 versions)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">Supported Devices</h3>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• Desktop computers</li>
                    <li>• Laptops</li>
                    <li>• Tablets</li>
                    <li>• Mobile phones</li>
                    <li>• Screen readers</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assistive Technologies */}
          <Card>
            <CardHeader>
              <CardTitle>Compatible Assistive Technologies</CardTitle>
              <CardDescription>
                Tools and technologies we support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="gap-4 grid md:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-semibold">Screen Readers</h3>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• JAWS</li>
                    <li>• NVDA</li>
                    <li>• VoiceOver (macOS/iOS)</li>
                    <li>• TalkBack (Android)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">Other Tools</h3>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• ZoomText</li>
                    <li>• Dragon NaturallySpeaking</li>
                    <li>• Braille displays</li>
                    <li>• Alternative keyboards</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback and Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback and Support</CardTitle>
              <CardDescription>
                Help us improve our accessibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We are committed to continuously improving the accessibility of our website and services.
                If you encounter any accessibility barriers or have suggestions for improvement, please contact us.
              </p>

              <div className="space-y-2">
                <h3 className="font-semibold">Contact Information</h3>
                <div className="space-y-1 text-muted-foreground text-sm">
                  <p><strong>Email:</strong> accessibility@fastbite.com</p>
                  <p><strong>Phone:</strong> 1-800-FASTBITE (Accessibility Line)</p>
                  <p><strong>Response Time:</strong> We aim to respond to accessibility concerns within 2 business days</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Report an Issue:</strong> If you experience difficulty accessing any part of our website,
                  please provide details about the issue, the browser and assistive technology you are using,
                  and steps to reproduce the problem.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Statement Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Statement Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                This accessibility statement was last updated on September 20, 2025. We regularly review
                and update our accessibility practices to ensure ongoing compliance with standards and
                guidelines.
              </p>
              <p>
                We will update this statement whenever we make significant changes to our website that
                affect accessibility, or when new accessibility standards or guidelines are published.
              </p>
            </CardContent>
          </Card>

          {/* Legal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Legal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                FastBite is committed to complying with all applicable accessibility laws and regulations.
                This includes but is not limited to:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Americans with Disabilities Act (ADA) Title III</li>
                <li>• Section 508 of the Rehabilitation Act</li>
                <li>• Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</li>
                <li>• State and local accessibility requirements</li>
              </ul>
              <p className="text-sm">
                If you believe you have been discriminated against due to a disability, you may file a complaint
                with the appropriate government agency or pursue legal remedies as provided by law.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}