/**
 * Optimizes image URLs by adding compression parameters
 * For Cloudinary images: adds quality=50% transformation
 * For other images: returns as-is
 */

export const optimizeImageUrl = (imageUrl, quality = 50) => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return imageUrl;
  }

  // Check if it's a Cloudinary URL
  if (imageUrl.includes('res.cloudinary.com') && imageUrl.includes('/upload/')) {
    // Check if quality parameter already exists
    if (imageUrl.includes('q_')) {
      // Replace existing quality parameter
      return imageUrl.replace(/q_\d+/g, `q_${quality}`);
    }
    
    // Insert quality parameter after /upload/
    const uploadIndex = imageUrl.indexOf('/upload/');
    if (uploadIndex !== -1) {
      const beforeUpload = imageUrl.substring(0, uploadIndex + 8); // Include '/upload/'
      const afterUpload = imageUrl.substring(uploadIndex + 8);
      
      // Insert q_50/ before the rest of the path
      return `${beforeUpload}q_${quality}/${afterUpload}`;
    }
  }

  // For non-Cloudinary images, return as-is
  return imageUrl;
};

/*
 * Optimizes multiple image URLs
 */
export const optimizeImageUrls = (imageUrls, quality = 50) => {
  if (Array.isArray(imageUrls)) {
    return imageUrls.map(url => optimizeImageUrl(url, quality));
  }
  return optimizeImageUrl(imageUrls, quality);
};
