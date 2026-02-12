import { useEffect } from "react";
import { useMap } from "react-leaflet";

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

export function Recenter({ pos }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.setView(pos, 14);
  }, [pos, map]);
  return null;
}

export const traverseInPorter = (porter) => {
  let data = {};
  porter.forEach((por) => {
    if (por.basicInfo) {
      data.porterName = por.basicInfo.fullName;
      data.address = por.basicInfo.address;
      data.photo = por.basicInfo.porterPhoto;
      data.phoneNumber = por.basicInfo.phone;
      data.experienceYears = por.basicInfo.experienceYears;
    }
    if (por.vehicle) {
      data.hasVehicle = por.vehicle.hasVehicle;
      data.vehicle = por.vehicleCategory;
    }
    data.porterType = por.porterType;
    data.distanceMeters = por.distanceMeters;
    data.id = por._id;
  });

  return data;
};
