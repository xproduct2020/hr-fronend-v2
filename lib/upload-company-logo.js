export async function uploadCompanyLogo(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload/company-logo', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Logo upload failed.');
  }

  return data.url;
}
