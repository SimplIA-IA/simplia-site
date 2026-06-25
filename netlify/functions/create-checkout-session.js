// Fonction serverless Netlify : crée une session de paiement Stripe Checkout
// en mode "embedded" (le formulaire de carte reste sur la page de SimplIA,
// aucune redirection vers un autre site).
//
// La clé secrète Stripe est lue depuis une variable d'environnement Netlify
// (jamais écrite en clair dans le code) : STRIPE_SECRET_KEY

const Stripe = require('stripe');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Méthode non autorisée' };
  }

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Le Déclic IA',
              description: "Guide PDF — comprendre l'IA et ses enjeux, sans jargon technique.",
            },
            unit_amount: 2499, // 24,99 € en centimes
          },
          quantity: 1,
        },
      ],
      return_url: 'https://simplia-ia.fr/merci?session_id={CHECKOUT_SESSION_ID}',
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientSecret: session.client_secret }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
