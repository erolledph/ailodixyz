import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Important disclaimers and limitations regarding AI Lodi content and services.',
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-background">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-foreground mb-8">Disclaimer</h1>
        
        <p className="text-muted-foreground mb-6">
          <strong>Last updated:</strong> {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">General Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              The information on AI Lodi is provided on an "as is" basis. To the fullest 
              extent permitted by law, AI Lodi excludes all representations, warranties, 
              obligations, and liabilities arising out of or in connection with the information 
              provided on this website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Educational Purpose</h2>
            <p className="text-muted-foreground leading-relaxed">
              The content on AI Lodi is for educational and informational purposes only. 
              It should not be considered as professional advice for your specific situation. 
              Always consult with qualified professionals before making decisions based on the 
              information provided here.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">No Professional Advice</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The content on AI Lodi does not constitute professional advice in any field, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Technical consulting or implementation guidance</li>
              <li>Investment or financial advice</li>
              <li>Legal advice or regulatory compliance</li>
              <li>Medical or health-related advice</li>
              <li>Business strategy or operational decisions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Technology Information Accuracy</h2>
            <p className="text-muted-foreground leading-relaxed">
              While we strive to provide accurate and up-to-date information about AI, technology trends, 
              and programming concepts, we make no representations or warranties of any kind, express or 
              implied, about the completeness, accuracy, reliability, suitability, or availability of the 
              information, products, services, or related graphics contained on the website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">External Links and References</h2>
            <p className="text-muted-foreground leading-relaxed">
              AI Lodi may contain links to external websites, research papers, tools, and services 
              that are not provided or maintained by us. We do not guarantee the accuracy, relevance, 
              timeliness, or completeness of any information on these external resources. The inclusion 
              of any links does not necessarily imply a recommendation or endorse the views expressed within them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Code Examples and Technical Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              Any code examples, technical tutorials, or implementation guides provided on AI Lodi 
              are for educational purposes only. We are not responsible for any issues, damages, 
              or losses that may arise from implementing or using such information. Always test 
              thoroughly in a safe environment before implementing in production systems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">AI and Technology Predictions</h2>
            <p className="text-muted-foreground leading-relaxed">
              Content discussing future technology trends, AI developments, or industry predictions 
              represents analysis and opinion based on current information. These should not be 
              considered as guarantees of future outcomes or investment advice. Technology landscapes 
              evolve rapidly, and actual developments may differ significantly from predictions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              In no event will AI Lodi be liable for any loss or damage including, 
              without limitation, indirect or consequential loss or damage, or any loss or 
              damage whatsoever arising from loss of data or profits arising out of, or in 
              connection with, the use of this website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Software and Tools</h2>
            <p className="text-muted-foreground leading-relaxed">
              Any software, code, tools, or downloadable materials referenced or provided through 
              AI Lodi are used at your own risk. We do not warrant that such materials will be 
              error-free or that defects will be corrected. Always review and test any code or 
              tools before using them in production environments.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Content and Opinions</h2>
            <p className="text-muted-foreground leading-relaxed">
              Some content on AI Lodi may include guest contributions, interviews, or references 
              to third-party research and opinions. We do not endorse, guarantee, or assume 
              responsibility for any third-party content. The views and opinions expressed in 
              such content are those of the authors and do not necessarily reflect our official 
              policy or position.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Rapidly Evolving Technology</h2>
            <p className="text-muted-foreground leading-relaxed">
              The fields of AI, machine learning, and technology evolve extremely rapidly. 
              Information that is accurate at the time of publication may become outdated 
              quickly. We reserve the right to modify, update, or remove any content without 
              prior notice and are not obligated to update information or correct inaccuracies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">User Responsibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              Users are responsible for evaluating the accuracy, completeness, and usefulness 
              of any information provided. Any reliance you place on such information is 
              strictly at your own risk. We recommend that you conduct your own research, 
              consult with relevant experts, and seek professional advice where appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this disclaimer, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">
                Email: <a href="mailto:info@ailodi.tech" className="text-primary hover:text-primary/80">info@ailodi.tech</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}