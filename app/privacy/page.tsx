import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Mokta\'b',
  description: 'Learn about how Mokta\'b protects your privacy and data',
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground">
            Your privacy is important to us. Learn how we collect, use, and protect your data.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              <p className="text-muted-foreground mb-4">
                We collect information you provide directly to us, such as when you create an account,
                take quizzes, or contact us for support.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Account information (name, email, password)</li>
                <li>Quiz responses and results</li>
                <li>Usage data and analytics</li>
                <li>Communications with our support team</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use the information we collect to provide, maintain, and improve our services.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide and personalize our educational platform</li>
                <li>Process quiz submissions and generate results</li>
                <li>Send important updates and notifications</li>
                <li>Improve our services and develop new features</li>
                <li>Ensure platform security and prevent abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate security measures to protect your personal information against
                unauthorized access, alteration, disclosure, or destruction. This includes encryption
                of data in transit and at rest, regular security audits, and access controls.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Sharing</h2>
              <p className="text-muted-foreground">
                We do not sell, trade, or rent your personal information to third parties. We may share
                your information only in limited circumstances, such as with your consent, to comply with
                legal obligations, or to protect our rights and safety.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
              <p className="text-muted-foreground mb-4">
                You have the right to access, update, or delete your personal information.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Object to or restrict processing</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="bg-card p-4 rounded-lg border">
                <p className="text-foreground">Email: privacy@moktab.com</p>
                <p className="text-foreground">Support: support@moktab.com</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
