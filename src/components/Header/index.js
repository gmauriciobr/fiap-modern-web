import { useState } from "react";
import Modal from "react-modal";
import imgLogo from "../../assets/logo.png";
import imgProfile from "../../assets/profileStandard.png";
import { api } from "../../services/api";
import { getUser, setUser } from "../../services/security";
import { CropImage } from "../CropImage";
import { Container, IconSignOut } from "./styles";

function Header() {
  const user = getUser();
  const [imageProfile, setImageProfile] = useState(user?.image);
  const [showModal, setShowModal] = useState(false);

  const uploadImage = async (image) => {
    if ((image === undefined) | (image === null)) {
      alert("Favor anexar uma imagem");
    }
    try {
      const formData = new FormData();
      formData.append("image", new Blob([image], { type: "image/jpeg" }));
      const response = await api.post(`/students/${user.id}/images`, formData, {
        headers: {
          "content-type": "multipart/form-data",
        },
      });
      console.log(response.data);
      setImageProfile(response.data.image);
      setShowModal(false);
      setUser(response.data.image);
      alert("Atualizado com sucesso");
    } catch (error) {
      alert(error);
    }
  };

  const customStyles = {
    content: {
      background: "var(--bgPrimary)",
    },
  };

  return (
    <Container>
      <Modal isOpen={showModal} style={customStyles}>
        <div>
          <div style={{ textAlign: "right" }}>
            <button onClick={() => setShowModal(false)}>X</button>
          </div>
          <div className="flex">
            <CropImage uploadImage={uploadImage} />
          </div>
        </div>
      </Modal>
      <div>
        <img src={imgLogo} id="logo" />
        <img
          src={imageProfile || imgProfile}
          style={{ cursor: "pointer" }}
          onClick={() => setShowModal(true)}
        />
        <p>{user?.name}</p>
      </div>
      <IconSignOut />
    </Container>
  );
}

export default Header;
