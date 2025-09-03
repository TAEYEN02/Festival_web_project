import React from "react";
import { resetAndImportFestivals, importFestivals, deleteFestivals } from "../../api/festival";
import "./AdminButtons.css";

const AdminButtons = ({ token }) => {

  const handleResetAndImport = async () => {
    if (!window.confirm("정말 DB를 초기화하고 최신 데이터를 가져오시겠습니까?")) return;
    try {
      const msg = await resetAndImportFestivals(token);
      alert(msg);
    } catch (error) {
      console.error(error);
      alert("DB 초기화 + 데이터 가져오기 실패");
    }
  };

  const handleImport = async () => {
    try {
      const msg = await importFestivals(token);
      alert(msg);
    } catch (error) {
      console.error(error);
      alert("데이터 가져오기 실패");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      const msg = await deleteFestivals(token);
      alert(msg);
    } catch (error) {
      console.error(error);
      alert("삭제 실패");
    }
  };

  return (
    <div className="admin-buttons-container">
      <button className="admin-buttons" onClick={handleImport}>축제 데이터 가져오기</button>
      <button className="admin-buttons" onClick={handleDelete}>모든 데이터 삭제</button>
      <button className="admin-buttons" onClick={handleResetAndImport}>초기화 + 가져오기</button>
    </div>
  );
}

export default AdminButtons;
