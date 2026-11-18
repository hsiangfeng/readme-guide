// 購物車金額只在這裡計算，畫面只負責顯示
export const total = (items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0);
