export async function writeToUrlParam<T>(object: T): Promise<string> {
  const json = JSON.stringify(object);
  const bytes = new TextEncoder().encode(json);
  const compressionStream = new CompressionStream("gzip");
  const compressedStream = new Blob([bytes])
    .stream()
    .pipeThrough(compressionStream);
  const compressedArrayBuffer = await new Response(
    compressedStream
  ).arrayBuffer();
  const base = btoa(
    String.fromCharCode(...new Uint8Array(compressedArrayBuffer))
  );
  return base.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function writeUrlParamToObject<T>(urlParam: string): Promise<T> {
  const base64 = urlParam.replace(/-/g, "+").replace(/_/g, "/");
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes]);
  const decompressionStream = new DecompressionStream("gzip");
  const decompressedStream = blob.stream().pipeThrough(decompressionStream);
  const decompressedArrayBuffer = await new Response(
    decompressedStream
  ).arrayBuffer();
  const json = new TextDecoder().decode(decompressedArrayBuffer);
  return JSON.parse(json) as T;
}
