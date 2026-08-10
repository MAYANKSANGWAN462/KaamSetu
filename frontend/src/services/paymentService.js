import api from './api';

class PaymentService {
  async logPayment(applicationId, amount, note = '') {
    const response = await api.post('/payments', { applicationId, amount, note });
    return response.data;
  }

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
