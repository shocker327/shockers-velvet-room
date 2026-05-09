export default function Privacy() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading text-4xl font-bold text-velvet-gold mb-8">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: May 2026</p>

        <div className="space-y-8 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="font-heading text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
              <li><strong className="text-gray-300">Anonymous Identifiers:</strong> A randomly generated UUID stored in your browser's localStorage to maintain your session and chat history.</li>
              <li><strong className="text-gray-300">Chat Messages:</strong> The content of your conversations with AI companions, stored to provide continuity in your experience.</li>
              <li><strong className="text-gray-300">Email Address:</strong> Only if you voluntarily join our waitlist.</li>
              <li><strong className="text-gray-300">Usage Data:</strong> Basic analytics such as pages visited and features used.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
            <p>Your information is used to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
              <li>Provide and maintain the chat service</li>
              <li>Preserve your conversation history across sessions</li>
              <li>Improve our AI companions and service quality</li>
              <li>Send waitlist notifications (email only, with consent)</li>
              <li>Ensure compliance with our Terms of Service</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-white mb-3">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including encrypted 
              connections (HTTPS), secure server infrastructure, and access controls. However, no method 
              of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-white mb-3">4. Data Retention</h2>
            <p>
              Chat history is retained for as long as your anonymous session exists. If you clear your 
              browser's localStorage, your session identifier will be lost, and you will no longer be able 
              to access previous conversations. We may periodically purge inactive accounts and their 
              associated data after 12 months of inactivity.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-white mb-3">5. Cookies & Local Storage</h2>
            <p>
              The Velvet Suite uses browser localStorage to store your anonymous user ID and age verification 
              status. We do not use third-party tracking cookies. Essential cookies may be used for basic 
              site functionality.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-white mb-3">6. Third-Party Services</h2>
            <p>
              We use OpenAI's API to power our AI companions. Your messages are sent to OpenAI for processing. 
              Please review OpenAI's privacy policy for information about how they handle data. We do not sell 
              or share your personal information with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-white mb-3">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
              <li>Request deletion of your chat history (use the "Clear Chat" feature or contact us)</li>
              <li>Request removal from our waitlist</li>
              <li>Access information about what data we hold about you</li>
              <li>Object to processing of your data</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-white mb-3">8. Children's Privacy</h2>
            <p>
              The Velvet Suite is strictly for adults aged 18 and over. We do not knowingly collect information 
              from anyone under 18. If we discover that a minor has accessed our service, we will immediately 
              terminate their access and delete their data.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-white mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify users of any material changes 
              by posting the new policy on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-white mb-3">10. Contact Us</h2>
            <p>
              For questions or concerns about this Privacy Policy or your data, contact us at:{' '}
              <a href="mailto:support@shockersvelvetsuite.shop" className="text-velvet-gold hover:underline">
                support@shockersvelvetsuite.shop
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
