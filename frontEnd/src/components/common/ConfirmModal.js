import React from 'react';
import styled from 'styled-components';
import { AlertTriangle, X, Check } from 'lucide-react';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.2s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const IconWrapper = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: #fef3c7;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b;
`;

const Title = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const Message = styled.p`
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;

  ${({ variant }) => {
    switch (variant) {
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          &:hover {
            background: #dc2626;
            transform: translateY(-1px);
          }
        `;
      case 'secondary':
        return `
          background: #f3f4f6;
          color: #374151;
          &:hover {
            background: #e5e7eb;
          }
        `;
      default:
        return `
          background: #6366f1;
          color: white;
          &:hover {
            background: #5b21b6;
            transform: translateY(-1px);
          }
        `;
    }
  }}
`;

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "확인", 
  message = "이 작업을 계속하시겠습니까?",
  confirmText = "확인",
  cancelText = "취소",
  variant = "danger" // danger, primary, secondary
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <Header>
          <IconWrapper>
            <AlertTriangle size={20} />
          </IconWrapper>
          <Title>{title}</Title>
        </Header>
        
        <Message>{message}</Message>
        
        <ButtonGroup>
          <Button variant="secondary" onClick={onClose}>
            <X size={16} />
            {cancelText}
          </Button>
          <Button variant={variant} onClick={handleConfirm}>
            <Check size={16} />
            {confirmText}
          </Button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
};

export default ConfirmModal;