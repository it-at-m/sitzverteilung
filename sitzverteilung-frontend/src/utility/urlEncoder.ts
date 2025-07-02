export async function writeToUrlParam<T>(
  object: T,
  url: string
): Promise<string> {
  if (typeof CompressionStream === "undefined") {
    throw new Error("CompressionStream is not supported in this browser");
  }
  const json = JSON.stringify(object);
  const bytes = new TextEncoder().encode(json);
  const compressionStream = new CompressionStream("gzip");
  const compressedStream = new Blob([bytes])
    .stream()
    .pipeThrough(compressionStream);
  const compressedArrayBuffer = await new Response(
    compressedStream
  ).arrayBuffer();
  const uint8Array = new Uint8Array(compressedArrayBuffer);
  const base = btoa(
    Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join("")
  );
  const result = base
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  if (result.length > 2048 - url.length) {
    throw new Error("The amount of data to be url encoded is too high");
  }
  return result;
}

export async function writeUrlParamToObject<T>(urlParam: string): Promise<T> {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("DecompressionStream is not supported in this browser");
  }
  const base64 = urlParam.replace(/-/g, "+").replace(/_/g, "/");
  const binaryString = atob(base64);
  const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
  const blob = new Blob([bytes]);
  const decompressionStream = new DecompressionStream("gzip");
  const decompressedStream = blob.stream().pipeThrough(decompressionStream);
  const decompressedArrayBuffer = await new Response(
    decompressedStream
  ).arrayBuffer();
  const json = new TextDecoder().decode(decompressedArrayBuffer);
  return JSON.parse(json) as T;
}
