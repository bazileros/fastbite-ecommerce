"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Clock,
  Facebook,
  Headphones,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Twitter,
} from 'lucide-react';
import {
  useId,
  useState,
} from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const { toast } = useToast();
  const nameId = useId();
  const emailId = useId();
  const subjectId = useId();
  const messageId = useId();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Simulate form submission
    toast({
      title: "Message Sent!",
      description: "Thank you for your message. We'll get back to you soon.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  const handleQuickQuestion = (type: string) => {
    const messages = {
      order: "I'd like to check the status of my order",
      menu: "I have a question about the menu",
      location: "I need information about your locations and hours",
      other: "I have a different question"
    };

    setChatMessage(messages[type as keyof typeof messages] || "");
    toast({
      title: "Quick Question Selected",
      description: "Your message has been prepared. Click send to continue.",
    });
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) {
      toast({
        title: "Empty Message",
        description: "Please type a message before sending.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Message Sent!",
      description: "Our support team will respond shortly.",
    });

    setChatMessage("");
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-background-light dark:bg-background-dark overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
        <div className="relative mx-auto px-4 py-20 text-center container">
          <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/20 mb-6 px-4 py-2 rounded-full w-fit font-medium text-primary">
            Get In Touch
          </Badge>
          <h1 className="mb-6 font-display text-text-light dark:text-text-dark text-4xl md:text-6xl leading-tight">
            We&apos;d Love to Hear
            <span className="block text-primary">From You</span>
          </h1>
          <p className="mx-auto max-w-2xl text-text-secondary-light dark:text-text-secondary-dark text-lg leading-relaxed">
            Have a question about our menu? Need help with an order? Or just want to share your FastBite experience? We&apos;re here to help.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 py-16 container">
        <div className="gap-12 grid lg:grid-cols-2 mx-auto max-w-6xl">

          {/* Contact Form */}
          <Card className="bg-card-light dark:bg-card-dark shadow-xl border-0 hover-lift">
            <CardHeader className="pb-6">
              <CardTitle className="font-display text-text-light dark:text-text-dark text-2xl">Send us a Message</CardTitle>
              <CardDescription className="text-text-secondary-light dark:text-text-secondary-dark">
                Fill out the form below and we&apos;ll get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="gap-4 grid md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={nameId} className="font-medium text-text-light dark:text-text-dark">Name *</Label>
                    <Input
                      id={nameId}
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      className="bg-background-light dark:bg-background-dark border-gray-200 focus:border-primary dark:border-gray-700"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={emailId} className="font-medium text-text-light dark:text-text-dark">Email *</Label>
                    <Input
                      id={emailId}
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      className="bg-background-light dark:bg-background-dark border-gray-200 focus:border-primary dark:border-gray-700"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={subjectId} className="font-medium text-text-light dark:text-text-dark">Subject</Label>
                  <Input
                    id={subjectId}
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="What's this about?"
                    className="bg-background-light dark:bg-background-dark border-gray-200 focus:border-primary dark:border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={messageId} className="font-medium text-text-light dark:text-text-dark">Message *</Label>
                  <Textarea
                    id={messageId}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us what's on your mind..."
                    rows={6}
                    className="bg-background-light dark:bg-background-dark border-gray-200 focus:border-primary dark:border-gray-700 resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl px-6 py-3 rounded-lg font-semibold text-white transition" size="lg">
                    <Send className="mr-2 w-4 h-4" />
                    Send Message
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="hover:bg-primary px-6 py-3 border-primary rounded-lg font-semibold text-primary hover:text-white transition"
                    onClick={() => {
                      // Simulate live chat opening
                      toast({
                        title: "Live Chat",
                        description: "Connecting you to our support team...",
                      });
                    }}
                  >
                    <MessageCircle className="mr-2 w-4 h-4" />
                    Live Chat
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">

            {/* Quick Contact Cards */}
            <div className="gap-4 grid md:grid-cols-2">
              <Card className="bg-card-light dark:bg-card-dark shadow-lg border-0 text-center hover-lift">
                <CardContent className="pt-6">
                  <div className="flex justify-center items-center bg-primary/10 mx-auto mb-4 rounded-full w-12 h-12">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-display text-text-light dark:text-text-dark text-lg">Call Us</h3>
                  <p className="mb-3 text-text-secondary-light dark:text-text-secondary-dark text-sm">(555) 123-FAST</p>
                  <Button size="sm" variant="outline" className="hover:bg-primary border-primary w-full text-primary hover:text-white">
                    Call Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card-light dark:bg-card-dark shadow-lg border-0 text-center hover-lift">
                <CardContent className="pt-6">
                  <div className="flex justify-center items-center bg-primary/10 mx-auto mb-4 rounded-full w-12 h-12">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-display text-text-light dark:text-text-dark text-lg">Email Us</h3>
                  <p className="mb-3 text-text-secondary-light dark:text-text-secondary-dark text-sm">hello@fastbite.com</p>
                  <Button size="sm" variant="outline" className="hover:bg-primary border-primary w-full text-primary hover:text-white">
                    Send Email
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Location & Hours */}
            <Card className="bg-card-light dark:bg-card-dark shadow-xl border-0">
              <CardHeader>
                <CardTitle className="font-display text-text-light dark:text-text-dark text-2xl">Visit Our Locations</CardTitle>
                <CardDescription className="text-text-secondary-light dark:text-text-secondary-dark">
                  Find us at these convenient locations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 bg-background-light dark:bg-background-dark p-4 rounded-lg">
                    <div className="flex flex-shrink-0 justify-center items-center bg-primary/10 rounded-full w-10 h-10">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-light dark:text-text-dark text-lg">Downtown Location</h3>
                      <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm leading-relaxed">
                        123 Food Street<br />
                        Downtown District<br />
                        City, State 12345
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 bg-background-light dark:bg-background-dark p-4 rounded-lg">
                    <div className="flex flex-shrink-0 justify-center items-center bg-primary/10 rounded-full w-10 h-10">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-light dark:text-text-dark text-lg">Westside Branch</h3>
                      <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm leading-relaxed">
                        456 Culinary Avenue<br />
                        Westside Plaza<br />
                        City, State 12345
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 bg-background-light dark:bg-background-dark p-4 rounded-lg">
                    <div className="flex flex-shrink-0 justify-center items-center bg-primary/10 rounded-full w-10 h-10">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-light dark:text-text-dark text-lg">Airport Location</h3>
                      <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm leading-relaxed">
                        Terminal 2, Gate Area<br />
                        International Airport<br />
                        City, State 12345
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                <div className="flex items-start space-x-4">
                  <div className="flex flex-shrink-0 justify-center items-center bg-primary/10 rounded-full w-10 h-10">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-text-light dark:text-text-dark text-lg">Opening Hours</h3>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                      <span className="font-medium">Mon-Sun:</span> 11:00 AM - 10:00 PM<br />
                      <span className="text-primary text-xs">Extended hours during holidays</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-card-light dark:bg-card-dark shadow-xl border-0">
              <CardHeader>
                <CardTitle className="font-display text-text-light dark:text-text-dark text-2xl">Quick Actions</CardTitle>
                <CardDescription className="text-text-secondary-light dark:text-text-secondary-dark">
                  Need something specific? We&apos;ve got you covered.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="justify-start hover:bg-primary p-4 border-primary w-full h-auto text-primary hover:text-white">
                  <Phone className="mr-3 w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">Call for Reservations</div>
                    <div className="opacity-75 text-xs">Book a table or large order</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start hover:bg-primary p-4 border-primary w-full h-auto text-primary hover:text-white">
                  <Mail className="mr-3 w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">Catering Inquiry</div>
                    <div className="opacity-75 text-xs">Events and large gatherings</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start hover:bg-primary p-4 border-primary w-full h-auto text-primary hover:text-white">
                  <MapPin className="mr-3 w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">Find Nearest Location</div>
                    <div className="opacity-75 text-xs">Use our store locator</div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Social Media Integration */}
        <div className="mx-auto mt-16 max-w-4xl">
          <Card className="bg-card-light dark:bg-card-dark shadow-xl border-0">
            <CardHeader className="pb-6 text-center">
              <CardTitle className="font-display text-text-light dark:text-text-dark text-2xl">Follow Our Journey</CardTitle>
              <CardDescription className="mx-auto max-w-md text-text-secondary-light dark:text-text-secondary-dark">
                Stay connected for exclusive deals, behind-the-scenes content, and the latest menu innovations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="gap-4 grid md:grid-cols-3 mb-8">
                <Button
                  variant="outline"
                  className="group flex-col gap-3 hover:bg-primary/5 p-6 border-primary/20 hover:border-primary h-auto"
                  onClick={() => window.open('https://facebook.com/fastbite', '_blank')}
                >
                  <Facebook className="w-8 h-8 text-primary group-hover:scale-110 transition" />
                  <div className="text-center">
                    <div className="font-semibold text-text-light dark:text-text-dark">Facebook</div>
                    <div className="text-text-secondary-light dark:text-text-secondary-dark text-sm">2.1K followers</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="group flex-col gap-3 hover:bg-primary/5 p-6 border-primary/20 hover:border-primary h-auto"
                  onClick={() => window.open('https://instagram.com/fastbite', '_blank')}
                >
                  <Instagram className="w-8 h-8 text-primary group-hover:scale-110 transition" />
                  <div className="text-center">
                    <div className="font-semibold text-text-light dark:text-text-dark">Instagram</div>
                    <div className="text-text-secondary-light dark:text-text-secondary-dark text-sm">1.8K followers</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="group flex-col gap-3 hover:bg-primary/5 p-6 border-primary/20 hover:border-primary h-auto"
                  onClick={() => window.open('https://twitter.com/fastbite', '_blank')}
                >
                  <Twitter className="w-8 h-8 text-primary group-hover:scale-110 transition" />
                  <div className="text-center">
                    <div className="font-semibold text-text-light dark:text-text-dark">Twitter</div>
                    <div className="text-text-secondary-light dark:text-text-secondary-dark text-sm">950 followers</div>
                  </div>
                </Button>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-700 mb-6" />

              <div className="text-center">
                <p className="mb-4 text-text-secondary-light dark:text-text-secondary-dark">
                  Join our community for exclusive deals, early access to new menu items, and special events!
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 hover:bg-primary text-primary hover:text-white transition">Daily Specials</Badge>
                  <Badge variant="secondary" className="bg-primary/10 hover:bg-primary text-primary hover:text-white transition">Behind the Scenes</Badge>
                  <Badge variant="secondary" className="bg-primary/10 hover:bg-primary text-primary hover:text-white transition">Customer Spotlights</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Chat Widget */}
        <div className="right-6 bottom-6 z-50 fixed">
          <Card className="bg-card-light dark:bg-card-dark shadow-2xl border-0 w-80 hover-lift">
            <CardHeader className="bg-primary/5 pb-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-green-500 rounded-full w-3 h-3 animate-pulse"></div>
                  <CardTitle className="font-display text-text-light dark:text-text-dark text-lg">Live Support</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-primary/10"
                  onClick={() => setIsChatOpen(!isChatOpen)}
                >
                  {isChatOpen ? '−' : '+'}
                </Button>
              </div>
            </CardHeader>

            {isChatOpen && (
              <CardContent className="space-y-4">
                <div className="bg-primary/5 p-4 rounded-lg">
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                    <strong className="text-primary">FastBite Support:</strong> Hi! How can we help you today?
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start hover:bg-primary/5 border-primary/20 hover:border-primary w-full text-left"
                    onClick={() => handleQuickQuestion('order')}
                  >
                    📋 Order Status
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start hover:bg-primary/5 border-primary/20 hover:border-primary w-full text-left"
                    onClick={() => handleQuickQuestion('menu')}
                  >
                    🍽️ Menu Questions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start hover:bg-primary/5 border-primary/20 hover:border-primary w-full text-left"
                    onClick={() => handleQuickQuestion('location')}
                  >
                    📍 Location & Hours
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start hover:bg-primary/5 border-primary/20 hover:border-primary w-full text-left"
                    onClick={() => handleQuickQuestion('other')}
                  >
                    💬 Other
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="bg-background-light dark:bg-background-dark border-gray-200 focus:border-primary dark:border-gray-700"
                  />
                  <Button size="sm" className="bg-primary hover:bg-primary/90 px-4">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex justify-center items-center gap-1 text-text-secondary-light dark:text-text-secondary-dark text-xs text-center">
                  <Headphones className="w-3 h-3" />
                  Typically replies in under 2 minutes
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}