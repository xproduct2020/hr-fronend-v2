import { put } from '@vercel/blob';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return Response.json({ error: 'No file provided.' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ error: 'Only PNG, JPG, WEBP, GIF, and SVG images are allowed.' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return Response.json({ error: 'Logo must be under 2 MB.' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const safeBase = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60) || 'logo';
  const pathname = `company-logo/${Date.now()}_${safeBase}.${ext}`;

  try {
    const blob = await put(pathname, file, { access: 'public' });
    return Response.json({ url: blob.url, pathname: blob.pathname });
  } catch (err) {
    return Response.json(
      { error: err.message || 'Failed to upload logo to storage.' },
      { status: 500 }
    );
  }
}
