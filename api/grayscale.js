const fetch = require('node-fetch');
const { createCanvas, loadImage } = require('canvas');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, width } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  try {
    const response = await fetch(url);
    const buffer = await response.buffer();
    const img = await loadImage(buffer);

    const height = img.height * (width / img.width);

    const canvas = createCanvas(parseInt(width), height);
    const context = canvas.getContext('2d');
    context.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const grayscaleArray = new Array(canvas.height);
    for (let y = 0; y < canvas.height; y++) {
      grayscaleArray[y] = new Array(canvas.width);
    }
  
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        const red = data[index];
        const green = data[index + 1];
        const blue = data[index + 2];
    
        const grayscale = Math.round((red + green + blue) / 3)
        grayscaleArray[y][x] = grayscale;
      }
    }

    return res.status(200).json({ grayscaleArray });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
