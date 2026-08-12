// Dynamically loads the Razorpay checkout script and returns a function
// that opens the checkout. Usage:
//   const openCheckout = useRazorpay()
//   openCheckout({ orderId, amount, ... })

import { useCallback } from 'react'

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

function loadScript() {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${SCRIPT_URL}"]`)) {
      return resolve(true) // already loaded
    }
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

const useRazorpay = () => {
  const openCheckout = useCallback(async ({
    orderId,
    amount,        // in paise
    currency = 'INR',
    key,
    name = 'KaamSetu',
    description,
    prefillName,
    prefillEmail,
    prefillContact,
    onSuccess,
    onError,
    onDismiss
  }) => {
    const loaded = await loadScript()
    if (!loaded || !window.Razorpay) {
      onError?.('Failed to load payment gateway. Please check your internet connection.')
      return
    }

    const options = {
      key,
      amount,
      currency,
      order_id: orderId,
      name,
      description: description || 'Job Payment via KaamSetu',
      image: '/logo192.png',
      prefill: {
        name: prefillName || '',
        email: prefillEmail || '',
        contact: prefillContact || ''
      },
      theme: { color: '#c8933a' },
      modal: {
        ondismiss: () => onDismiss?.()
      },
      handler: (response) => {
        // response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
        onSuccess?.(response)
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (response) => {
      onError?.(response.error?.description || 'Payment failed')
    })
    rzp.open()
  }, [])

  return openCheckout
}

export default useRazorpay
