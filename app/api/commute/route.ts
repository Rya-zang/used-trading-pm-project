import { commuteFromRequest } from "../../../src/server/amap.ts";

export async function POST(request: Request): Promise<Response> {
  return commuteFromRequest(request);
}
