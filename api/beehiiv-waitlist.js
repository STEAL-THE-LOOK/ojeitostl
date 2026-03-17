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
      missing: {
        BEEHIIV_API_KEY: !apiKey,
        BEEHIIV_PUBLICATION_ID: !publicationId,
      },
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

  const addCustomField = (fieldId, value) => {
    if (!fieldId || !value) {
      return;
    }

    customFields.push({
      custom_field_id: fieldId,
      value,
    });
  };

  addCustomField(process.env.BEEHIIV_CF_FULL_NAME_ID, trimmedName);
  addCustomField(process.env.BEEHIIV_CF_PHONE_ID, phone);
  addCustomField(process.env.BEEHIIV_CF_PROFILE_ID, profile);
  addCustomField(process.env.BEEHIIV_CF_STATE_ID, state);
  addCustomField(process.env.BEEHIIV_CF_INVESTMENT_ID, investmentMoment);
  addCustomField(process.env.BEEHIIV_CF_SOURCE_ID, source);
  addCustomField(process.env.BEEHIIV_CF_SUBMITTED_AT_ID, submittedAt);

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
    return res.status(500).json({
      message: 'Unexpected error while sending data to Beehiiv',
      error: error instanceof Error ? error.message : 'unknown_error',
    });
  }
}
