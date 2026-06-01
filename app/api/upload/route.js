import { put } from '@vercel/blob';

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return Response.json({ error: 'No file provided.' }, { status: 400 });
  }

  // Only allow PDF, DOC, DOCX
  const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowed.includes(file.type)) {
    return Response.json({ error: 'Only PDF, DOC, and DOCX files are allowed.' }, { status: 400 });
  }

  // 5 MB limit
  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: 'File must be under 5 MB.' }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const pathname = `resumes/${Date.now()}_${safeName}`;

  const blob = await put(pathname, file, { access: 'public' });
  return Response.json({ url: blob.url });
}
