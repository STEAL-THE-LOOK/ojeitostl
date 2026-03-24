export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !publicationId) {
    return res.status(500).json({
      message: 'Beehiiv integration is not configured on server',
    });
  }

  const {
    email,
    fullName,
    phone,
    profile,
    state,
    investmentMoment,
    consentEmail,
    source,
    submittedAt,
  } = req.body || {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Email is required' });
  }

  if (!consentEmail) {
    return res.status(400).json({ message: 'Consent is required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const trimmedName = typeof fullName === 'string' ? fullName.trim() : '';

  const customFields = [];

  const addCustomField = (name, value) => {
    if (!name || value === undefined || value === null || value === '') {
      return;
    }
    customFields.push({
      name: name,
      value: String(value),
    });
  };

  addCustomField('Nome Completo', trimmedName);
  addCustomField('WhatsApp', phone);
  addCustomField('Perfil', profile);
  addCustomField('Estado', state);
  addCustomField('Investimento', investmentMoment);
  addCustomField('Fonte', source);
  addCustomField('Submetido Em', submittedAt);

  const subscriptionPayload = {
    email: cleanEmail,
    reactivate_existing: true,
    send_welcome_email: true,
    utm_source: source || 'ojeitostl_waitlist_modal',
    referring_site: 'ojeitostl.com.br',
  };

  if (customFields.length > 0) {
    subscriptionPayload.custom_fields = customFields;
  }

  try {
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionPayload),
      }
    );

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Beehiiv API Error:', responseData);
      return res.status(response.status).json({
        message: responseData.message || 'Beehiiv subscription failed',
        details: responseData,
      });
    }

    return res.status(201).json({
      success: true,
      id: responseData?.data?.id || null,
      status: responseData?.data?.status || null,
    });
  } catch (error) {
    console.error('Handler Error:', error);
    return res.status(500).json({
      message: 'Unexpected error while sending data to Beehiiv',
      error: error instanceof Error ? error.message : 'unknown_error',
    });
  }
}
