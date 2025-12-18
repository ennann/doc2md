export const description = 'Verify that the privacy page is accessible and the sitemap is updated.';

export async function run() {
  return await Promise.all([
    fetch("http://localhost:3000/en/privacy").then((r) => r.status),
    fetch("http://localhost:3000/zh/privacy").then((r) => r.status),
    fetch("http://localhost:3000/sitemap.xml").then((r) => r.text())
  ]);
}
