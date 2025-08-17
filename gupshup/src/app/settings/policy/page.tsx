function PrivacyPolicyPage() {
  return (
    <div className="flex justify-center p-8 min-h-full">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-center">Privacy Policy</h1>
          <p className="text-gray-600 text-center">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[#FDC62E] border-b border-gray-200 pb-2">
              1. Information We Collect
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                At GupShup, we collect minimal information necessary to provide our anonymous video chat service:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> When you create an account, we collect your username, email address, and encrypted password.</li>
                <li><strong>Profile Information:</strong> Optional profile pictures and any information you choose to share.</li>
                <li><strong>Usage Data:</strong> Basic analytics about app usage, session duration, and feature usage to improve our service.</li>
                <li><strong>Technical Information:</strong> Device information, IP address, and browser type for security and functionality purposes.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-[#FDC62E] border-b border-gray-200 pb-2">
              2. How We Use Your Information
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>Your information is used exclusively for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Providing and maintaining our services</li>
                <li>User authentication and account management</li>
                <li>Improving user experience and app functionality</li>
                <li>Preventing abuse and maintaining community safety</li>
                <li>Sending important service-related notifications</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-[#FDC62E] border-b border-gray-200 pb-2">
              3. Data Sharing and Disclosure
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                <strong>We do not sell, trade, or share your personal information with third parties</strong> except in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>When required by law or legal process</li>
                <li>To protect the rights, property, or safety of GupShup, our users, or the public</li>
                <li>With your explicit consent</li>
                <li>In the event of a merger, acquisition, or sale of assets (users will be notified)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-[#FDC62E] border-b border-gray-200 pb-2">
              4. Data Security
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>End-to-end encryption for video calls</li>
                <li>Secure password hashing and storage</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-[#FDC62E] border-b border-gray-200 pb-2">
              5. Your Rights
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access, update, or delete your personal information</li>
                <li>Opt-out of non-essential communications</li>
                <li>Request information about how your data is processed</li>
                <li>File a complaint with relevant data protection authorities</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-[#FDC62E] border-b border-gray-200 pb-2">
              6. Data Retention
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                We retain your data only as long as necessary to provide our services or as required by law. 
                When you delete your account, we permanently remove your personal information within 30 days.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage