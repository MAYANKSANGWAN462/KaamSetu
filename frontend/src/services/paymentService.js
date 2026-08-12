import api from './api';

class PaymentService {
  // Cash: hirer logs payment
  async logPayment(applicationId, amount, note = '') {
    const response = await api.post('/payments', { applicationId, amount, note });
    return response.data;
  }

  // Online: create Razorpay order
  async createOrder(applicationId, amount, note = '') {
    const response = await api.post('/payments/create-order', { applicationId, amount, note });
    return response.data;
  }

  // Online: verify payment after Razorpay checkout
  async verifyPayment(payload) {
    // payload: { razorpay_order_id, razorpay_payment_id, razorpay_signature, applicationId }
    const response = await api.post('/payments/verify', payload);
    return response.data;
  }

  // Cash: worker confirms receipt
  async confirmPayment(paymentId) {
    const response = await api.put(`/payments/${paymentId}/confirm`);
    return response.data;
  }

  async getMyPayments() {
    const response = await api.get('/payments/mine');
    return response.data;
  }

  async getJobPayments(jobId) {
    const response = await api.get(`/payments/job/${jobId}`);
    return response.data;
  }

  async getApplicationPayment(applicationId) {
    const response = await api.get(`/payments/application/${applicationId}`);
    return response.data;
  }
}

export default new PaymentService();
