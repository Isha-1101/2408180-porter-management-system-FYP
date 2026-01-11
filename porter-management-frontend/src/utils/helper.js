export const convertToBase64 = async (fileUrl) => {
  const fullUrl = `https://res.cloudinary.com/${
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  }/image${fileUrl}`;

  const response = await fetch(fullUrl);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const getCloudinaryUrl = (fileUrl) => {
  return `https://res.cloudinary.com/${
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  }/image${fileUrl}`;
};