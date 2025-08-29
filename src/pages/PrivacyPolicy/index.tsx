import React, { useEffect } from "react";

const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section id={id} style={{ margin: "24px 0" }}>
    <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>{title}</h2>
    <div>{children}</div>
  </section>
);

const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    document.title = "Privacy Policy – All One Ads";
  }, []);

  const container: React.CSSProperties = {
    maxWidth: 900,
    margin: "0 auto",
    padding: "24px 16px 56px",
  };

  const card: React.CSSProperties = {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 24,
    background: "#fff",
  };

  const meta: React.CSSProperties = {
    display: "inline-block",
    fontSize: 12,
    color: "#6b7280",
    background: "#f3f4f6",
    padding: "4px 10px",
    borderRadius: 999,
    marginTop: 6,
  };

  const toc: React.CSSProperties = {
    background: "#f9fafb",
    border: "1px dashed #e5e7eb",
    borderRadius: 10,
    padding: "12px 14px",
    margin: "8px 0 18px",
    fontSize: 14,
  };

  return (
    <main style={container}>
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Privacy Policy</h1>
        <div style={meta}>Last Updated: August 28, 2025</div>
        <p style={{ margin: "8px 0 0", color: "#6b7280" }}>
          For the All One Ads Chrome extension (“Tool”)
        </p>
      </div>

      <div style={card}>
        <nav style={toc} aria-label="Table of contents">
          <strong>On this page: </strong>
          <a href="#introduction">Introduction</a>{" · "}
          <a href="#information-we-collect">Information We Collect</a>{" · "}
          <a href="#how-we-use">How We Use Your Information</a>{" · "}
          <a href="#security">Data Security</a>{" · "}
          <a href="#your-choices">Your Choices</a>{" · "}
          <a href="#changes">Changes to This Policy</a>{" · "}
          <a href="#contact">Contact Us</a>
        </nav>

        <Section id="introduction" title="Introduction">
          <p>
            Welcome to the Privacy Policy for our Chrome extension (“Tool”). We are committed to
            protecting your privacy. This policy explains how we handle your information, including
            cookies and access tokens, when you use our Tool.
          </p>
        </Section>

        <Section id="information-we-collect" title="Information We Collect">
          <p>Our Tool collects the following information to help you manage your data:</p>
          <ul>
            <li>
              <strong>Cookies:</strong> We retrieve cookies from your browser to provide them back
              to you, making it easier to access your saved preferences or data.
            </li>
            <li>
              <strong>Access Tokens:</strong> We may collect access tokens from Facebook Ads pages
              and pages you own, but only to display them to you for your own use.
            </li>
          </ul>
          <p><em>We do not sell or share this information with third parties.</em></p>
        </Section>

        <Section id="how-we-use" title="How We Use Your Information">
          <p>We use the collected information solely to:</p>
          <ul>
            <li>
              Provide the Tool’s core functionality, such as retrieving and displaying your cookies
              and access tokens.
            </li>
            <li>Help low-tech users quickly access their data with a simple interface.</li>
          </ul>
        </Section>

        <Section id="security" title="Data Security">
          <p>
            We take reasonable steps to protect your information. However, no online transmission is
            completely secure. Your data is processed locally in your browser and not stored on our
            servers.
          </p>
        </Section>

        <Section id="your-choices" title="Your Choices">
          <p>
            You can stop the Tool from collecting data by disabling it in your Chrome extensions
            settings. You can also clear cookies and tokens manually through your browser settings.
          </p>
        </Section>

        <Section id="changes" title="Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant
            changes by posting the new policy here with an updated date.
          </p>
        </Section>

        <Section id="contact" title="Contact Us">
          <p>
            If you have questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:nextadsai@gmail.com">nextadsai@gmail.com</a>.
          </p>
        </Section>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
