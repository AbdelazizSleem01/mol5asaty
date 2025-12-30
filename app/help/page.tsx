import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Help Center | Mokta\'b',
  description: 'Get help and support for using Mokta\'b platform',
};

export default function HelpPage() {
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
            Help Center
          </h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions and get support for Mokta&apos;b platform.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="space-y-8">
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">How do I create a quiz?</h3>
                <p className="text-muted-foreground">
                  After logging in, go to your dashboard and click &quot;Create New Quiz&quot;.
                  Fill in the quiz details, add questions, and publish it.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">How do I take a quiz?</h3>
                <p className="text-muted-foreground">
                  Use the quiz link provided by your teacher. Enter your name and start answering questions.
                  Make sure to submit before time runs out.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Can I review my quiz results?</h3>
                <p className="text-muted-foreground">
                  Yes! If you were logged in when taking the quiz, you can view your results
                  and detailed answers in your dashboard.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">How do I reset my password?</h3>
                <p className="text-muted-foreground">
                  Go to your profile page and update your password in the account settings.
                  Make sure to enter your current password first.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-2xl font-semibold mb-4">Need More Help?</h2>
            <p className="text-muted-foreground mb-4">
              If you can&apos;t find the answer you&apos;re looking for, feel free to contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:support@moktab.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </a>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
