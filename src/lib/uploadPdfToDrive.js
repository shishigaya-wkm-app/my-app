'use client';

export async function uploadPdfToDrive(blob, fileName) {
  const base64 = await blobToBase64(blob);

  const res = await fetch('https://script.google.com/macros/s/AKfycbzH0amQxluSgDd_GjAaRAgBjDFVF3lkyNjvU88iyUOBR3on1VmmEatFzH9jnU7gAVhDuA/exec', {
    method: 'POST',
    body: JSON.stringify({
      fileName,
      base64,
    }),
  });

  const json = await res.json();

  if (!json.ok) {
    throw new Error(json.error || 'Drive保存失敗');
  }

  return json;
}

function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
}