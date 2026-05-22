const fs = require('fs');

async function testUpload() {
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const dummyContent = 'This is a test resume.';
  
  let body = '';
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="jobDescription"\r\n\r\n`;
  body += `Software Engineer\r\n`;
  
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="resume"; filename="dummy.txt"\r\n`;
  body += `Content-Type: text/plain\r\n\r\n`;
  body += `${dummyContent}\r\n`;
  
  body += `--${boundary}--\r\n`;

  try {
    const res = await fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: body
    });
    
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

testUpload();
