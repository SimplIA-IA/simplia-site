// Vérifie qu'une session Stripe a bien été payée avant de révéler le lien
// de téléchargement du PDF — évite qu'un lien direct soit deviné/partagé
// sans paiement réel.

const Stripe = require('stripe');

exports.handler = async function (event) {
  try {
    const sessionId = event.queryStringParameters && event.queryStringParameters.session_id;
    if (!sessionId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'session_id manquant' }) };
    }

    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const paid = session.payment_status === 'paid';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paid }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
