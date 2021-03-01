/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51IQALjIkK4PFwWmaOJLe1ALJMGiJVhkW1VLUIeNQNvvfGMP9Uc6x3TDAKMNxiX6SDrnE2XJ5LYrkECGQxZmyEYQj00Uc6AFjm9'
    );
    // 1) get checkout session from api
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );

    // 2) create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
