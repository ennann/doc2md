export const description = 'Verify that the support page is accessible and the sitemap is updated.';

export async function run() {
  return await Promise.all([
    fetch("http://localhost:3000/en/support").then((r) => r.status),
    fetch("http://localhost:3000/zh/support").then((r) => r.status),
    fetch("http://localhost:3000/sitemap.xml").then((r) => r.text())
  ]);
}
