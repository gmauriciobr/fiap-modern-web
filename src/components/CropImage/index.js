import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";

export const CropImage = ({ uploadImage }) => {
  const [viewImage, setViewImage] = useState();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState();
  const [zoom, setZoom] = useState(1);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    // console.log(croppedArea, croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
      image.src = url;
    });

  function getRadianAngle(degreeValue) {
    return (degreeValue * Math.PI) / 180;
  }

  const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    // set each dimensions to double largest dimension to allow for a safe area for the
    // image to rotate in without being clipped by canvas context
    canvas.width = safeArea;
    canvas.height = safeArea;

    // translate canvas context to a central location on image to allow rotating around the center.
    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate(getRadianAngle(rotation));
    ctx.translate(-safeArea / 2, -safeArea / 2);

    // draw rotated image and store data.
    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );
    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    // set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // paste generated rotate image with correct offsets for x,y crop values.
    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    // As Base64 string
    return canvas.toDataURL("image/jpeg");

    // As a blob
    // return new Promise((resolve) => {
    //   canvas.toBlob((file) => {
    //     resolve(URL.createObjectURL(file));
    //   }, "image/jpeg");
    // });
  };

  const handleChangeFile = (event) => {
    setViewImage(URL.createObjectURL(event.target.files[0]));
  };

  const handleSave = async () => {
    const f = await getCroppedImg(viewImage, croppedAreaPixels, 0);
    const file = await (await fetch(f)).blob();
    uploadImage(file);
  };

  return (
    <>
      <div className="flex">
        <label>
          <input
            type="file"
            accept="image/*"
            // value="Selecione uma image para o seu perfil:"
            onChange={handleChangeFile}
          />
        </label>
      </div>
      {viewImage ? (
        <>
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "150px",
              left: 0,
              right: 0,
              bottom: "80px",
            }}
          >
            <Cropper
              image={viewImage}
              crop={crop}
              zoom={zoom}
              aspect={4 / 4}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="flex">
            <button onClick={handleSave}>Salvar</button>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};
