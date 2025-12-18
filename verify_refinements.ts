export const description = 'Verify refinements for Privacy, Support, and Footer.';

export async function run() {
  const [privacy, support, home] = await Promise.all([
    fetch("http://localhost:3001/en/privacy").then(r => r.text()),
    fetch("http://localhost:3001/en/support").then(r => r.text()),
    fetch("http://localhost:3001/en").then(r => r.text())
  ]);

  const checks = {
    privacyContent: privacy.includes("Information We Collect") && privacy.includes("Last updated"),
    supportAccordion: support.includes("summary") && support.includes("details"),
    footerLinks: home.includes('href="/privacy"') && home.includes('href="/support"')
  };

  console.log(JSON.stringify(checks, null, 2));
}
