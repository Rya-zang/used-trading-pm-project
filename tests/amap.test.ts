import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fakeListings } from "../src/domain/places.ts";
import { buildCommuteReport, parseCommuteInput } from "../src/server/amap.ts";

const input = { workplaceId: "jiaotong", wishes: ["metro", "snacks"], custom: "" };

describe("高德通勤", () => {
  it("没有钥匙时不请求高德，仍用示例距离和周边标签", async () => {
    let called = 0;
    const fetchImpl: typeof fetch = async () => {
      called += 1;
      return Response.json({});
    };
    const report = await buildCommuteReport(input, { key: "", fetchImpl });
    assert.equal(called, 0);
    assert.equal(report.keySet, false);
    assert.equal(report.note, "missing-key");
    assert.equal(report.source, "sample");
    const xujiahui = report.items.find((item) => item.id === "listing-09");
    assert.ok(xujiahui);
    assert.ok((xujiahui.km ?? 99) < 3);
    assert.ok(xujiahui.met.includes("metro"));
    assert.ok(xujiahui.met.includes("snacks"));
  });

  it("有钥匙时只问高德的距离和周边，并写清对上了哪几条", async () => {
    const paths: string[] = [];
    const fetchImpl: typeof fetch = async (resource) => {
      const url = new URL(String(resource));
      assert.equal(url.origin, "https://restapi.amap.com");
      assert.equal(url.searchParams.has("key"), true);
      paths.push(url.pathname);
      if (url.pathname === "/v3/distance") {
        const origins = url.searchParams.get("origins")?.split("|") ?? [];
        assert.equal(origins.length, fakeListings.length);
        return Response.json({
          status: "1",
          results: origins.map(() => ({ distance: "1200" })),
        });
      }
      assert.equal(url.pathname, "/v3/place/around");
      const near = url.searchParams.get("keywords") === "地铁站";
      return Response.json({ status: "1", count: near ? "1" : "0", pois: near ? [{ name: "地铁" }] : [] });
    };
    const report = await buildCommuteReport(input, { key: "x", fetchImpl });
    assert.equal(report.keySet, true);
    assert.equal(report.source, "amap");
    assert.equal(report.note, "amap");
    assert.ok(paths.includes("/v3/distance"));
    assert.ok(paths.includes("/v3/place/around"));
    assert.ok(paths.every((path) => path === "/v3/distance" || path === "/v3/place/around"));
    const first = report.items[0];
    assert.equal(first?.km, 1.2);
    assert.deepEqual(first?.met, ["metro"]);
  });

  it("高德拒绝时退回示例，不把钥匙带回页面", async () => {
    const fetchImpl: typeof fetch = async () => Response.json({ status: "0", info: "INVALID_USER_KEY" });
    const report = await buildCommuteReport(input, { key: "x", fetchImpl });
    assert.equal(report.keySet, true);
    assert.equal(report.source, "sample");
    assert.equal(report.note, "amap-unavailable");
    assert.equal(JSON.stringify(report).includes("INVALID_USER_KEY"), false);
  });

  it("不接受随便写的地点", () => {
    assert.equal(parseCommuteInput({ workplaceId: "https://example.test", wishes: [], custom: "" }), null);
    assert.deepEqual(parseCommuteInput({ workplaceId: "jiaotong", wishes: ["metro"], custom: "夜市" }), {
      workplaceId: "jiaotong",
      wishes: ["metro"],
      custom: "夜市",
    });
  });
});
