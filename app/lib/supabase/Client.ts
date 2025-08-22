// // ImageInput (cliente)
// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// // async function uploadImage(file: File) {
// //   const ext = file.name.split(".").pop() ?? "png";
// //   const path = `products/${crypto.randomUUID()}.${ext}`;

// //   const { data, error } = await supabase.storage
// //     .from("product-images")
// //     .upload(path, file, { cacheControl: "3600", upsert: false });

// //   if (error) throw error;

// //   const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);

// //   // pub.publicUrl es la URL final; guárdala en tu POST /api/products
// //   return { path, url: pub.publicUrl };
// // }
