import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the complete DeliveryDesk client portal", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>DeliveryDesk/);
  assert.match(html, /Northstar Commerce Redesign/);
  assert.match(html, /Project delivery, without the status chase/);
  assert.match(html, /Approval queue/);
  assert.match(html, /Accessibility review/);
  assert.match(html, /Add task/);
});

test("removes starter assets and documents the local-first demo boundary", async () => {
  const [page, layout, workspace, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/delivery-workspace.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(page + layout, /codex-preview|SkeletonPreview|Your site is taking shape/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(workspace, /localStorage/);
  assert.match(workspace, /No sign-in, API key, or client data required/);
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});

test("ships social preview metadata", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  await access(new URL("../public/og.png", import.meta.url));
  assert.match(layout, /summary_large_image/);
  assert.match(layout, /\/og\.png/);
});

