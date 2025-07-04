export async function checkOrderContent(order, items) {
    // TODO: Implement a more robust check not depending on client data
    return order.totalPrice == items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}