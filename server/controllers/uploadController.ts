import { Request, Response } from 'express';
import multer from 'multer';

// In-memory buffer storage to directly stream image to imgBB
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WebP, GIF) are allowed.'));
    }
  },
});

export async function uploadImage(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'IMGBB_API_KEY is not configured on the server. Please set it in your environment variables.',
      });
    }

    // Convert file buffer to base64 for imgBB upload API
    const base64Data = req.file.buffer.toString('base64');
    const params = new URLSearchParams();
    params.append('image', base64Data);
    if (req.file.originalname) {
      params.append('name', req.file.originalname.replace(/\.[^/.]+$/, ''));
    }

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: params,
    });

    const data: any = await response.json();

    if (!data.success) {
      return res.status(400).json({
        success: false,
        message: data.error?.message || 'imgBB image upload failed.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Image successfully uploaded to imgBB.',
      url: data.data.url,
      display_url: data.data.display_url,
      thumb_url: data.data.thumb?.url,
      delete_url: data.data.delete_url,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Image upload error.',
    });
  }
}
