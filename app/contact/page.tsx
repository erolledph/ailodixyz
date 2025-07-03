'use client';

import { useState } from 'react';
import { Mail, MessageSquare, Send, Brain, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // You can integrate with your preferred form handling service
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-background">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex justify-center items-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <Brain size={20} className="text-primary" />
            <span className="text-sm font-medium text-primary">Get In Touch</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Connect With AI Lodi</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Have insights to share, questions about AI and tech trends, or want to collaborate? 
          We'd love to hear from you. Join our global community of tech innovators and thought leaders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                <MessageSquare className="text-primary" />
                Share Your Tech Insights
              </CardTitle>
              <p className="text-muted-foreground">
                Whether you have a story idea, want to contribute, or have questions about our content, 
                we're here to connect with fellow tech enthusiasts.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="focus:border-primary focus:ring-primary"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="AI insights, collaboration, or general inquiry"
                    className="focus:border-primary focus:ring-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your tech insights, questions, or collaboration ideas..."
                    rows={6}
                    className="focus:border-primary focus:ring-primary"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Send size={18} className="mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="space-y-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Email Us</h3>
                  <p className="text-muted-foreground">Get in touch directly</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                <a 
                  href="mailto:hello@ailodi.tech" 
                  className="text-primary hover:text-primary/80"
                >
                  hello@ailodi.tech
                </a>
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Zap size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Collaboration</h3>
                  <p className="text-muted-foreground">Partner with us</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                <a 
                  href="mailto:collaborate@ailodi.tech" 
                  className="text-primary hover:text-primary/80"
                >
                  collaborate@ailodi.tech
                </a>
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Globe size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Global Reach</h3>
                  <p className="text-muted-foreground">Worldwide community</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                Remote-first team<br />
                Serving tech enthusiasts globally
              </p>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    How can I contribute content?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    We welcome guest contributions on AI, programming, and tech trends. Reach out with your ideas!
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    Do you cover emerging technologies?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! We focus on cutting-edge tech including quantum computing, biotech, and space innovation.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    How quickly do you respond?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    We typically respond within 24 hours during business days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}