import api from './api';

export type AnalyticsEventType =
  | 'page_view'
  | 'scheme_list_view'
  | 'scheme_detail_view'
  | 'apply_button_click'
  | 'application_started'
  | 'application_submitted'
  | 'external_link_click'
  | 'login_success'
  | 'registration_success';

interface EventPayload {
  route?: string;
  scheme_id?: string;
  campaign_id?: string;
  label?: string;
}

// Memory cache to deduplicate rapid duplicate page views (e.g. React StrictMode)
const recentEventsCache = new Map<string, number>();

/**
 * Returns a persistent pseudonymous session ID for the current browser session.
 * Does not store any personal identity, IP address, or device fingerprint.
 */
export const getSessionId = (): string => {
  try {
    let sessId = sessionStorage.getItem('gramai_session_id');
    if (!sessId) {
      sessId = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      sessionStorage.setItem('gramai_session_id', sessId);
    }
    return sessId;
  } catch {
    return 'sess_ephemeral';
  }
};

/**
 * Sends a privacy-preserving first-party analytics event to the GramAI backend.
 * Fails silently to never interrupt user interaction.
 */
export const trackEvent = async (
  eventType: AnalyticsEventType,
  payload: EventPayload = {}
): Promise<void> => {
  try {
    const route = payload.route || (typeof window !== 'undefined' ? window.location.pathname : undefined);
    const dedupKey = `${eventType}:${route}:${payload.scheme_id || ''}`;
    const now = Date.now();
    const lastTime = recentEventsCache.get(dedupKey);

    // Suppress duplicate events of the exact same type/route triggered within 1.5 seconds
    if (lastTime && now - lastTime < 1500) {
      return;
    }
    recentEventsCache.set(dedupKey, now);

    const sessionId = getSessionId();

    await api.post('/analytics/events', {
      event_type: eventType,
      route,
      scheme_id: payload.scheme_id,
      campaign_id: payload.campaign_id,
      session_id: sessionId,
      label: payload.label ? payload.label.slice(0, 255) : undefined,
    });
  } catch (err) {
    // Non-blocking telemetry
    console.debug('Analytics telemetry error:', err);
  }
};

export const trackPageView = (route?: string) => {
  return trackEvent('page_view', { route });
};

export const trackSchemeListView = () => {
  return trackEvent('scheme_list_view', { route: '/dashboard/schemes' });
};

export const trackSchemeDetailView = (schemeId: string, schemeName?: string) => {
  return trackEvent('scheme_detail_view', {
    scheme_id: schemeId,
    label: schemeName,
    route: `/dashboard/schemes/${schemeId}`,
  });
};

export const trackApplyClick = (schemeId: string, schemeName?: string) => {
  return trackEvent('apply_button_click', {
    scheme_id: schemeId,
    label: schemeName,
    route: `/dashboard/schemes/${schemeId}`,
  });
};

export const trackApplicationStarted = (schemeId: string, schemeName?: string) => {
  return trackEvent('application_started', {
    scheme_id: schemeId,
    label: schemeName,
  });
};

export const trackApplicationSubmitted = (schemeId: string, applicationId?: string) => {
  return trackEvent('application_submitted', {
    scheme_id: schemeId,
    label: applicationId ? `App: ${applicationId}` : undefined,
  });
};

export const trackExternalLinkClick = (url: string, label?: string) => {
  return trackEvent('external_link_click', {
    label: label || url,
  });
};

export const trackLoginSuccess = () => {
  return trackEvent('login_success');
};

export const trackRegistrationSuccess = () => {
  return trackEvent('registration_success');
};
