import { type CustomerCredit } from "@/src/types/credit";
import { PaymentType, type BasketItem } from "@/src/types/sale";
import React, { useState } from "react";
import { Modal, StyleSheet, useWindowDimensions, View } from "react-native";
import { TransactionContent } from "./TransactionContent";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  basket: BasketItem[];
  activePayment: PaymentType;
  setActivePayment: (p: PaymentType) => void;
  cashReceived: number;
  setCashReceived: React.Dispatch<React.SetStateAction<number>>;
  isSubmitting: boolean;
  handleCheckout: () => void;
  updateQuantity: (id: string, q: number) => void;
  removeItem: (id: string) => void; // Changed from removeFromBasket to removeItem
  clearBasket: () => void;
  credits: CustomerCredit[];
  selectedCreditId: string;
  setSelectedCreditId: (s: string) => void;
  isNewCustomer: boolean;
  setIsNewCustomer: (b: boolean) => void;
  newCustomerName: string;
  setNewCustomerName: (s: string) => void;
  newCustomerContact: string;
  setNewCustomerContact: (s: string) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = (props) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [showVoidConfirm, setShowVoidConfirm] = useState<boolean>(false);

  if (isTablet) return null;

  return (
    <Modal
      visible={props.isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={props.onClose}
    >
      <View style={styles.container}>
        <TransactionContent
          {...props}
          isTablet={false}
          showVoidConfirm={showVoidConfirm}
          setShowVoidConfirm={setShowVoidConfirm}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
