const fs = require('fs');
const path = require('path');

// 创建一个 256x256 ICO 文件
function createSimpleIco() {
  const size = 256;
  const pixelCount = size * size;

  // ICO 文件头 (6 bytes)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);      // Reserved (must be 0)
  header.writeUInt16LE(1, 2);      // Image type (1 = ICO)
  header.writeUInt16LE(1, 4);      // Number of images

  // 计算图像大小
  const imageSize = 40 + (pixelCount * 4) + (pixelCount / 8); // BMP header + pixel data + AND mask

  // 图像目录条目 (16 bytes)
  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(0, 0);       // Width (0 = 256 pixels)
  dirEntry.writeUInt8(0, 1);       // Height (0 = 256 pixels)
  dirEntry.writeUInt8(0, 2);       // Color count (0 = no palette)
  dirEntry.writeUInt8(0, 3);       // Reserved
  dirEntry.writeUInt16LE(1, 4);    // Color planes
  dirEntry.writeUInt16LE(32, 6);   // Bits per pixel
  dirEntry.writeUInt32LE(imageSize, 8); // Image size in bytes
  dirEntry.writeUInt32LE(22, 12);  // Offset to image data

  // BMP 头 (40 bytes)
  const bmpHeader = Buffer.alloc(40);
  bmpHeader.writeUInt32LE(40, 0);      // Header size
  bmpHeader.writeInt32LE(size, 4);     // Width
  bmpHeader.writeInt32LE(size * 2, 8); // Height (double for AND mask)
  bmpHeader.writeUInt16LE(1, 12);      // Planes
  bmpHeader.writeUInt16LE(32, 14);     // Bits per pixel
  bmpHeader.writeUInt32LE(0, 16);      // Compression
  bmpHeader.writeUInt32LE(pixelCount * 4, 20); // Image size
  bmpHeader.writeUInt32LE(0, 24);      // X pixels per meter
  bmpHeader.writeUInt32LE(0, 28);      // Y pixels per meter
  bmpHeader.writeUInt32LE(0, 32);      // Colors used
  bmpHeader.writeUInt32LE(0, 36);      // Important colors

  // 创建像素数据 (256x256 BGRA) - 创建一个简单的图标
  const pixelData = Buffer.alloc(pixelCount * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = (y * size + x) * 4;
      const centerX = size / 2;
      const centerY = size / 2;
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

      if (distance < size / 2 - 10) {
        // 内部圆形 - 蓝色背景
        pixelData[index] = 0xE5;     // Blue
        pixelData[index + 1] = 0x46; // Green
        pixelData[index + 2] = 0x4F; // Red
        pixelData[index + 3] = 0xFF; // Alpha

        // 添加一些简单的图案
        if ((x > centerX - 60 && x < centerX - 20 && y > centerY - 30 && y < centerY + 30) ||
            (x > centerX + 20 && x < centerX + 60 && y > centerY - 30 && y < centerY + 30)) {
          // 白色矩形 (代表服务器)
          pixelData[index] = 0xFF;     // Blue
          pixelData[index + 1] = 0xFF; // Green
          pixelData[index + 2] = 0xFF; // Red
          pixelData[index + 3] = 0xFF; // Alpha
        }

        if (x > centerX - 20 && x < centerX + 20 && Math.abs(y - centerY) < 3) {
          // 连接线
          pixelData[index] = 0xFF;     // Blue
          pixelData[index + 1] = 0xFF; // Green
          pixelData[index + 2] = 0xFF; // Red
          pixelData[index + 3] = 0xFF; // Alpha
        }
      } else {
        // 透明背景
        pixelData[index] = 0x00;     // Blue
        pixelData[index + 1] = 0x00; // Green
        pixelData[index + 2] = 0x00; // Red
        pixelData[index + 3] = 0x00; // Alpha
      }
    }
  }

  // AND 掩码 (256x256 bits)
  const andMaskSize = (size * size) / 8;
  const andMask = Buffer.alloc(andMaskSize, 0);

  // 组合所有部分
  const icoFile = Buffer.concat([header, dirEntry, bmpHeader, pixelData, andMask]);

  return icoFile;
}

// 生成 ICO 文件
const icoData = createSimpleIco();
fs.writeFileSync(path.join(__dirname, 'assets', 'icon.ico'), icoData);

console.log('图标文件已创建: assets/icon.ico');