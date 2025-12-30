import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | Mokta\'b',
  description: 'Read our terms of service and usage guidelines',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-muted-foreground">
            Please read these terms carefully before using Mokta&apos;b platform.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Mokta&apos;b, you accept and agree to be bound by the terms
                and provision of this agreement. If you do not agree to abide by the above,
                please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Use License</h2>
              <p className="text-muted-foreground mb-4">
                Permission is granted to temporarily use Mokta&apos;b for personal, non-commercial
                transitory viewing only. This is the grant of a license, not a transfer of title,
                and under this license you may not:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to decompile or reverse engineer any software contained on the platform</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>
              <p className="text-muted-foreground mb-4">
                When you create an account with us, you must provide information that is accurate,
                complete, and current at all times. You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Safeguarding your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring your use complies with applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
              <p className="text-muted-foreground mb-4">
                You agree not to use the service to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful or malicious code</li>
                <li>Harass, abuse, or harm others</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Share inappropriate or offensive content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Content Ownership</h2>
              <p className="text-muted-foreground">
                You retain ownership of content you create and submit to the platform.
                By submitting content, you grant us a license to use, display, and distribute
                your content solely for the purpose of providing our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Service Availability</h2>
              <p className="text-muted-foreground">
                We strive to provide continuous service but do not guarantee that the service
                will be uninterrupted or error-free. We reserve the right to modify or discontinue
                the service at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground">
                In no event shall Mokta&apos;b or its suppliers be liable for any damages
                (including, without limitation, damages for loss of data or profit,
                or due to business interruption) arising out of the use or inability
                to use the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Privacy</h2>
              <p className="text-muted-foreground">
                Your privacy is important to us. Please review our Privacy Policy,
                which also governs your use of the service, to understand our practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. We will notify
                users of any material changes via email or through the platform.
                Your continued use of the service after such modifications constitutes
                acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-card p-4 rounded-lg border">
                <p className="text-foreground">Email: legal@moktab.com</p>
                <p className="text-foreground">Support: support@moktab.com</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
