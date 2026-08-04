import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: string, folder?: string) {
  return cloudinary.uploader.upload(file, {
    folder: folder || "maison",
    resource_type: "image",
  });
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export type CloudinaryAsset = {
  publicId: string;
  url: string;
  format: string;
  bytes: number;
  width: number | null;
  height: number | null;
  createdAt: string;
  folder: string;
};

export async function listImages(options: {
  folder?: string;
  cursor?: string;
  max?: number;
} = {}): Promise<{ assets: CloudinaryAsset[]; nextCursor: string | null }> {
  const { folder, cursor, max = 60 } = options;

  const result = (await cloudinary.api.resources({
    type: "upload",
    resource_type: "image",
    prefix: folder || undefined,
    next_cursor: cursor || undefined,
    max_results: max,
  })) as {
    resources?: Array<{
      public_id: string;
      secure_url?: string;
      url?: string;
      format?: string;
      bytes?: number;
      width?: number;
      height?: number;
      created_at?: string;
    }>;
    next_cursor?: string;
  };

  const assets: CloudinaryAsset[] = (result.resources || []).map((r) => {
    const slash = r.public_id.lastIndexOf("/");
    return {
      publicId: r.public_id,
      url: r.secure_url || r.url || "",
      format: r.format || "",
      bytes: r.bytes ?? 0,
      width: r.width ?? null,
      height: r.height ?? null,
      createdAt: r.created_at || "",
      folder: slash >= 0 ? r.public_id.slice(0, slash) : "",
    };
  });

  return { assets, nextCursor: result.next_cursor || null };
}

export async function listFolders(): Promise<string[]> {
  const roots = await cloudinary.api.root_folders();
  const folders: string[] = [];

  for (const root of roots.folders || []) {
    folders.push(root.name);
    try {
      const subs = await cloudinary.api.sub_folders(root.name);
      for (const sub of subs.folders || []) {
        folders.push(`${root.name}/${sub.name}`);
      }
    } catch {
      // ignore folders we can't enumerate
    }
  }

  return folders.sort();
}

export { cloudinary };
