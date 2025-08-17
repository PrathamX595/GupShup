function CommunityGuidelinesPage() {
  return (
    <div className="flex justify-center p-8 min-h-full">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-center">Community Guidelines</h1>
          <p className="text-gray-600 text-center">Last updated: 17-08-2025</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[#FDC62E] border-b border-gray-200 pb-2">
              1. Our Mission
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                GupShup aims to provide a safe, respectful, and enjoyable environment for meaningful conversations. 
                These guidelines help ensure everyone has a positive experience on our platform.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-[#FDC62E] border-b border-gray-200 pb-2">
              2. Expected Behavior
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>We expect all users to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Treat others with respect and courtesy</li>
                <li>Be patient with people from different backgrounds and communication styles</li>
                <li>Keep conversations positive and constructive</li>
                <li>Respect personal boundaries when someone seems uncomfortable</li>
                <li>Report inappropriate behavior when encountered</li>
                <li>Use the platform's features responsibly</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-[#FDC62E] border-b border-gray-200 pb-2">
              3. Prohibited Conduct
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>The following activities are strictly prohibited:</p>
              
              <div>
                <h3 className="font-semibold mb-2">Harassment and Abuse</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Threatening, intimidating, or aggressive behavior</li>
                  <li>Persistent unwanted contact after being asked to stop</li>
                  <li>Sharing personal information without consent</li>
                  <li>Stalking or following users across sessions</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Inappropriate Content</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Nudity, sexual content, or inappropriate behavior on camera</li>
                  <li>Sharing explicit, violent, or disturbing material</li>
                  <li>Content that violates local laws or regulations</li>
                  <li>Spam, excessive advertising, or commercial solicitation</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Discriminatory Behavior</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Hate speech based on race, ethnicity, religion, gender, sexuality, or other protected characteristics</li>
                  <li>Discriminatory language or behavior</li>
                  <li>Promoting violence or hatred against individuals or groups</li>
                  <li>Impersonating others or creating fake personas</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-[#FDC62E] border-b border-gray-200 pb-2">
              4. Safety Features and Tools
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>GupShup provides several safety features to protect users:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Skip Function:</strong> Use the spacebar to quickly move to the next conversation</li>
                <li><strong>Anonymous Connections:</strong> Your personal information remains private by default</li>
                <li><strong>Secure Communication:</strong> All video calls use end-to-end encryption</li>
                <li><strong>Account Controls:</strong> Manage your privacy settings and account preferences</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-[#FDC62E] border-b border-gray-200 pb-2">
              5. Best Practices for Positive Interactions
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                To help create meaningful connections:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ask open-ended questions to encourage conversation</li>
                <li>Share appropriate personal experiences and stories</li>
                <li>Be genuinely interested in learning about others</li>
                <li>Use the voting system constructively</li>
                <li>Respect when someone wants to end a conversation</li>
                <li>Keep personal contact information private</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-[#FDC62E] border-b border-gray-200 pb-2">
              6. Updates to Guidelines
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                These community guidelines may be updated periodically to reflect changes in our platform, 
                legal requirements, or community needs. Users will be notified of significant changes, and 
                continued use of GupShup constitutes acceptance of updated guidelines.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default CommunityGuidelinesPage