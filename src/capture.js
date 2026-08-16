export async function captureScreenshot(scene) {
  try {
    const canvas = scene.game.canvas;
    const dataURL = canvas.toDataURL('image/png');
    const base64Data = dataURL.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const response = await fetch('/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'image/png' },
      body: bytes.buffer
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`Screenshot saved: ${result.filename}`);
    } else {
      console.error('Screenshot failed:', await response.text());
    }
  } catch (err) {
    console.error('Screenshot error:', err);
  }
}
