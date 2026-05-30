import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { typescript: true } as any);

async function run() {
  try {
    const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded",
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "ReviewPilot Pro",
                        description: "Automated AI Google Review Replies",
                    },
                    unit_amount: 2900,
                    recurring: { interval: "month" },
                },
                quantity: 1,
            },
        ],
        mode: "subscription",
        automatic_payment_methods: { enabled: true },
        return_url: `http://localhost:3000/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    });
    console.log("Success", session.client_secret);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
