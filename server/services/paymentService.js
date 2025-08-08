const axios = require('axios');

// Airtel Money API integration
class AirtelMoneyService {
  constructor() {
    this.apiKey = process.env.AIRTEL_MONEY_API_KEY;
    this.apiUrl = process.env.AIRTEL_MONEY_API_URL;
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async initiatePayment(phoneNumber, amount, reference, description) {
    try {
      const payload = {
        reference: reference,
        subscriber: {
          country: 'UG',
          currency: 'UGX',
          msisdn: phoneNumber
        },
        transaction: {
          amount: amount,
          country: 'UG',
          currency: 'UGX',
          id: reference
        },
        payment: {
          product: 'Airtel Money',
          productId: 'AIRTEL_MONEY'
        }
      };

      const response = await this.client.post('/collection', payload);
      return {
        success: true,
        transactionId: response.data.data.transaction.id,
        status: response.data.data.status,
        message: response.data.message
      };
    } catch (error) {
      console.error('Airtel Money payment error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment failed'
      };
    }
  }

  async verifyPayment(transactionId) {
    try {
      const response = await this.client.get(`/collection/${transactionId}`);
      return {
        success: true,
        status: response.data.data.status,
        amount: response.data.data.transaction.amount,
        currency: response.data.data.transaction.currency
      };
    } catch (error) {
      console.error('Airtel Money verification error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Verification failed'
      };
    }
  }
}

// MTN Mobile Money API integration
class MTNMobileMoneyService {
  constructor() {
    this.apiKey = process.env.MTN_MOBILE_MONEY_API_KEY;
    this.apiUrl = process.env.MTN_MOBILE_MONEY_API_URL;
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Reference-Id': this.generateReferenceId(),
        'X-Target-Environment': 'sandbox' // Change to 'live' for production
      }
    });
  }

  generateReferenceId() {
    return 'ref-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  async initiatePayment(phoneNumber, amount, reference, description) {
    try {
      const payload = {
        amount: amount.toString(),
        currency: 'UGX',
        externalId: reference,
        payer: {
          partyIdType: 'MSISDN',
          partyId: phoneNumber
        },
        payerMessage: description,
        payeeNote: description
      };

      const response = await this.client.post('/collection/v1_0/requesttopay', payload);
      return {
        success: true,
        transactionId: response.data.referenceId,
        status: 'PENDING',
        message: 'Payment request sent successfully'
      };
    } catch (error) {
      console.error('MTN Mobile Money payment error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment failed'
      };
    }
  }

  async verifyPayment(transactionId) {
    try {
      const response = await this.client.get(`/collection/v1_0/requesttopay/${transactionId}`);
      return {
        success: true,
        status: response.data.status,
        amount: response.data.amount,
        currency: response.data.currency
      };
    } catch (error) {
      console.error('MTN Mobile Money verification error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Verification failed'
      };
    }
  }
}

// Payment service factory
class PaymentService {
  constructor() {
    this.airtelMoney = new AirtelMoneyService();
    this.mtnMobileMoney = new MTNMobileMoneyService();
  }

  async processPayment(paymentMethod, phoneNumber, amount, reference, description) {
    try {
      let result;

      switch (paymentMethod) {
        case 'airtel_money':
          result = await this.airtelMoney.initiatePayment(phoneNumber, amount, reference, description);
          break;
        case 'mtn_mobile_money':
          result = await this.mtnMobileMoney.initiatePayment(phoneNumber, amount, reference, description);
          break;
        default:
          return {
            success: false,
            error: 'Unsupported payment method'
          };
      }

      return result;
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: 'Payment processing failed'
      };
    }
  }

  async verifyPayment(paymentMethod, transactionId) {
    try {
      let result;

      switch (paymentMethod) {
        case 'airtel_money':
          result = await this.airtelMoney.verifyPayment(transactionId);
          break;
        case 'mtn_mobile_money':
          result = await this.mtnMobileMoney.verifyPayment(transactionId);
          break;
        default:
          return {
            success: false,
            error: 'Unsupported payment method'
          };
      }

      return result;
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: 'Payment verification failed'
      };
    }
  }

  // Calculate delivery fee based on distance
  calculateDeliveryFee(distance) {
    const baseFee = 2000; // 2000 UGX base fee
    const perKmFee = 500; // 500 UGX per km
    return Math.max(baseFee, baseFee + (distance * perKmFee));
  }

  // Calculate tax
  calculateTax(subtotal) {
    const taxRate = 0.18; // 18% VAT
    return subtotal * taxRate;
  }

  // Calculate total amount
  calculateTotal(subtotal, deliveryFee = 0, discount = 0) {
    const tax = this.calculateTax(subtotal);
    return subtotal + tax + deliveryFee - discount;
  }
}

module.exports = new PaymentService(); 